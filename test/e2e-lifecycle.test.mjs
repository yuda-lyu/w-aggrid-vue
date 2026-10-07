//單一空物件列、表格不存在時之呼叫、元件 prop opt 之訊息(本次修正 P2、P5、P6; 規則帳本 R03、R04、R19)
//使用者路徑: ①開宿主頁(t1 恰 1 列 {}、t2 兩列 {}、t3 1 列空字串、t4 無列、t5 全部欄位隱藏、t6 過濾後恰剩 1 列 {}、t7 全部隱藏且 1 列 {}、t8 可拖曳之 1 列 {})
//②點宿主按鈕: 取顯示數據或下載; 或宿主切換功能區而動態建立、移除表格(或呼叫端銷毀 ag-grid)後再呼叫其方法; 或以滑鼠拖曳列
//③看到回傳之數據、下載檔、錯誤訊息與 console ④上傳時選一個 xlsx ⑤比對回傳值、錯誤訊息、console 是否帶前綴且無原生 TypeError 與 ag-grid 已銷毀之警告 ⑥副作用: 下載檔與上傳檔(存於 test/_tmp 用畢即刪)
import assert from 'assert'
import { openPage, pageUrl, runHostCase, normMat, useTmpDir, writeXlsx } from './tools/e2e-setup.mjs'
import { waitUntilExist } from './tools/e2eLib.mjs'

let tmp = useTmpDir('e2e-lifecycle')
let BLANK = { a: '', b: '' }
let GONE = (name) => new RegExp(`^Error: \\[w-aggrid-vue\\] ${name}: grid is not available$`)
let OPT_INVALID = /^\[w-aggrid-vue\] opt is invalid, it must be an object with keys and rows, the table is not updated$/

//前置狀態(setup 例外: 以 grid API 建立使用者先前之操作結果)
let pre = {
    //t6 之 a 欄過濾為空白(使用者於過濾選單選 Blank 之結果), 只剩 {} 那列
    C10_getDisplayData_filteredSingleEmpty: async (page) => {
        await page.evaluate(() => {
            let api = window.__vm.$refs.t6.getApi()
            return api.setColumnFilterModel('a', { filterType: 'text', type: 'blank' }).then(() => api.onFilterChanged())
        })
        await waitUntilExist(page, 't6 過濾後剩 1 列', () => document.querySelectorAll('#t6 .ag-center-cols-container .ag-row').length === 1)
    },
}

