//過濾狀態之取得與 filterChange 事件(本次修正 P3; 規則帳本 R20)
//使用者路徑: ①開宿主頁(t5 之 id 關閉過濾、t6 全部可過濾、t7 全部關閉過濾、t8 之 model 隱藏、t9 於回呼內取數據、t10 建立時無數據列、t12 之 id 隱藏且關閉過濾)
//②於表頭浮動過濾或宿主之全表搜尋框以真鍵盤輸入,或點宿主按鈕呼叫 getFilters 等方法、重新載入設定、載入數據
//③看到過濾結果、opt.filterChange 之事件與方法之回傳 ④輸入 Toy、Ford 等 ⑤比對事件內容與筆數、回傳之過濾模型、Promise 是否結束 ⑥無副作用
import assert from 'assert'
import { openPage, pageUrl, runHostCase, typeIntoFloatingFilter, assertNoErrors } from './tools/e2e-setup.mjs'
import { waitUntilExist } from './tools/e2eLib.mjs'

let TOY = { filterType: 'text', type: 'contains', filter: 'Toy' }
let MOUNT = { from: 'filterall', filterall: '', flts: [], isFilter: false }

//events, 讀某表之 filterChange 紀錄
function events(page, t) {
    return page.evaluate((k) => window.__fc[k], t)
}

//waitEvents, 等某表之 filterChange 紀錄達 n 筆
async function waitEvents(page, t, n) {
    await waitUntilExist(page, `${t} 之 filterChange 達 ${n} 筆`, ({ k, m }) => window.__fc[k].length >= m, { arg: { k: t, m: n }, timeout: 8000 })
}

//waitEventsExactly, 等某表之紀錄達 n 筆後再觀察一段靜止窗, 確認未多發(事件數為規格之一部分)
async function waitEventsExactly(page, t, n, quietMs = 800) {
    await waitEvents(page, t, n)
    await page.waitForTimeout(quietMs)
    let ev = await events(page, t)
    assert.strictEqual(ev.length, n, `${t} 之 filterChange 應恰為 ${n} 筆: ${JSON.stringify(ev)}`)
    return ev
}

//rowCount, 某表目前顯示之列數
function rowCount(page, sel) {
    return page.evaluate((s) => document.querySelectorAll(`${s} .ag-center-cols-container .ag-row`).length, sel)
}

//modelsByKeys, 依 opt.keys 之順序以 ag-grid 公開之 getColumnFilterModel 取各欄生效中之模型(getFilters 之應然)
function modelsByKeys(page, ref) {
    return page.evaluate((r) => {
        let api = window.__vm.$refs[r].getApi()
        return ['id', 'make', 'model', 'price'].map((k) => api.getColumnFilterModel(k)).filter((m) => m)
    }, ref)
}

//typeHostFilterall, 於宿主之全表搜尋框以真鍵盤輸入
async function typeHostFilterall(page, sel, text) {
    await page.click(sel)
    await page.keyboard.type(text)
}

