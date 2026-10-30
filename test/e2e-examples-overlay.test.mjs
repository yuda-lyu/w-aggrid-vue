//官方範例 localeText、showOverlayWhenFilteredEmpty(對外文件; 規則帳本 R18、R24、R25; Gitea issue #26)
//使用者路徑: ①開範例頁(依 gExtractHtml、gDocExams 之作法自 src 當場產製, CDN 資源一律路由至本機, w-aggrid-vue 為本地 dist; 同形性見 unit-appExamples 之 BLD1)
//②無操作: 範例於掛載後自行執行(1 秒時表頭過濾使顯示列數為 0, 2 或 3 秒時清除過濾, localeText 範例於 3 秒時再清空數據) ③看到說明文字、表格與覆蓋層文字
//④以頁內 MutationObserver 於頁面載入前即開始記錄「各表之顯示列數與覆蓋層可見文字」之歷程, 事後逐項比對順序(不以時間窗斷言, 不受負載下計時器延遲影響) ⑤比對說明文字(含破壞性變更)與歷程 ⑥無副作用
import assert from 'assert'
import { openPage, useTmpDir, assertNoErrors, assertExamplePage } from './tools/e2e-setup.mjs'
import { pollUntil } from './tools/e2eLib.mjs'
import { buildExample } from './tools/exampleBuild.mjs'

const VIEW = { width: 1400, height: 900 }

//內建文字(zh-tw)
const T_EMPTY = '無資料可顯示'
const T_FILTERED = '無符合過濾條件之資料'

//範例 localeText 之覆寫文字(見 src/AppLocaleText.vue 之 opt.localeText 與說明文字)
const T_EMPTY_OVERRIDE = '無數據'
const T_FILTERED_OVERRIDE = '無查詢結果，請更換關鍵字或查詢條件。'

//recorder, 於頁面載入前注入: 頁內記錄各表(.ag-root-wrapper 依文件順序)之顯示列數與本表覆蓋層之可見文字
//覆蓋層顯示但文字尚空者記為 '(blank)', 隱藏者記為 ''; 狀態改變才新增一筆
function recorder() {
    window.__tl = []
    window.__tlk = ''
    let snap = () => {
        let ts = Array.from(document.querySelectorAll('.ag-root-wrapper')).map((root) => {
            let rows = root.querySelectorAll('.ag-center-cols-container .ag-row').length
            let ov = root.querySelector('.ag-root > .ag-overlay')
            let shown = !!ov && !ov.classList.contains('ag-hidden')
            let wrap = shown ? ov.querySelector('.ag-overlay-wrapper') : null
            let text = wrap ? wrap.innerText.trim() : ''
            return { rows, ov: shown ? (text === '' ? '(blank)' : text) : '' }
        })
        let k = JSON.stringify(ts)
        if (k !== window.__tlk) {
            window.__tlk = k
            window.__tl.push(ts)
        }
    }
    new MutationObserver(snap).observe(document, { subtree: true, childList: true, attributes: true, characterData: true })
}

//column, 歷程中某表之各筆狀態(表尚未建立之早期紀錄為空陣列, 略過)
function column(tl, idx) {
    return tl.map((ts) => ts[idx]).filter(Boolean)
}

//matchSeq, 歷程中是否依序出現某表之各狀態; 狀態 { rows: 'pos'|'zero', ov: 文字(空字串為未顯示) }
function matchSeq(tl, idx, steps) {
    let i = 0
    for (let ts of tl) {
        let t = ts[idx]
        if (!t || i >= steps.length) {
            continue
        }
        let s = steps[i]
        if ((s.rows === 'zero' ? t.rows === 0 : t.rows > 0) && t.ov === s.ov) {
            i++
        }
    }
    return i === steps.length
}