//每格: [代號, 說明, 應然]; ret 比對回傳陣列, file 比對下載檔, throw/reject 比對錯誤訊息, retType 比對回傳型別, log/nolog 比對 console
let cases = [
    ['C1_getDisplayData_singleEmpty', '表格恰 1 列 {} 時 getDisplayData:回傳 1 列空白列(P2、R04)', { ret: [BLANK] }],
    ['C2_getNowData_singleEmpty', '表格恰 1 列 {} 時 getNowData:回傳 1 列空白列(P2、R04)', { ret: [BLANK] }],
    ['C3_getDisplayData_twoEmpty', '2 列 {} 時 getDisplayData:2 列空白列(對照)', { ret: [BLANK, BLANK] }],
    ['C4_getNowData_twoEmpty', '2 列 {} 時 getNowData:2 列空白列(對照)', { ret: [BLANK, BLANK] }],
    ['C5_getDisplayData_singleBlank', '1 列空字串時 getDisplayData:1 列空白列(對照)', { ret: [BLANK] }],
    ['C6_getDisplayData_noRows', '無數據列時 getDisplayData:[](對照)', { ret: [] }],
    ['C7_downloadDisplayData_singleEmpty', '恰 1 列 {} 時 downloadDisplayData:表頭加 1 列空白列(對照)', { file: [['a', 'b'], ['', '']] }],
    ['C8_downloadData_singleEmpty', '恰 1 列 {} 時 downloadData:同上(對照)', { file: [['a', 'b'], ['', '']] }],
    ['C9_getDisplayData_allHidden', '全部欄位隱藏時 getDisplayData:維持回傳 [](Q6)', { ret: [] }],
    ['C10_getDisplayData_filteredSingleEmpty', '過濾後恰剩 1 列 {} 時 getDisplayData:1 列空白列(P2、R04)', { ret: [BLANK] }],
    ['C11_getNowData_allHiddenSingleEmpty', '全部欄位隱藏且恰 1 列 {} 時 getNowData:依 opt.keys 回 1 列空白列(P2、R04)', { ret: [BLANK] }],
    ['O1_invalidOptKeys', '元件 opt.keys 無效:console 說明表格不更新(P5、R03)', { retType: 'object', log: /^\[w-aggrid-vue\] opt\.keys is invalid, it must be a non-empty array of keys, the table is not updated$/ }],
    ['O2_invalidOptRows', '元件 opt.rows 無效:同上(P5、R03)', { retType: 'object', log: /^\[w-aggrid-vue\] opt\.rows is invalid, it must be an array, the table is not updated$/ }],
    ['O3_invalidOptStr', '元件 opt 為字串:console 說明表格不更新(R01、R03)', { retType: 'object', log: OPT_INVALID }],
    ['O4_invalidOptEmpty', '元件 opt 為 {}:同上(R01、R03)', { retType: 'object', log: OPT_INVALID }],
    ['O5_optNull', '元件 opt 為 null(未給予):不提示(R01)', { retType: 'object', nolog: /opt is invalid|opt\.(keys|rows) is invalid/ }],
    ['E01_showKeys', '元件銷毀後 showKeys:拋 grid is not available(P6、R19)', { throw: GONE('showKeys') }],
    ['E02_setHeadFilter', '元件銷毀後 setHeadFilter:reject 同訊息(P6、R19)', { reject: GONE('setHeadFilter') }],
    ['E03_clearHeadFilter', '元件銷毀後 clearHeadFilter:reject 同訊息(P6、R19)', { reject: GONE('clearHeadFilter') }],
    ['E04_clearHeadFilterAll', '元件銷毀後 clearHeadFilterAll:reject 同訊息(P6、R19)', { reject: GONE('clearHeadFilterAll') }],
    ['E05_getFilters', '元件銷毀後 getFilters:reject 同訊息(P6、R19)', { reject: GONE('getFilters') }],
    ['E06_getDisplayDataKeys', '元件銷毀後 getDisplayDataKeys:拋同訊息(P6、R19)', { throw: GONE('getDisplayDataKeys') }],
    ['E07_getDisplayData', '元件銷毀後 getDisplayData:拋同訊息(P6、R19)', { throw: GONE('getDisplayData') }],
    ['E08_getNowData', '元件銷毀後 getNowData:拋同訊息(P6、R19)', { throw: GONE('getNowData') }],
    ['E09_pasteText', '元件銷毀後 pasteText:拋同訊息(P6、R19)', { throw: GONE('pasteText') }],
    ['E10_fitColumns_noDebounce', '元件銷毀後 fitColumns(false):靜默略過(R19 內部延後路徑)', { retType: 'undefined' }],
    ['E11_fitColumns_debounce', '元件銷毀後 fitColumns(true):靜默略過(R19 內部延後路徑)', { retType: 'undefined' }],
    ['E12_getApi', '元件銷毀後 getApi:回傳 null(範圍外)', { retType: 'null' }],
    ['E13_getGridOptions', '元件銷毀後 getGridOptions:回傳物件(範圍外)', { retType: 'object' }],
    ['E14_downloadDisplayData', '元件銷毀後 downloadDisplayData:拋 grid is not available(R19)', { throw: GONE('downloadDisplayData') }],
    ['E15_downloadData', '元件銷毀後 downloadData:不需 grid 而照常產檔(範圍外)', { file: [['a', 'b'], ['1', '2']] }],
    ['E16_refresh', '元件銷毀後 refresh:靜默略過(R19 內部延後路徑)', { retType: 'undefined' }],
    ['X01_showKeys', 'ag-grid 已銷毀(元件仍在)時 showKeys:拋 grid is not available(R19)', { throw: GONE('showKeys') }],
    ['X02_setHeadFilter', 'ag-grid 已銷毀時 setHeadFilter:reject 同訊息(R19)', { reject: GONE('setHeadFilter') }],
    ['X03_clearHeadFilter', 'ag-grid 已銷毀時 clearHeadFilter:reject 同訊息(R19)', { reject: GONE('clearHeadFilter') }],
    ['X04_clearHeadFilterAll', 'ag-grid 已銷毀時 clearHeadFilterAll:reject 同訊息(R19)', { reject: GONE('clearHeadFilterAll') }],
    ['X05_getFilters', 'ag-grid 已銷毀時 getFilters:reject 同訊息(R19)', { reject: GONE('getFilters') }],
    ['X06_getDisplayDataKeys', 'ag-grid 已銷毀時 getDisplayDataKeys:拋同訊息,不回空結果(R19)', { throw: GONE('getDisplayDataKeys') }],
    ['X07_getDisplayData', 'ag-grid 已銷毀時 getDisplayData:拋同訊息,不回空結果(R19)', { throw: GONE('getDisplayData') }],
    ['X08_getNowData', 'ag-grid 已銷毀時 getNowData:拋同訊息,不回空結果(R19)', { throw: GONE('getNowData') }],
    ['X09_pasteText', 'ag-grid 已銷毀時 pasteText:拋同訊息(R19)', { throw: GONE('pasteText') }],
    ['X10_fitColumns_noDebounce', 'ag-grid 已銷毀時 fitColumns(false):靜默略過,無 ag-grid 警告(R19)', { retType: 'undefined' }],
    ['X11_refresh', 'ag-grid 已銷毀時 refresh:靜默略過,無 ag-grid 警告(R19)', { retType: 'undefined' }],
    ['X12_getApi', 'ag-grid 已銷毀時 getApi:回傳該 api 物件(存取器,範圍外)', { retType: 'object' }],
    ['X13_downloadDisplayData', 'ag-grid 已銷毀時 downloadDisplayData:拋 grid is not available,不再拋 no downloadable keys(R19)', { throw: GONE('downloadDisplayData') }],
    ['X14_downloadData', 'ag-grid 已銷毀時 downloadData:不需 grid 而照常產檔(範圍外)', { file: [['a', 'b'], ['1', '2']] }],
    ['W1_setHeadFilter_destroyDuring', 'setHeadFilter 進行中元件被銷毀:reject grid is not available(R19)', { reject: GONE('setHeadFilter') }],
    ['W2_clearHeadFilter_destroyDuring', 'clearHeadFilter 進行中元件被銷毀:reject 同訊息(R19)', { reject: GONE('clearHeadFilter') }],
]

