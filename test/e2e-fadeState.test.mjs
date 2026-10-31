//表格淡入與根節點 state 屬性(規則帳本 R26, Gitea issue #31)
//使用者路徑: ①開宿主頁(置中容器內 7 欄 6 列表格, 表格建立後容器以 CSS 過場移動並改寬, 宿主頁於 window.__log 記錄 state 屬性、外層容器 opacity、過場事件、尺寸變化與 api.refreshCells 之時刻)
//②等 [state="shown"] ③看到表格於淡入結束後(且尺寸穩定後)才為 shown, 淡入期間改寬者已補繪一次 ④無輸入(改寬等為宿主頁自帶計時行為, 即本檔要驗之情境) ⑤截取表格, 多次全新頁面之結果須相同 ⑥無副作用
//宿主頁(test/pages/fade.html)之網址參數見該頁註解; 時間門檻取自 spec: 淡入 0.5 秒、後備輪詢自就緒 0.8 秒起每 50ms 至多再等 3 秒、尺寸穩定之去抖動 0.35 秒
import assert from 'assert'
import crypto from 'crypto'
import { pageUrl } from './tools/e2e-setup.mjs'
import { launchBrowser, openCasePage, waitUntilExist, waitGridIdle } from './tools/e2eLib.mjs'

const VIEWPORT = { width: 1600, height: 900 }


//openFade, 每案例新瀏覽器與新頁面(launchBrowser 六旗標), 開宿主頁後不等表格(各案例自行等待所需之訊號, 淡入中銷毀者表格可能來不及出現)
async function openFade(query = '') {
    let browser = await launchBrowser()
    let ctx = {
        browser,
        page: null,
        logs: [],
        pageErrors: [],
        close: async () => {
            await browser.close()
        },
    }
    try {
        let page = await openCasePage(browser, { contextOptions: { viewport: VIEWPORT } })
        ctx.page = page
        page.on('console', (m) => ctx.logs.push({ type: m.type(), text: m.text() }))
        page.on('pageerror', (e) => ctx.pageErrors.push(String(e)))
        await page.goto(pageUrl('fade.html') + (query ? `?${query}` : ''))
    }
    catch (err) {
        await browser.close()
        throw err
    }
    return ctx
}


//openBrowser, 只要瀏覽器(像素組別自行開全新頁面)
async function openBrowser() {
    let browser = await launchBrowser()
    return {
        browser,
        close: async () => {
            await browser.close()
        },
    }
}


//getLog, 宿主頁記錄(JSON 化後回到本 realm)
function getLog(page) {
    return page.evaluate(() => JSON.parse(JSON.stringify(window.__log)))
}


//waitState, 等根節點 state 屬性為指定值
function waitState(page, state, timeout = 15000) {
    return waitUntilExist(page, `根節點 state="${state}"`, (s) => {
        let r = document.querySelector('.CompCssWAggridVue')
        return !!r && r.getAttribute('state') === s
    }, { arg: state, timeout })
}


//waitLog, 等宿主頁記錄的某欄位已有值(改寬時刻、容器過場結束時刻等)
function waitLog(page, label, key, timeout = 15000) {
    return waitUntilExist(page, label, (k) => window.__log[k] !== null, { arg: key, timeout })
}


//quiet, 否定斷言用之短暫觀察窗(終態達成後再觀察此毫秒數, 確認未再發生不該發生之事)
function quiet(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms))
}


//opacityEnd, 外層容器 opacity 過場結束之時刻(transitionend)
function opacityEnd(log) {
    let e = log.tEnds.find((v) => v.type === 'transitionend' && v.prop === 'opacity')
    assert.ok(e, `未收到外層容器 opacity 之 transitionend: ${JSON.stringify(log.tEnds)}`)
    return e.t
}