describe('e2e-examples-overlay:官方範例 localeText、showOverlayWhenFilteredEmpty', function() {
    let tmp = useTmpDir('e2e-examples-overlay')
    let pages = {}
    let ctx = null

    before(async function() {
        tmp.make()
        pages.localeText = await buildExample('AppLocaleText.vue', tmp.dir)
        pages.showOverlay = await buildExample('AppShowOverlayWhenFilteredEmpty.vue', tmp.dir)
    })

    afterEach(async function() {
        if (ctx) {
            await ctx.close()
        }
        ctx = null
    })

    after(function() {
        tmp.clean()
    })

    //openExample, 開範例頁並於載入前注入記錄器; 只等首批儲存格出現(範例自帶計時器, 等靜止會錯過中間狀態)
    function openExample(p) {
        return openPage(p.url, { routeExternalResources: true, viewport: VIEW, idle: false, initScript: recorder })
    }

    //timeline, 取頁內歷程
    function timeline(page) {
        return page.evaluate(() => window.__tl)
    }

    //waitSeq, 偵測等待歷程依序出現各狀態(終態出現時前面各態必已記錄); 逾時附當下歷程
    async function waitSeq(page, idx, steps, label) {
        try {
            await pollUntil(label, async () => matchSeq(await timeline(page), idx, steps), { timeout: 30000, interval: 200 })
        }
        catch (err) {
            throw new Error(`${err.message}; 歷程 ${JSON.stringify(await timeline(page))}`)
        }
    }

    //colsVisible, 各表之欄數與表頭各欄之右緣是否皆在表格外框內(欄未被表格寬度截掉)
    function colsVisible(page) {
        return page.evaluate(() => Array.from(document.querySelectorAll('.ag-root-wrapper')).map((root) => {
            let rr = root.getBoundingClientRect()
            let hs = Array.from(root.querySelectorAll('.ag-header-row-column .ag-header-cell')).map((h) => h.getBoundingClientRect())
            return { n: hs.length, inside: Math.max(...hs.map((r) => r.right)) <= rr.right + 0.5 }
        }))
    }

    it('EXO1 ex-localeText:標題與連結、說明文字(含破壞性變更與恢復舊行為之方法)(R18)', async function() {
        ctx = await openExample(pages.localeText)
        await assertExamplePage(ctx.page, 'localeText', 'localeText')
        assert.deepStrictEqual(await colsVisible(ctx.page), [{ n: 3, inside: true }])
        let desc = await ctx.page.locator('#ckdesc').innerText()
        //說明文字須載明: 查找順序、兩個鍵、破壞性變更(預設開啟)與恢復舊行為之方法
        for (let s of ['opt.localeText', 'opt.language', 'noRowsToShow', 'noRowsToShowFiltered', '破壞性變更', 'opt.showOverlayWhenFilteredEmpty = false']) {
            assert.ok(desc.includes(s), `說明文字應含 ${s}`)
        }
        assertNoErrors(ctx)
    })

    it('EXO2 ex-localeText:覆寫文字生效 — 有數據無覆蓋層 → 過濾 0 筆顯示覆寫之 noRowsToShowFiltered → 清除過濾後隱藏 → 數據清空顯示覆寫之 noRowsToShow; 內建文字從未出現(R24)', async function() {
        ctx = await openExample(pages.localeText)
        //說明文字之時序: 0 秒有數據 → 1 秒過濾 0 筆 → 2 秒清除過濾 → 3 秒數據清空
        await waitSeq(ctx.page, 0, [
            { rows: 'pos', ov: '' },
            { rows: 'zero', ov: T_FILTERED_OVERRIDE },
            { rows: 'pos', ov: '' },
            { rows: 'zero', ov: T_EMPTY_OVERRIDE },
        ], '歷程依序為 有數據、過濾 0 筆(覆寫文字)、清除過濾、數據清空(覆寫文字)')
        //覆寫後, 內建文字不應在任何時刻出現
        let col = column(await timeline(ctx.page), 0)
        let texts = col.map((t) => t.ov)
        assert.ok(!texts.includes(T_EMPTY) && !texts.includes(T_FILTERED), `內建文字不應出現: ${JSON.stringify(texts)}`)
        //終態: 數據清空, 覆蓋層可見文字為覆寫之 noRowsToShow, 且 #ckmsg 為最後一步
        assert.deepStrictEqual(col[col.length - 1], { rows: 0, ov: T_EMPTY_OVERRIDE })
        assert.ok((await ctx.page.locator('#ckmsg').innerText()).startsWith('3s:'))
        assertNoErrors(ctx)
    })

    it('EXO3 ex-showOverlayWhenFilteredEmpty:標題與連結、說明文字(含破壞性變更、預設值與恢復舊行為之方法)(R18)', async function() {
        ctx = await openExample(pages.showOverlay)
        await assertExamplePage(ctx.page, 'showOverlayWhenFilteredEmpty', 'showOverlayWhenFilteredEmpty')
        let desc = await ctx.page.locator('#ckdesc').innerText()
        for (let s of ['opt.showOverlayWhenFilteredEmpty', '預設 true', 'noRowsToShowFiltered', 'filterall', '破壞性變更', '預設開啟', 'opt.showOverlayWhenFilteredEmpty = false']) {
            assert.ok(desc.includes(s), `說明文字應含 ${s}`)
        }
        //左右兩表標示其設定
        let labels = await ctx.page.evaluate(() => ['#tblOn', '#tblOff'].map((s) => document.querySelector(s).innerText.split('\n')[0].trim()))
        assert.deepStrictEqual(labels, ['showOverlayWhenFilteredEmpty: true(default)', 'showOverlayWhenFilteredEmpty: false'])
        //兩表之三個欄(make、model、price)皆完整可見, 不被表格寬度截掉(固定寬 620px, 同其他範例)
        assert.deepStrictEqual(await colsVisible(ctx.page), [{ n: 3, inside: true }, { n: 3, inside: true }])
        assertNoErrors(ctx)
    })

    it('EXO4 ex-showOverlayWhenFilteredEmpty:左表(預設)過濾 0 筆顯示內建「無符合過濾條件之資料」後隨清除而隱藏; 右表(false)同樣過濾 0 筆但始終無覆蓋層(R25)', async function() {
        ctx = await openExample(pages.showOverlay)
        await waitSeq(ctx.page, 0, [
            { rows: 'pos', ov: '' },
            { rows: 'zero', ov: T_FILTERED },
            { rows: 'pos', ov: '' },
        ], '左表(預設)歷程依序為 有數據、過濾 0 筆(內建文字)、清除過濾')
        //右表須也走完 有數據 → 0 列 → 有數據(否則「始終無覆蓋層」為空洞斷言), 且始終無覆蓋層
        await waitSeq(ctx.page, 1, [
            { rows: 'pos', ov: '' },
            { rows: 'zero', ov: '' },
            { rows: 'pos', ov: '' },
        ], '右表(false)歷程依序為 有數據、過濾 0 筆(無覆蓋層)、清除過濾')
        let tl = await timeline(ctx.page)
        let off = column(tl, 1).map((t) => t.ov)
        assert.ok(off.length > 0 && off.every((s) => s === ''), `右表(false)不應顯示覆蓋層: ${JSON.stringify(off)}`)
        //左表: 過濾 0 筆時之覆蓋層文字為內建之 noRowsToShowFiltered, 非 noRowsToShow
        let on = column(tl, 0).map((t) => t.ov)
        assert.ok(!on.includes(T_EMPTY), `左表不應顯示 noRowsToShow: ${JSON.stringify(on)}`)
        assert.ok((await ctx.page.locator('#ckmsg').innerText()).startsWith('3s:'))
        assertNoErrors(ctx)
    })
})