//assertQuiet, 元件被移除或 ag-grid 被銷毀後, 不得印出原生 TypeError 或 ag-grid 已銷毀之警告(R19)
function assertQuiet(r) {
    let bad = r.logs.filter((m) => /TypeError|cannot be called as the grid has been destroyed/.test(m.text))
    assert.deepStrictEqual(bad, [], 'console 不得有 TypeError 或 ag-grid 已銷毀之警告')
    assert.deepStrictEqual(r.pageErrors, [], 'pageerror')
}

describe('e2e-lifecycle:單一空列、表格不存在時之呼叫、opt 訊息', function() {
    let ctx = null

    before(function() {
        tmp.make()
    })

    after(function() {
        tmp.clean()
    })

    beforeEach(async function() {
        ctx = await openPage(pageUrl('lifecycle.html'), { minCells: 6, downloadsPath: tmp.dir })
    })

    afterEach(async function() {
        if (ctx) {
            await ctx.close()
        }
        ctx = null
    })

    for (let [id, title, exp] of cases) {
        it(`${id} ${title}`, async function() {
            if (pre[id]) {
                await pre[id](ctx.page)
            }
            let r = await runHostCase(ctx, id, { expectDownloads: exp.file ? 1 : 0, saveDir: tmp.dir })
            let { out } = r
            if (exp.throw) {
                assert.ok(out.threw, `應同步拋錯, 實際 ${JSON.stringify(out)}`)
                assert.match(out.err, exp.throw)
            }
            else if (exp.reject) {
                assert.ok(!out.threw, `不應同步拋錯: ${out.err}`)
                assert.ok(out.rejected, `應 reject, 實際 ${JSON.stringify(out)}`)
                assert.match(out.err, exp.reject)
            }
            else {
                assert.ok(!out.threw && !out.rejected, `不應拋錯: ${out.err}`)
            }
            if (exp.ret) {
                assert.deepStrictEqual(out.ret, exp.ret)
            }
            if (exp.retType) {
                assert.strictEqual(out.retType, exp.retType)
            }
            if (exp.file) {
                assert.ok(r.file, '應產生下載檔')
                assert.deepStrictEqual(normMat(r.file.data), normMat(exp.file))
            }
            else {
                assert.strictEqual(r.file, null, '不應產生下載檔')
            }
            if (exp.log) {
                assert.ok(r.logs.some((m) => exp.log.test(m.text)), `缺少 console 訊息 ${exp.log}: ${JSON.stringify(r.logs.map((m) => m.text))}`)
            }
            if (exp.nolog) {
                assert.ok(!r.logs.some((m) => exp.nolog.test(m.text)), `不應有 console 訊息 ${exp.nolog}: ${JSON.stringify(r.logs.map((m) => m.text))}`)
            }
            assertQuiet(r)
        })
    }

    it('E17_uploadData 元件銷毀後 uploadData:照常開窗、resolve 並寫入呼叫端之 opt.rows(R19 刻意不套,同 downloadData 不需 grid)', async function() {
        let fp = await writeXlsx(tmp.file('e17.xlsx'), [['a', 'b'], ['u1', 'u2']])
        let chooserP = ctx.page.waitForEvent('filechooser', { timeout: 10000 })
        let rP = runHostCase(ctx, 'E17_uploadData', { saveDir: tmp.dir })
        let chooser = await chooserP
        await chooser.setFiles(fp)
        let r = await rP
        assert.ok(!r.out.threw && !r.out.rejected, `不應拋錯: ${r.out.err}`)
        assert.deepStrictEqual(r.out.ret, [{ a: 'u1', b: 'u2' }])
        assert.strictEqual(r.out.post, 'post: opt.rows=[{"a":"u1","b":"u2"}]')
        assertQuiet(r)
    })

    it('PB1 可編輯且有置底合計列之表格,使用者編輯後宿主於 cellChange 回呼內移除表格:不印 TypeError(R19 固定列於呼叫端回呼之後)', async function() {
        await ctx.page.click('#btnMountEditable')
        let cell = ctx.page.locator('#dyn .ag-center-cols-container .ag-row[row-index="0"] .ag-cell[col-id="a"]')
        await cell.waitFor()
        await cell.dblclick()
        await ctx.page.locator('#dyn .ag-cell-inline-editing input').waitFor()
        await ctx.page.keyboard.press('Control+A')
        await ctx.page.keyboard.type('9')
        await ctx.page.keyboard.press('Enter')
        await waitUntilExist(ctx.page, '宿主已於 cellChange 回呼內移除表格', () => window.__pbDestroyed === true)
        //負向觀察窗: 移除後才執行之工作(置底列、refresh 之延後重繪)不得出錯
        await ctx.page.waitForTimeout(500)
        assertQuiet({ logs: ctx.logs, pageErrors: ctx.pageErrors })
    })

    it('C12 恰 1 列 {} 時以滑鼠拖曳該列:opt.rowDragEnd 收到 1 列空白列(P2、R04)', async function() {
        let handle = ctx.page.locator('#t8 .ag-row-drag').first()
        await handle.waitFor()
        let b = await handle.boundingBox()
        let x = b.x + b.width / 2
        let y = b.y + b.height / 2
        await ctx.page.mouse.move(x, y)
        await ctx.page.mouse.down()
        await ctx.page.mouse.move(x, y + 6, { steps: 3 })
        await ctx.page.mouse.move(x, y + 12, { steps: 3 })
        await ctx.page.mouse.up()
        await waitUntilExist(ctx.page, 'rowDragEnd 已觸發', () => window.__drag.length >= 1)
        let d = await ctx.page.evaluate(() => window.__drag)
        assert.deepStrictEqual(d[d.length - 1].rows, [BLANK])
        assert.deepStrictEqual(ctx.pageErrors, [], 'pageerror')
    })

})