//markNodes, 為資料區(.ag-center-cols-container)內之每個元素與文字節點各加一個標記(refreshCells({ force: true }) 對本元件之儲存格〔皆有 cellRenderer,函數型 renderer 由 ag-grid 包成 Adapter,refresh 恆回 false〕為銷毀 renderer 再建新的 span 與其文字節點, 故元素與文字節點皆須標記; 有效性見 FD7)
function markNodes(page) {
    return page.evaluate(() => {
        let n = 0
        let w = document.createTreeWalker(document.querySelector('.ag-center-cols-container'), NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT)
        while (w.nextNode()) {
            w.currentNode.__agg31 = true
            n++
        }
        return n
    })
}


//countUnmarked, 資料區內無標記之節點數(標記後新建者)
function countUnmarked(page) {
    return page.evaluate(() => {
        let total = 0
        let unmarked = 0
        let w = document.createTreeWalker(document.querySelector('.ag-center-cols-container'), NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT)
        while (w.nextNode()) {
            total++
            if (!w.currentNode.__agg31) {
                unmarked++
            }
        }
        return { total, unmarked }
    })
}


//lastResizeBefore, 補繪(時刻 t)之前,宿主頁 ResizeObserver 記錄到的最後一次尺寸變化時刻
function lastResizeBefore(log, t) {
    return Math.max(...log.resizes.filter((v) => v.t < t).map((v) => v.t))
}


//shotKinds, 以 n 個全新頁面(同一瀏覽器, 每輪新 context)各截一次表格, 回傳 { md5 前 8 碼: 次數 }
//比對採同機同旗標下之逐 byte 雜湊: 本案例要驗的就是[淡入期間補繪之字形有次像素差異]是否消失, 容差比對會掩蓋此差異(差異約 180 個像素), 且不存標準圖
async function shotKinds(browser, query, n) {
    let kp = {}
    for (let i = 0; i < n; i++) {
        let page = await openCasePage(browser, { contextOptions: { viewport: VIEWPORT } })
        await page.goto(pageUrl('fade.html') + (query ? `?${query}` : ''))
        //改寬已發生且容器過場已結束, 並且 state 為 shown(此後表格不再變動)
        await waitLog(page, '改寬時刻', 'widenAt')
        if (!/(^|&)tr=0(&|$)/.test(query)) {
            await waitLog(page, '容器寬度過場結束', 'hostEndAt')
        }
        await waitState(page, 'shown')
        await waitGridIdle(page, { minCells: 1, stableMs: 500 })
        let buf = await page.locator('#grid').screenshot()
        let h = crypto.createHash('md5').update(buf).digest('hex').slice(0, 8)
        kp[h] = (kp[h] || 0) + 1
        await page.context().close()
    }
    return kp
}


