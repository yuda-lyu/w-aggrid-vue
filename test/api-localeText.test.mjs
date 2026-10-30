//opt.localeText 之查找順序與型別檢核(Gitea issue #26; 規則帳本 R24)
//api 層: 宿主按鈕呼叫 ag-grid 公開之 getGridOption('getLocaleText')(元件交給 ag-grid 的文字掛鉤, ag-grid 取任何文字皆走這條路徑)並記錄回傳; 不經使用者操作
//golden: 「未給 localeText 時行為不變」之期望值取自修前(HEAD)dist 對同一組鍵的實際回傳(2026-10-30 探測, tmp/run01/probe-head.json), 非由新碼推得
import assert from 'assert'
import { openPage, pageUrl, runHostCase, typeIntoFloatingFilter, assertNoErrors } from './tools/e2e-setup.mjs'
import { waitUntilExist } from './tools/e2eLib.mjs'

//KEYS, golden 的鍵集合(含 ag-grid 取過的各類鍵與一個未知鍵; 未知鍵回傳 ag-grid 給的 defaultValue)
const KEYS = ['selectAll', 'filterOoo', 'equals', 'contains', 'loadingOoo', 'noRowsToShow', 'noMatches', 'zzUnknownKey']
const GOLDEN = {
    'zh-tw': ['（全選）', '篩選...', '等於', '包含', '載入中...', '無資料可顯示', '無符合項目', 'DEF-zzUnknownKey'],
    'en': ['(Select All)', 'Filter...', 'Equals', 'Contains', 'Loading...', 'No Rows To Show', 'No matches', 'DEF-zzUnknownKey'],
    'zh-cn': ['（全选）', '筛选...', '等于', '包含', '载入中...', '无数据可显示', '无符合项目', 'DEF-zzUnknownKey'],
}

//ltMany, 宿主按鈕呼叫某表的文字掛鉤取多個鍵之文字(各鍵之 defaultValue 為 DEF-<鍵>, 與 golden 一致)
async function ltMany(ctx, name, ref, keys) {
    await ctx.page.evaluate(({ n, r, ks }) => {
        window.__cases[n] = [r, 'ltMany', ks.map((k) => [k, 'DEF-' + k])]
    }, { n: name, r: ref, ks: keys })
    const r = await runHostCase(ctx, name, { outTimeout: 8000, noDownloadMs: 0 })
    assert.ok(!r.out.threw, r.out.err)
    return r.out.ret
}