describe('e2e-filters:過濾狀態與 filterChange', function() {
    let ctx = null

    beforeEach(async function() {
        ctx = await openPage(pageUrl('filters.html'), { minCells: 20 })
    })

    afterEach(async function() {
        if (ctx) {
            await ctx.close()
        }
        ctx = null
    })

    describe('getFilters 與表頭過濾方法', function() {

        it('FL1 有關閉過濾之欄時 getFilters:結束且回傳 [](P3)', async function() {
            let r = await runHostCase(ctx, 'FL_getFilters_filterOff', { outTimeout: 8000 })
            assert.ok(!r.out.threw, r.out.err)
            assert.deepStrictEqual(r.out.ret, [])
            assertNoErrors(ctx)
        })

        it('FL2 全部可過濾且無過濾時 getFilters:[](對照)', async function() {
            let r = await runHostCase(ctx, 'FL_getFilters_allOn', { outTimeout: 8000 })
            assert.deepStrictEqual(r.out.ret, [])
            assertNoErrors(ctx)
        })

        it('FL3 全部可過濾且 make 有過濾時 getFilters:[make 之模型](對照)', async function() {
            await typeIntoFloatingFilter(ctx.page, '#t6', 1, 'Toy')
            await waitUntilExist(ctx.page, 't6 過濾後剩 1 列', () => document.querySelectorAll('#t6 .ag-center-cols-container .ag-row').length === 1)
            let r = await runHostCase(ctx, 'FL_getFilters_active', { outTimeout: 8000 })
            assert.deepStrictEqual(r.out.ret, [TOY])
            assertNoErrors(ctx)
        })

        it('FL4 有關閉過濾之欄且 make 有過濾時 getFilters:[make 之模型](P3)', async function() {
            //id 關閉過濾, 浮動過濾列之第 1 個輸入框為 make
            await typeIntoFloatingFilter(ctx.page, '#t5', 1, 'Toy')
            await waitUntilExist(ctx.page, 't5 過濾後剩 1 列', () => document.querySelectorAll('#t5 .ag-center-cols-container .ag-row').length === 1)
            let r = await runHostCase(ctx, 'FL_getFilters_filterOffActive', { outTimeout: 8000 })
            assert.ok(!r.out.threw, r.out.err)
            assert.deepStrictEqual(r.out.ret, [TOY])
            assertNoErrors(ctx)
        })

        it('FL5 全部欄位關閉過濾時 getFilters:結束且回傳 [](P3)', async function() {
            let r = await runHostCase(ctx, 'FL_getFilters_allOff', { outTimeout: 8000 })
            assert.ok(!r.out.threw, r.out.err)
            assert.deepStrictEqual(r.out.ret, [])
            assertNoErrors(ctx)
        })

        it('FL6 隱藏欄上有過濾時 getFilters:包含該欄之模型(過濾仍作用於列)', async function() {
            //前置(setup 例外): 隱藏欄無浮動過濾框可輸入, 以元件方法設過濾
            await ctx.page.evaluate(() => window.__vm.$refs.t8.setHeadFilter('model', 'Cel'))
            await waitUntilExist(ctx.page, 't8 過濾後剩 1 列', () => document.querySelectorAll('#t8 .ag-center-cols-container .ag-row').length === 1)
            let r = await runHostCase(ctx, 'FL_getFilters_hiddenActive', { outTimeout: 8000 })
            assert.deepStrictEqual(r.out.ret, [{ filterType: 'text', type: 'contains', filter: 'Cel' }])
            assertNoErrors(ctx)
        })

        it('FL7 clearHeadFilter 於關閉過濾之欄:結束且不拋錯(既有)', async function() {
            let r = await runHostCase(ctx, 'FL_clear_filterOff', { outTimeout: 8000 })
            assert.ok(!r.out.threw, r.out.err)
            assertNoErrors(ctx)
        })

        it('FL8 setHeadFilter 於關閉過濾之欄:結束且不拋錯,列不受影響(既有)', async function() {
            let r = await runHostCase(ctx, 'FL_set_filterOff', { outTimeout: 8000 })
            assert.ok(!r.out.threw, r.out.err)
            assert.strictEqual(await rowCount(ctx.page, '#t5'), 2)
            assertNoErrors(ctx)
        })

        it('FL9 setHeadFilter 於不存在之 key:結束且不拋錯(既有)', async function() {
            let r = await runHostCase(ctx, 'FL_set_unknown', { outTimeout: 8000 })
            assert.ok(!r.out.threw, r.out.err)
            assertNoErrors(ctx)
        })

        it('FL10 clearHeadFilter 於不存在之 key:結束且不拋錯(既有)', async function() {
            let r = await runHostCase(ctx, 'FL_clear_unknown', { outTimeout: 8000 })
            assert.ok(!r.out.threw, r.out.err)
            assertNoErrors(ctx)
        })

        it('FL11 隱藏且關閉過濾之欄時 getFilters:結束且回傳 [](P3)', async function() {
            let r = await runHostCase(ctx, 'FL_getFilters_hiddenOff', { outTimeout: 8000 })
            assert.ok(!r.out.threw, r.out.err)
            assert.deepStrictEqual(r.out.ret, [])
            assertNoErrors(ctx)
        })

        it('FL12 make 為兩條件(OR)之複合過濾時 getFilters:回傳該欄完整之模型(R20)', async function() {
            //前置(setup 例外): 使用者於 make 之過濾選單設兩條件之結果
            await ctx.page.evaluate(() => {
                let api = window.__vm.$refs.t6.getApi()
                let m = { filterType: 'text', operator: 'OR', conditions: [{ filterType: 'text', type: 'contains', filter: 'Toy' }, { filterType: 'text', type: 'contains', filter: 'For' }] }
                return api.setColumnFilterModel('make', m).then(() => api.onFilterChanged())
            })
            let r = await runHostCase(ctx, 'FL_getFilters_compound', { outTimeout: 8000 })
            let exp = await modelsByKeys(ctx.page, 't6')
            assert.strictEqual(exp.length, 1)
            assert.strictEqual(exp[0].operator, 'OR')
            assert.deepStrictEqual(r.out.ret, exp)
            assertNoErrors(ctx)
        })

        it('FL13 先過濾 price(數值)再過濾 make 時 getFilters:依 opt.keys 之順序回傳兩欄模型(R20)', async function() {
            //前置(setup 例外): 使用者先後於 price、make 設過濾之結果; ag-grid 之 getFilterModel 鍵序依過濾器建立順序, 回傳須依欄位順序
            await ctx.page.evaluate(async () => {
                let t6 = window.__vm.$refs.t6
                await t6.setHeadFilter('price', 33000, 'lessThan')
                await t6.setHeadFilter('make', 'For')
            })
            let r = await runHostCase(ctx, 'FL_getFilters_multi', { outTimeout: 8000 })
            assert.deepStrictEqual(r.out.ret, [
                { filterType: 'text', type: 'contains', filter: 'For' },
                { filterType: 'number', type: 'lessThan', filter: 33000 },
            ])
            assert.deepStrictEqual(r.out.ret, await modelsByKeys(ctx.page, 't6'))
            assertNoErrors(ctx)
        })

        it('FL14 建立時無數據列之表 setHeadFilter:於載入數據後才結束並套用過濾(已知限制,ag-grid 型別推斷之排隊)', async function() {
            await ctx.page.evaluate(() => {
                window.__case = 'FL_set_emptyTable'
                window.__out = null
            })
            await ctx.page.click('#btnRun')
            //負向觀察窗: 無數據列時 Promise 尚未結束
            await ctx.page.waitForTimeout(1500)
            assert.strictEqual(await ctx.page.evaluate(() => window.__out), null, '載入數據前不應結束')
            await ctx.page.click('#btnLoad10')
            await waitUntilExist(ctx.page, 'setHeadFilter 結束', () => window.__out !== null, { timeout: 8000 })
            let out = await ctx.page.evaluate(() => window.__out)
            assert.ok(!out.threw, out.err)
            await waitUntilExist(ctx.page, 't10 過濾後剩 1 列', () => document.querySelectorAll('#t10 .ag-center-cols-container .ag-row').length === 1)
            let ev = await events(ctx.page, 't10')
            assert.deepStrictEqual(ev[ev.length - 1], { from: 'heads', filterall: '', flts: [TOY], isFilter: true })
            assertNoErrors(ctx)
        })

    })

    describe('opt.filterChange 事件', function() {

        it('FC1 有關閉過濾之欄的表格掛載:恰觸發 1 次 from filterall(P3)', async function() {
            let ev = await waitEventsExactly(ctx.page, 't5', 1)
            assert.deepStrictEqual(ev, [MOUNT])
            assertNoErrors(ctx)
        })

        it('FC2 全部可過濾之表格掛載:恰觸發 1 次 from filterall(對照)', async function() {
            let ev = await waitEventsExactly(ctx.page, 't6', 1)
            assert.deepStrictEqual(ev, [MOUNT])
            assertNoErrors(ctx)
        })

        it('FC3 有關閉過濾之欄的表格於 make 浮動過濾輸入 Toy:觸發 from heads 且 flts 含 make 之模型(P3)', async function() {
            await waitEvents(ctx.page, 't5', 1)
            await typeIntoFloatingFilter(ctx.page, '#t5', 1, 'Toy')
            await waitEvents(ctx.page, 't5', 2)
            let ev = await events(ctx.page, 't5')
            assert.deepStrictEqual(ev[ev.length - 1], { from: 'heads', filterall: '', flts: [TOY], isFilter: true })
            assertNoErrors(ctx)
        })

        it('FC4 全部可過濾之表格於 make 浮動過濾輸入 Toy:同上(對照)', async function() {
            await waitEvents(ctx.page, 't6', 1)
            await typeIntoFloatingFilter(ctx.page, '#t6', 1, 'Toy')
            await waitEvents(ctx.page, 't6', 2)
            let ev = await events(ctx.page, 't6')
            assert.deepStrictEqual(ev[ev.length - 1], { from: 'heads', filterall: '', flts: [TOY], isFilter: true })
            assertNoErrors(ctx)
        })

        it('FC5 有關閉過濾之欄的表格於全表搜尋輸入 Ford:觸發 from filterall(P3)', async function() {
            await waitEvents(ctx.page, 't5', 1)
            await typeHostFilterall(ctx.page, '#fa5', 'Ford')
            await waitUntilExist(ctx.page, 't5 之 filterChange 出現 filterall Ford', () => window.__fc.t5.some((e) => e.filterall === 'Ford'), { timeout: 8000 })
            let ev = await events(ctx.page, 't5')
            assert.deepStrictEqual(ev[ev.length - 1], { from: 'filterall', filterall: 'Ford', flts: [], isFilter: true })
            assertNoErrors(ctx)
        })

        it('FC6 全部可過濾之表格於全表搜尋輸入 Ford:同上(對照)', async function() {
            await waitEvents(ctx.page, 't6', 1)
            await typeHostFilterall(ctx.page, '#fa6', 'Ford')
            await waitUntilExist(ctx.page, 't6 之 filterChange 出現 filterall Ford', () => window.__fc.t6.some((e) => e.filterall === 'Ford'), { timeout: 8000 })
            let ev = await events(ctx.page, 't6')
            assert.deepStrictEqual(ev[ev.length - 1], { from: 'filterall', filterall: 'Ford', flts: [], isFilter: true })
            assertNoErrors(ctx)
        })

        it('FC7 頁面載入期間:console 無錯誤訊息(掛載時之過濾事件於 grid 建立後才取 api)(P3、P6)', async function() {
            await waitEvents(ctx.page, 't6', 1)
            let bad = ctx.logs.filter((m) => /TypeError|getColumnFilterInstance/.test(m.text))
            assert.deepStrictEqual(bad, [])
            assertNoErrors(ctx)
        })

        it('FC8 有生效過濾時 clearHeadFilterAll:恰觸發 1 次,flts 為空(R20)', async function() {
            await waitEvents(ctx.page, 't6', 1)
            await typeIntoFloatingFilter(ctx.page, '#t6', 1, 'Toy')
            await waitEventsExactly(ctx.page, 't6', 2)
            let r = await runHostCase(ctx, 'FC_clearAll_t6', { outTimeout: 8000 })
            assert.ok(!r.out.threw, r.out.err)
            let ev = await waitEventsExactly(ctx.page, 't6', 3)
            assert.deepStrictEqual(ev[2], { from: 'heads', filterall: '', flts: [], isFilter: false })
            assert.strictEqual(await rowCount(ctx.page, '#t6'), 2)
            assertNoErrors(ctx)
        })

        it('FC9 無生效過濾時 clearHeadFilterAll:恰觸發 1 次(既有)', async function() {
            await waitEventsExactly(ctx.page, 't6', 1)
            let r = await runHostCase(ctx, 'FC_clearAll_t6', { outTimeout: 8000 })
            assert.ok(!r.out.threw, r.out.err)
            let ev = await waitEventsExactly(ctx.page, 't6', 2)
            assert.deepStrictEqual(ev[1], { from: 'heads', filterall: '', flts: [], isFilter: false })
            assertNoErrors(ctx)
        })

        it('FC10 宿主重新載入設定(keys 內容相同之新陣列)且 filterall 未變:不觸發 filterall 事件(R20)', async function() {
            await waitEventsExactly(ctx.page, 't6', 1)
            await ctx.page.click('#btnReloadKeys6')
            await waitEventsExactly(ctx.page, 't6', 1, 1200)
            assertNoErrors(ctx)
        })

        it('FC11 對關閉過濾之欄 setHeadFilter:仍觸發 1 次 from heads,flts 為空(P3、R20)', async function() {
            await waitEventsExactly(ctx.page, 't5', 1)
            let r = await runHostCase(ctx, 'FL_set_filterOff', { outTimeout: 8000 })
            assert.ok(!r.out.threw, r.out.err)
            let ev = await waitEventsExactly(ctx.page, 't5', 2)
            assert.deepStrictEqual(ev[1], { from: 'heads', filterall: '', flts: [], isFilter: false })
            assertNoErrors(ctx)
        })

        it('FC12 掛載之事件回呼內:可取得顯示中之全部數據列(R20)', async function() {
            let ev = await waitEventsExactly(ctx.page, 't9', 1)
            assert.deepStrictEqual(ev, [{ from: 'filterall', nDisp: 2 }])
            assertNoErrors(ctx)
        })

    })

})