describe('e2e-fadeState:表格淡入與根節點 state(R26)', function() {
    this.timeout(180000)
    let ctx = null

    afterEach(async function() {
        if (ctx) {
            await ctx.close()
        }
        ctx = null
    })

    it('FD1 初值為 showing, 淡入結束後為 shown, 單向轉換不回頭(state 值與轉換時點)', async function() {
        ctx = await openFade('widenAtFade=50')
        await waitState(ctx.page, 'shown')
        await quiet(300)
        let log = await getLog(ctx.page)
        //spec: 表格未就緒時為 showing; 淡入結束後為 shown; 之後不再回到 showing
        assert.deepStrictEqual(log.states.map((v) => v.state), ['showing', 'shown'], JSON.stringify(log.states))
        //初值記錄於元件掛載當下, 早於淡入開始(表格尚未就緒)
        assert.ok(log.fadeStartAt !== null && log.states[0].t < log.fadeStartAt, '初值 showing 應早於淡入開始')
        //時序(ms, 自頁面載入起算; 供調整本檔之時間前提)
        console.log('      [FD1 時序]', JSON.stringify({ mount: Math.round(log.states[0].t), fadeStart: Math.round(log.fadeStartAt), fadeEnd: Math.round(opacityEnd(log)), refresh: log.refreshes.map((v) => Math.round(v.t)), shown: Math.round(log.states[1].t), widen: Math.round(log.widenAt), resizes: log.resizes.length }))
        assert.strictEqual(ctx.pageErrors.length, 0, ctx.pageErrors.join('\n'))
    })

    it('FD2 shown 不早於淡入結束: 落定當下 opacity 為 1 且無進行中之 CSS 過場, 距淡入開始至少約 0.5 秒', async function() {
        ctx = await openFade('nowide=1')
        await waitState(ctx.page, 'shown')
        let log = await getLog(ctx.page)
        let shown = log.states.find((v) => v.state === 'shown')
        //spec: 淡入 0.5 秒, 結束後才為 shown
        assert.strictEqual(shown.opacity, '1', `落定當下 opacity: ${shown.opacity}`)
        assert.strictEqual(shown.anims, 0, '落定當下仍有進行中之 CSS 過場')
        assert.ok(shown.t - log.fadeStartAt >= 450, `淡入開始 ${log.fadeStartAt} 至 shown ${shown.t} 僅 ${shown.t - log.fadeStartAt}ms`)
        //淡入結束(transitionend)早於或等於 shown
        assert.ok(shown.t >= opacityEnd(log), 'shown 早於淡入結束')
        //淡入中(shown 之前)的任何時刻, 屬性值皆為 showing: 歷程只有 showing → shown
        assert.deepStrictEqual(log.states.map((v) => v.state), ['showing', 'shown'])
    })

    it('FD3 外層容器尚有他項 CSS 過場進行中: opacity 淡入結束時不算結束, 待全部過場結束(無進行中者)才為 shown', async function() {
        //bgAtFade: 淡入開始後 150ms 改外層容器背景色(容器為 transition:all, 背景色過場 0.5 秒, 結束晚於 opacity 淡入結束; 不改變任何尺寸)
        ctx = await openFade('bgAtFade=150&nowide=1')
        await waitState(ctx.page, 'shown')
        await quiet(300)
        let log = await getLog(ctx.page)
        let bgEnd = log.tEnds.find((v) => v.type === 'transitionend' && v.prop === 'background-color')
        let bgRun = log.tRuns.find((v) => v.prop === 'background-color')
        //前提: 背景色過場於 opacity 淡入結束前已開始、且結束晚於 opacity 淡入結束(否則本案例不具鑑別力; 主執行緒卡頓使背景色改動晚於淡入結束時前提不成立)
        assert.ok(bgRun && bgRun.t < opacityEnd(log), `前提不成立: 背景色過場須於 opacity 淡入結束前開始: ${JSON.stringify(log.tRuns)}`)
        assert.ok(bgEnd && bgEnd.t > opacityEnd(log), `前提不成立: 背景色過場結束須晚於 opacity 淡入結束: ${JSON.stringify(log.tEnds)}`)
        //spec: 外層容器無進行中之 CSS 過場才算淡入結束; 落定當下無任何進行中之過場
        let shown = log.states.find((v) => v.state === 'shown')
        assert.ok(shown.t >= bgEnd.t, `shown ${shown.t} 早於背景色過場結束 ${bgEnd.t}`)
        assert.strictEqual(shown.anims, 0, '落定當下仍有進行中之 CSS 過場')
        assert.strictEqual(shown.opacity, '1')
        //尺寸未變, 不補繪
        assert.strictEqual(log.refreshes.length, 0)
        assert.deepStrictEqual(log.states.map((v) => v.state), ['showing', 'shown'])
    })

    it('FD4 淡入期間改寬: 淡入結束且尺寸穩定後 refreshCells({ force: true }) 恰 1 次, 補繪完成後才為 shown', async function() {
        ctx = await openFade('widenAtFade=50')
        await waitState(ctx.page, 'shown')
        await quiet(600)
        let log = await getLog(ctx.page)
        //前提: 改寬發生於淡入期間
        assert.ok(log.widenAt >= log.fadeStartAt && log.widenAt < opacityEnd(log), `改寬 ${log.widenAt} 不在淡入期間 ${log.fadeStartAt}~${opacityEnd(log)}`)
        //spec: 自動 refreshCells({ force: true }) 一次
        assert.strictEqual(log.refreshes.length, 1, JSON.stringify(log.refreshes))
        let r = log.refreshes[0]
        assert.strictEqual(r.arg, '{"force":true}')
        //淡入結束後才補繪
        assert.ok(r.t > opacityEnd(log), '補繪早於淡入結束')
        //尺寸穩定後才補繪: 距最後一次尺寸變化至少 200ms(去抖動 350ms; 宿主頁之 ResizeObserver 可能記到 domDetect 因容差而不發之最後 1px; 此條在本案例因淡入結束晚於尺寸變化而必成立,去抖動長度之鑑別由 FD5 擔當)
        let lastResize = lastResizeBefore(log, r.t)
        assert.ok(r.t - lastResize >= 200, `補繪距最後一次尺寸變化僅 ${r.t - lastResize}ms`)
        //補繪完成後才為 shown
        assert.strictEqual(r.state, 'showing')
        let shown = log.states.find((v) => v.state === 'shown')
        assert.ok(shown.t >= r.t && shown.refreshes === 1, `shown ${shown.t} 補繪 ${r.t} 已補繪次數 ${shown.refreshes}`)
        assert.strictEqual(ctx.pageErrors.length, 0)
    })

    it('FD5 容器過場晚於淡入結束才停: 待容器過場結束且尺寸穩定後才補繪(恰 1 次), 之後才為 shown', async function() {
        //容器於淡入開始後 100ms 起改寬, 過場 1500ms, 結束時刻晚於淡入結束
        ctx = await openFade('widenAtFade=100&dur=1500')
        await waitState(ctx.page, 'shown')
        await quiet(600)
        let log = await getLog(ctx.page)
        //前提: 容器過場結束晚於淡入結束
        assert.ok(log.hostEndAt > opacityEnd(log), `前提不成立: 容器過場結束 ${log.hostEndAt}, 淡入結束 ${opacityEnd(log)}`)
        assert.strictEqual(log.refreshes.length, 1, JSON.stringify(log.refreshes))
        let r = log.refreshes[0]
        //補繪晚於容器過場結束, 且距最後一次尺寸變化至少 200ms(去抖動 350ms, 扣除宿主頁 ResizeObserver 記到 domDetect 因容差而不發之最後次像素變化)
        assert.ok(r.t > log.hostEndAt, `補繪 ${r.t} 早於容器過場結束 ${log.hostEndAt}`)
        let lastResize = lastResizeBefore(log, r.t)
        assert.ok(r.t - lastResize >= 200, `補繪距最後一次尺寸變化僅 ${r.t - lastResize}ms`)
        //補繪完成後才為 shown
        let shown = log.states.find((v) => v.state === 'shown')
        assert.ok(shown.t >= r.t && shown.refreshes === 1)
        assert.deepStrictEqual(log.states.map((v) => v.state), ['showing', 'shown'])
    })

    it('FD6 淡入期間尺寸未改變: 不補繪(refreshCells 0 次, 資料區無新建節點), 淡入結束即為 shown', async function() {
        ctx = await openFade('nowide=1')
        //儲存格就緒後(各儲存格之 renderer 已建立〔ag-grid 以 animation frame 任務分批建立〕且儲存格數穩定), 為資料區之每個節點(元素與文字節點)各加一個標記, 其後若有儲存格被重繪則會出現無標記之新節點(標記法之有效性見 FD7)
        await waitGridIdle(ctx.page, { minCells: 1, stableMs: 200 })
        await waitUntilExist(ctx.page, '各儲存格之 renderer 已建立', () => {
            let cells = Array.from(document.querySelectorAll('.ag-center-cols-container .ag-cell'))
            return cells.length > 0 && cells.every((c) => !!c.firstElementChild)
        })
        let nTag = await markNodes(ctx.page)
        assert.ok(nTag > 0, '前提不成立: 無儲存格節點')
        await waitState(ctx.page, 'shown')
        //否定斷言: 終態達成後再觀察 800ms(大於去抖動 350ms), 確認仍無補繪
        await quiet(800)
        let log = await getLog(ctx.page)
        assert.strictEqual(log.refreshes.length, 0, JSON.stringify(log.refreshes))
        let shown = log.states.find((v) => v.state === 'shown')
        assert.strictEqual(shown.refreshes, 0)
        assert.strictEqual(shown.opacity, '1')
        //spec(派工〈不得改變〉): 淡入期間無尺寸變化者不得多一次重繪 — 資料區節點皆為標記時之同一批, 無新建者
        assert.deepStrictEqual(await countUnmarked(ctx.page), { total: nTag, unmarked: 0 })
    })

    it('FD7 標記法之對照: 手動 refreshCells({ force: true }) 後資料區出現無標記之節點(FD6 以此法判定未重繪)', async function() {
        ctx = await openFade('nowide=1')
        await waitGridIdle(ctx.page, { minCells: 1, stableMs: 200 })
        await waitState(ctx.page, 'shown')
        await waitUntilExist(ctx.page, '各儲存格之 renderer 已建立', () => {
            let cells = Array.from(document.querySelectorAll('.ag-center-cols-container .ag-cell'))
            return cells.length > 0 && cells.every((c) => !!c.firstElementChild)
        })
        let nTag = await markNodes(ctx.page)
        assert.ok(nTag > 0)
        await ctx.page.evaluate(() => {
            window.__vm.$refs.g1.getApi().refreshCells({ force: true })
        })
        await quiet(200)
        let r = await countUnmarked(ctx.page)
        assert.ok(r.unmarked > 0, `重繪後應有新建之節點: ${JSON.stringify(r)}`)
    })

    it('FD8 淡入結束後才改寬: 先為 shown, 之後改寬不補繪', async function() {
        //widenAfterShown: state 落定為 shown 後 100ms 才改寬(確定發生於淡入結束之後)
        ctx = await openFade('widenAfterShown=100')
        await waitState(ctx.page, 'shown')
        await waitLog(ctx.page, '改寬時刻', 'widenAt')
        await waitLog(ctx.page, '容器寬度過場結束', 'hostEndAt')
        //否定斷言: 改寬過場結束後再觀察 800ms
        await quiet(800)
        let log = await getLog(ctx.page)
        let shown = log.states.find((v) => v.state === 'shown')
        assert.ok(shown.t < log.widenAt, `前提不成立: shown ${shown.t}, 改寬 ${log.widenAt}`)
        assert.strictEqual(log.refreshes.length, 0, JSON.stringify(log.refreshes))
        assert.deepStrictEqual(log.states.map((v) => v.state), ['showing', 'shown'])
    })

    it('FD9 過場事件遺失(transitionend 與 transitioncancel 皆收不到): 後備輪詢於自就緒約 0.8 秒後確認淡入已結束並落定為 shown', async function() {
        ctx = await openFade('lost=1&nowide=1')
        await waitState(ctx.page, 'shown')
        let log = await getLog(ctx.page)
        //前提: 過場事件確實被吞掉
        assert.ok(log.lostEnds >= 1, '前提不成立: 過場事件未被吞掉')
        assert.strictEqual(log.tEnds.length, 0)
        let shown = log.states.find((v) => v.state === 'shown')
        //spec: 事件未到達時於表格就緒 0.8 秒後檢查(過場無進行中則落定)
        assert.ok(shown.t - log.fadeStartAt >= 750, `shown 距淡入開始僅 ${shown.t - log.fadeStartAt}ms`)
        assert.strictEqual(shown.opacity, '1')
        assert.strictEqual(shown.anims, 0)
        assert.strictEqual(log.refreshes.length, 0)
    })

    it('FD10 淡入中元件被銷毀: 不補繪、不報錯, 銷毀後元件之 state 不再變動且無殘留之監聽狀態', async function() {
        ctx = await openFade('widenAtFade=20&killAtFade=100')
        await waitLog(ctx.page, '元件移除時刻', 'killAt')
        //否定斷言: 若計時器未清除, 於淡入結束(約 0.4 秒後)加去抖動(0.35 秒)內會走到落定; 觀察 1500ms
        await quiet(1500)
        let log = await getLog(ctx.page)
        assert.strictEqual(log.refreshes.length, 0, JSON.stringify(log.refreshes))
        assert.ok(!(await ctx.page.evaluate(() => !!document.querySelector('.CompCssWAggridVue'))), '元件應已移除')
        //銷毀後之元件實例: 淡入尚未結束即銷毀,故 state 仍為 showing(未被殘留之計時器改為 shown)、淡入監聽狀態已清除
        let comp = await ctx.page.evaluate(() => ({ state: window.__comp.state, hdFade: window.__comp.hdFade }))
        assert.deepStrictEqual(comp, { state: 'showing', hdFade: null })
        let errs = ctx.pageErrors.concat(ctx.logs.filter((m) => m.type === 'error').map((m) => m.text))
        assert.deepStrictEqual(errs, [])
    })

    it('FD11 淡入中呼叫端經 getApi() 銷毀 ag-grid(元件仍在): 淡入結束後不補繪、不報錯、不印 ag-grid 之銷毀後呼叫警告, state 仍落定為 shown', async function() {
        ctx = await openFade('widenAtFade=20&destroyApiAtFade=100')
        await waitLog(ctx.page, 'ag-grid 銷毀時刻', 'apiDestroyAt')
        await waitState(ctx.page, 'shown')
        //否定斷言: 落定後再觀察 500ms
        await quiet(500)
        let log = await getLog(ctx.page)
        assert.strictEqual(log.refreshes.length, 0, JSON.stringify(log.refreshes))
        //spec(R19): 表格不可用時內部延後路徑靜默略過, 不呼叫已銷毀之 api(ag-grid 對銷毀後之呼叫印警告)
        let bad = ctx.logs.filter((m) => /refreshCells|destroyed|finishFade/i.test(m.text))
        assert.deepStrictEqual(bad, [])
        assert.deepStrictEqual(ctx.pageErrors, [])
        assert.deepStrictEqual(log.states.map((v) => v.state), ['showing', 'shown'])
    })

    it('FD12 尺寸變化與淡入結束落在同一幀(主執行緒被卡住), 淡入結束時 resize 事件尚未送達: 仍須補繪恰 1 次', async function() {
        //stallWidenAtFade: 淡入開始後 N ms 改寬(tr=0 立即套用)並於同一工作內卡住主執行緒, 版面與 ResizeObserver 待卡住結束後才計算, 淡入結束之判定先於 domDetect 之 resize 事件(其以 setTimeout 延後送達)
        //兩種情境: ①過場事件正常: 卡住 700ms 跨過淡入結束, 卡住後的一幀送出 transitionend ②過場事件遺失(lost): 後備輪詢之計時器於卡住結束後隨即執行
        for (let [q, minStall] of [['tr=0&stallWidenAtFade=100&stall=700', 520], ['lost=1&tr=0&stallWidenAtFade=50&stall=900', 820]]) {
            ctx = await openFade(q)
            await waitState(ctx.page, 'shown')
            await quiet(600)
            let log = await getLog(ctx.page)
            //前提: 改寬發生於淡入期間, 且卡住跨過淡入結束(情境①)或後備輪詢之到期時刻(情境②, 就緒 0.8 秒後)
            assert.ok(log.widenAt - log.fadeStartAt < 500, `[${q}] 前提不成立: 改寬 ${log.widenAt} 不在淡入期間(淡入開始 ${log.fadeStartAt})`)
            assert.ok(log.stallEndAt - log.fadeStartAt >= minStall, `[${q}] 前提不成立: 卡住結束 ${log.stallEndAt} 距淡入開始僅 ${log.stallEndAt - log.fadeStartAt}ms(須 >= ${minStall})`)
            //資訊(不作斷言): 過場事件送達當下元件之 resized 旗標(為 false 時, 補繪只能靠淡入結束時再量尺寸; 為 true 時 resize 事件已先更新旗標)
            let eo = log.tEnds.find((v) => v.type === 'transitionend' && v.prop === 'opacity')
            console.log('      [FD12 時序]', q, JSON.stringify({ widen: Math.round(log.widenAt), stallEnd: Math.round(log.stallEndAt), transitionend: eo ? Math.round(eo.t) : null, resizeFlagAtEnd: eo ? eo.resizedFlag : null, firstResize: Math.round(log.resizes.filter((v) => v.t >= log.widenAt)[0].t), refresh: log.refreshes.map((v) => Math.round(v.t)), shown: Math.round(log.states.find((v) => v.state === 'shown').t) }))
            //spec: 淡入期間(至淡入結束止)尺寸有改變者補繪一次
            assert.strictEqual(log.refreshes.length, 1, `[${q}] ${JSON.stringify(log.refreshes)}`)
            let shown = log.states.find((v) => v.state === 'shown')
            assert.ok(shown.t >= log.refreshes[0].t && shown.refreshes === 1, `[${q}]`)
            assert.deepStrictEqual(log.states.map((v) => v.state), ['showing', 'shown'])
            await ctx.close()
            ctx = null
        }
    })

    it('FD13 opt.autoFitColumn 為 true: 淡入期間改寬時, 欄寬重排(去抖動 0.3 秒)先於補繪與落定, shown 之後欄寬不再變動', async function() {
        //widenAtFade=420: 改寬於淡入結束前不久發生(容器過場 100ms), 最後一次尺寸變化落在淡入結束附近, 使 dbc(300ms)與 dbcFade 之先後可被鑑別
        ctx = await openFade('autoFit=1&widenAtFade=420')
        await waitState(ctx.page, 'shown')
        let headWidths = () => ctx.page.evaluate(() => Array.from(document.querySelectorAll('.ag-header-cell')).map((e) => Math.round(e.getBoundingClientRect().width)))
        let atShown = await headWidths()
        //否定斷言: shown 之後再觀察 800ms, 欄寬不得再變(autoFitColumn 之 sizeColumnsToFit 已於 shown 之前執行)
        await quiet(800)
        let later = await headWidths()
        assert.deepStrictEqual(atShown, later, 'shown 之後欄寬仍在變動')
        //spec(opt.autoFitColumn): 尺寸變更後自動調整欄寬 — 7 欄填滿改寬後的表格(1560px), 各欄寬明顯大於預設 200px
        assert.ok(atShown.length >= 7 && atShown.every((w) => w > 205), `欄寬: ${JSON.stringify(atShown)}`)
        let log = await getLog(ctx.page)
        assert.strictEqual(log.refreshes.length, 1, JSON.stringify(log.refreshes))
        //spec: 欄寬重排(sizeColumnsToFit,改寬後之最後一次)先於補繪, 補繪先於(或同於)shown
        let fits = log.fits.filter((v) => v.t > log.widenAt)
        assert.ok(fits.length >= 1, `改寬後無 sizeColumnsToFit: ${JSON.stringify(log.fits)}`)
        let lastFit = Math.max(...fits.map((v) => v.t))
        assert.ok(lastFit < log.refreshes[0].t, `最後一次欄寬重排 ${lastFit} 應早於補繪 ${log.refreshes[0].t}`)
    })

    it('FD14 淡入過場過長(6 秒): 後備輪詢至多再等 3 秒後強制落定為 shown, 不無限等待', async function() {
        ctx = await openFade('slowfade=1&nowide=1')
        await waitState(ctx.page, 'shown', 20000)
        let log = await getLog(ctx.page)
        let shown = log.states.find((v) => v.state === 'shown')
        //自就緒 0.8 秒後起每 50ms 重查,至多 60 次(3 秒): 約於 3.8 秒強制結束,早於 6 秒過場之自然結束
        let dt = shown.t - log.fadeStartAt
        assert.ok(dt >= 3500 && dt <= 5500, `強制落定時刻距淡入開始 ${Math.round(dt)}ms`)
        assert.ok(parseFloat(shown.opacity) < 1 && shown.anims > 0, `落定當下過場仍在進行(此為強制落定): ${JSON.stringify(shown)}`)
        assert.strictEqual(log.refreshes.length, 0)
    })

    it('FD17 尺寸持續變動(每 80ms 變化 > 1px): 等待穩定至多再等 3 秒即強制補繪恰 1 次並落定為 shown, state 不會永遠停在 showing', async function() {
        //jitter: 淡入開始後 50ms 起每 80ms 切換容器寬度(1530/1560, 過場 100ms), 尺寸持續變動, 去抖動永遠等不到穩定
        ctx = await openFade('jitter=1')
        await waitState(ctx.page, 'shown', 20000)
        let log = await getLog(ctx.page)
        let tEnd = opacityEnd(log)
        let shown = log.states.find((v) => v.state === 'shown')
        //前提: 落定時尺寸仍在變動(shown 之前 200ms 內仍有尺寸變化)
        assert.ok(log.resizes.some((v) => v.t > shown.t - 200 && v.t <= shown.t), `前提不成立: shown ${shown.t} 前尺寸已停止變動`)
        //自淡入結束起至多再等 3 秒(上限 3000ms, 計時漂移容許至 4200ms), 且確有等待(去抖動期間 >= 2800ms)
        let dt = shown.t - tEnd
        assert.ok(dt >= 2800 && dt <= 4200, `淡入結束至強制落定 ${Math.round(dt)}ms`)
        assert.strictEqual(log.refreshes.length, 1, JSON.stringify(log.refreshes))
        assert.ok(shown.t >= log.refreshes[0].t && shown.refreshes === 1)
    })

    it('FD15 淡入期間容器移動並改寬: 多個全新頁面之表格畫面全相同, 且等於容器不帶過場者(issue #31 之像素不收斂)', async function() {
        ctx = await openBrowser()
        //組別: A 淡入期間改寬(含過場 100ms); B 容器不帶過場(tr=0)為基準
        let a = await shotKinds(ctx.browser, 'widenAtFade=50', 8)
        let b = await shotKinds(ctx.browser, 'tr=0&widenAtFade=50', 4)
        //spec: 預設與 e2e 旗標下皆只有 1 種結果, 且等於 tr=0 者
        assert.strictEqual(Object.keys(b).length, 1, `tr=0 基準自身不穩定: ${JSON.stringify(b)}`)
        assert.strictEqual(Object.keys(a).length, 1, `A 組結果多於 1 種: ${JSON.stringify(a)}`)
        assert.deepStrictEqual(Object.keys(a), Object.keys(b), `A 組 ${JSON.stringify(a)} 不等於 tr=0 組 ${JSON.stringify(b)}`)
    })

    it('FD16 對照組(關閉淡入 nofade=1、淡入結束後才改寬 widenAfterShown)結果各只有 1 種', async function() {
        ctx = await openBrowser()
        let c = await shotKinds(ctx.browser, 'nofade=1&widenAtFade=50', 6)
        let d = await shotKinds(ctx.browser, 'widenAfterShown=100', 6)
        assert.strictEqual(Object.keys(c).length, 1, `nofade 組: ${JSON.stringify(c)}`)
        assert.strictEqual(Object.keys(d).length, 1, `淡入結束後才改寬組: ${JSON.stringify(d)}`)
    })

})