describe('api-localeText:localeText 之查找順序與型別檢核', function() {
    let ctx = null

    afterEach(async function() {
        if (ctx) {
            await ctx.close()
        }
        ctx = null
    })

    it('AL1 未給 localeText:三語系對 8 個鍵之回傳與修前相同(未給時行為不變)', async function() {
        ctx = await openPage(`${pageUrl('overlay.html')}?g=o5,o8,o9`)
        //spec: 未給時行為不變
        assert.deepStrictEqual(await ltMany(ctx, 'AL1_zhtw', 'o5', KEYS), GOLDEN['zh-tw'])
        assert.deepStrictEqual(await ltMany(ctx, 'AL1_en', 'o8', KEYS), GOLDEN.en)
        assert.deepStrictEqual(await ltMany(ctx, 'AL1_zhcn', 'o9', KEYS), GOLDEN['zh-cn'])
        assertNoErrors(ctx)
    })

    it('AL2 覆寫字典優先於內建字典; 未覆寫之鍵走內建; 未知鍵回傳 defaultValue', async function() {
        ctx = await openPage(`${pageUrl('overlay.html')}?g=o7`)
        //o7 的 localeText = { noRowsToShow:'無數據', noRowsToShowFiltered:'無查詢結果，請更換關鍵字或查詢條件。', filterOoo:'請輸入條件' }
        const ret = await ltMany(ctx, 'AL2', 'o7', KEYS)
        //spec: 查找順序為先覆寫字典、查無再走 getLangText
        assert.deepStrictEqual(ret, ['（全選）', '請輸入條件', '等於', '包含', '載入中...', '無數據', '無符合項目', 'DEF-zzUnknownKey'])
        assertNoErrors(ctx)
    })

    it('AL3 直接取 noRowsToShowFiltered:未覆寫為內建、覆寫則為覆寫值; 與表格是否正在過濾無關', async function() {
        ctx = await openPage(`${pageUrl('overlay.html')}?g=o5,o7,o8,o9`)
        //spec: 內建預設文字 zh-tw「無符合過濾條件之資料」, en、zh-cn 各自一份
        assert.deepStrictEqual(await ltMany(ctx, 'AL3a', 'o5', ['noRowsToShowFiltered']), ['無符合過濾條件之資料'])
        assert.deepStrictEqual(await ltMany(ctx, 'AL3b', 'o8', ['noRowsToShowFiltered']), ['No Rows Match The Filter'])
        assert.deepStrictEqual(await ltMany(ctx, 'AL3c', 'o9', ['noRowsToShowFiltered']), ['无符合过滤条件的数据'])
        assert.deepStrictEqual(await ltMany(ctx, 'AL3d', 'o7', ['noRowsToShowFiltered']), ['無查詢結果，請更換關鍵字或查詢條件。'])
        assertNoErrors(ctx)
    })

    it('AL4 localeText 非物件或值非字串:該鍵用內建; 空字串為有效覆寫', async function() {
        ctx = await openPage(`${pageUrl('overlay.html')}?g=o10,o11`)
        //o10: localeText='abc' → 全部內建
        assert.deepStrictEqual(await ltMany(ctx, 'AL4a', 'o10', KEYS), GOLDEN['zh-tw'])
        //o11: noRowsToShow=123(無效 → 內建)、filterOoo='篩選條件'(有效)、loadingOoo=''(有效之空字串)
        const ret = await ltMany(ctx, 'AL4b', 'o11', KEYS)
        assert.deepStrictEqual(ret, ['（全選）', '篩選條件', '等於', '包含', '', '無資料可顯示', '無符合項目', 'DEF-zzUnknownKey'])
        assertNoErrors(ctx)
    })

    it('AL5 表格處於過濾 0 筆狀態時, ag-grid 取 noRowsToShow 得到過濾 0 筆文字; 清空後恢復; 關閉選項則恆為 noRowsToShow', async function() {
        ctx = await openPage(`${pageUrl('overlay.html')}?g=o5,o6`)
        const { page } = ctx
        //過濾前
        assert.deepStrictEqual(await ltMany(ctx, 'AL5a', 'o5', ['noRowsToShow']), ['無資料可顯示'])
        //過濾成 0 筆(真鍵盤)
        await typeIntoFloatingFilter(page, '#o5', 1, 'zzz')
        await typeIntoFloatingFilter(page, '#o6', 1, 'zzz')
        await waitUntilExist(page, 'o5、o6 皆 0 列', () => document.querySelectorAll('#o5 .ag-center-cols-container .ag-row').length === 0 && document.querySelectorAll('#o6 .ag-center-cols-container .ag-row').length === 0, { timeout: 8000 })
        //spec: 資料列數 > 0 而顯示列數為 0 時, 空表覆蓋層用另一鍵
        assert.deepStrictEqual(await ltMany(ctx, 'AL5b', 'o5', ['noRowsToShow']), ['無符合過濾條件之資料'])
        assert.deepStrictEqual(await ltMany(ctx, 'AL5c', 'o6', ['noRowsToShow']), ['無資料可顯示'])
        //清空後恢復
        await typeIntoFloatingFilter(page, '#o5', 1, '')
        await waitUntilExist(page, 'o5 恢復 3 列', () => document.querySelectorAll('#o5 .ag-center-cols-container .ag-row').length === 3, { timeout: 8000 })
        assert.deepStrictEqual(await ltMany(ctx, 'AL5d', 'o5', ['noRowsToShow']), ['無資料可顯示'])
        assertNoErrors(ctx)
    })

    it('AL6 無效選項於掛載時提示且恰一次: localeText 非物件 1 則、showOverlayWhenFilteredEmpty 非布林值 1 則; 有效設定不提示', async function() {
        ctx = await openPage(`${pageUrl('overlay.html')}?g=o5,o7,o10`)
        const w = ctx.logs.map((m) => m.text).filter((t) => t.startsWith('[w-aggrid-vue]'))
        assert.deepStrictEqual(w.filter((t) => t.includes('opt.localeText')), ['[w-aggrid-vue] opt.localeText is invalid[abc], use default {}'])
        assert.deepStrictEqual(w.filter((t) => t.includes('opt.showOverlayWhenFilteredEmpty')), ['[w-aggrid-vue] opt.showOverlayWhenFilteredEmpty is invalid[no], use default true'])
        assert.strictEqual(w.length, 2, JSON.stringify(w))
        assertNoErrors(ctx)
    })

    it('AL7 執行中變更 opt.localeText 與 language:文字掛鉤的回傳隨之更新(覆寫字典非掛載時一次性快照)', async function() {
        ctx = await openPage(`${pageUrl('overlay.html')}?g=o14`)
        const { page } = ctx
        assert.deepStrictEqual(await ltMany(ctx, 'AL7a', 'o14', ['noRowsToShowFiltered', 'filterOoo']), ['無符合過濾條件之資料', '篩選...'])
        await page.click('#btnLocale14')
        //偵測等待: 文字掛鉤的回傳已反映新 opt(宿主更換 opt 後元件於下一輪更新才套用)
        await waitUntilExist(page, 'o14 之 localeText 已更新', () => window.__vm.$refs.o14.getApi().getGridOption('getLocaleText')({ key: 'noRowsToShowFiltered', defaultValue: 'DEF' }) === '換新文字:查無符合者', { timeout: 8000 })
        assert.deepStrictEqual(await ltMany(ctx, 'AL7b', 'o14', ['noRowsToShowFiltered', 'filterOoo']), ['換新文字:查無符合者', '篩選...'])
        await page.click('#btnLang14')
        await waitUntilExist(page, 'o14 之 language 已更新', () => window.__vm.$refs.o14.getApi().getGridOption('getLocaleText')({ key: 'filterOoo', defaultValue: 'DEF' }) === 'Filter...', { timeout: 8000 })
        //覆寫字典仍在(優先), 未覆寫之 filterOoo 改用 en 內建
        assert.deepStrictEqual(await ltMany(ctx, 'AL7c', 'o14', ['noRowsToShowFiltered', 'filterOoo']), ['換新文字:查無符合者', 'Filter...'])
        assertNoErrors(ctx)
    })
})
