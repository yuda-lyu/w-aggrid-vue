//貼上(Ctrl+V)對 opt.kpCellEditable 之遵守(規則帳本 R22: 元件自寫之寫入路徑一律經同一 editable 判斷, 語意同 ag-grid 之 colDef.editable)
//每案之使用者路徑(6 步, 全案相同, 差異見各案說明):
//  ①開宿主頁 test/pages/pasteEditable.html(各表之 b 欄 editable 為函數或非布林值, 資料見該頁) ②需要時先在畫面上排序(點表頭)或過濾(於表頭過濾列輸入文字)
//  ③真滑鼠單擊起點儲存格(取得焦點; 可編輯格 singleClickEdit 會開編輯器, 多數案例按 Escape 離開編輯器而保留焦點, PT15 不離開)
//  ④剪貼簿為 Tab/換行分隔之文字(headless 瀏覽器之剪貼簿與作業系統隔離, 授權後以頁面剪貼簿 API 寫入, 屬 setup) ⑤真鍵盤 Ctrl+V
//  ⑥觀察: 畫面各欄儲存格文字(主)、宿主 opt.rows(同步更新)、元件數據(getNowData)、console 提示與 pageerror
//觸發貼上之入口: 只有 agCellKeyDown(Ctrl+KeyV); 元件不處理 Cmd+V(Mac)、Shift+Insert、瀏覽器選單之貼上(它們只更新暫存之文字而不執行貼上), 亦無貼上按鈕, 故無其他入口可測
//宿主按鈕呼叫元件方法 pasteText 之路徑(未走鍵盤)由 e2e-pasteText 之 PT1–PT4 驗, 本檔一律走真鍵盤
//標準圖: 本套件未產製標準圖(規則帳本 7.4/9, 待使用者裁示), 本檔不新增; 視覺面以畫面儲存格文字之語意斷言代替
import assert from 'assert'
import { openPage, pageUrl, columnTexts, waitColumnTexts, typeIntoFloatingFilter, assertNoErrors } from './tools/e2e-setup.mjs'
import { waitGridIdle, waitUntilExist } from './tools/e2eLib.mjs'

//row, 宿主頁 mkRows 產生之列: ro(唯讀旗標)、boom(拋錯旗標)不在 keys 內, 只供 editable 函數判斷, 故 opt.rows 含之
let row = (i, o = {}) => Object.assign({ a: 'a' + i, b: 'b' + i, c: 'c' + i, d: 'd' + i, ro: false, boom: false }, o)
//now, getNowData 之列(只含 keys; 宿主列沒有之欄位不列入)
let now = (rows) => rows.map((r) => Object.fromEntries(['a', 'b', 'c', 'd'].filter((k) => k in r).map((k) => [k, r[k]])))

//cell, 儲存格選擇器(ag-grid 之 row-index 為畫面列序、col-id 為欄 id)
let cell = (sel, ri, col) => `${sel} .ag-center-cols-container .ag-row[row-index="${ri}"] .ag-cell[col-id="${col}"]`
let hostRows = (page, key) => page.evaluate((k) => JSON.parse(JSON.stringify(window.__vm.opt[k].rows)), key)
let nowRows = (page, key) => page.evaluate((k) => JSON.parse(JSON.stringify(window.__vm.$refs[k].getNowData())), key)
//agEditable, ag-grid 自身對某儲存格之可編輯判斷(column.isCellEditable), 供對照
let agEditable = (page, key, colId, nodeId) => page.evaluate(({ k, c, n }) => {
    let api = window.__vm.$refs[k].getApi()
    return api.getColumn(c).isCellEditable(api.getRowNode(n))
}, { k: key, c: colId, n: nodeId })

//waitRows, 偵測宿主 opt.rows 達預期之終態(貼上完成之訊號; 預期含被貼入之格, 故唯讀格被誤寫時永不相等); 逾時以 deepStrictEqual 呈現實際與預期之差異
async function waitRows(page, key, expected) {
    try {
        await waitUntilExist(page, `${key} 之 opt.rows 達預期`, ({ k, e }) => JSON.stringify(window.__vm.opt[k].rows) === JSON.stringify(e), { timeout: 8000, arg: { k: key, e: expected } })
    }
    catch (err) {
        assert.deepStrictEqual(await hostRows(page, key), expected, `宿主之 opt.rows(等待逾時): ${err.message}`)
        throw err
    }
}

//waitCellFocused, 等儲存格取得焦點: ag-grid 之焦點框在該格且 document.activeElement 在該格內(真鍵盤事件之目標即 activeElement)
let waitCellFocused = (page, sel, ri, col) => waitUntilExist(page, `${sel} 第 ${ri} 列 ${col} 取得焦點`, (s) => {
    let el = document.querySelector(s)
    return !!el && el.classList.contains('ag-cell-focus') && el.contains(document.activeElement)
}, { timeout: 10000, arg: cell(sel, ri, col) })

//focusCell, 真滑鼠單擊儲存格並等其取得焦點(點擊已被 ag-grid 處理之正向訊號)
async function focusCell(page, sel, ri, col) {
    await page.locator(cell(sel, ri, col)).click()
    await waitCellFocused(page, sel, ri, col)
}

//pasteByKeyboard, 貼上之 act: 寫入剪貼簿(setup) → 真滑鼠單擊起點格 → (leaveEditor 時)Escape 離開編輯器 → [beforeKey] → 真鍵盤 Ctrl+V
async function pasteByKeyboard(page, sel, text, ri, col, { leaveEditor = true, beforeKey = null } = {}) {
    await page.evaluate((t) => navigator.clipboard.writeText(t), text)
    await focusCell(page, sel, ri, col)
    //元件設 singleClickEdit: 單擊可編輯格會開編輯器; 是否可編輯以 ag-grid 自身之判斷為準, 可編輯者等編輯器出現(不依時序猜), 唯讀者不會開
    let editable = await page.evaluate(({ k, r, c }) => {
        let api = window.__vm.$refs[k].getApi()
        return api.getColumn(c).isCellEditable(api.getDisplayedRowAtIndex(r))
    }, { k: sel.slice(1), r: ri, c: col })
    if (editable) {
        await waitUntilExist(page, `${sel} 編輯器已開`, (s) => !!document.querySelector(`${s} .ag-cell-inline-editing`), { timeout: 10000, arg: sel })
        if (leaveEditor) {
            await page.keyboard.press('Escape')
            await waitUntilExist(page, `${sel} 離開編輯器`, (s) => !document.querySelector(`${s} .ag-cell-inline-editing`), { timeout: 10000, arg: sel })
            await waitCellFocused(page, sel, ri, col)
        }
    }
    if (beforeKey) {
        await beforeKey(page)
    }
    await page.keyboard.press('Control+V')
}

//pre: 貼上前使用者先做的畫面操作(真滑鼠與真鍵盤)
let pre = {
    //點 d 欄表頭兩次: 升冪 → 降冪(第一次點後等排序生效再點第二次, 避免被當成雙擊)
    sortDescByD: async (page, sel) => {
        let head = `${sel} .ag-header-cell[col-id="d"]`
        await page.locator(head).click()
        await waitColumnTexts(page, sel, 'd', ['d0', 'd1', 'd2'])
        await page.locator(head).click()
        await waitColumnTexts(page, sel, 'd', ['d2', 'd1', 'd0'])
    },
    //於 d 欄(第 4 欄)之表頭過濾列輸入 y: 只剩 d 值含 y 之第 1~3 列
    filterY: async (page, sel) => {
        await typeIntoFloatingFilter(page, sel, 3, 'y')
        await waitColumnTexts(page, sel, 'a', ['a1', 'a2', 'a3'])
    },
}

//console 中套件於貼上時輸出之提示
let pasteLogs = (ctx) => ctx.logs.map((m) => m.text).filter((t) => t.startsWith('[w-aggrid-vue] pasteText: '))

//每案: { id, title, sel, start: [畫面列序, 欄 id], text, optRows(預期宿主 opt.rows), screen(預期畫面各欄文字,依畫面列序), nowInds(元件數據所含之 opt.rows 列索引,省略為全部), pre, leaveEditor, beforeKey, check }
let T3 = '1\t2\t3\n4\t5\t6\n7\t8\t9'
let cases = [
    //R22.4 唯讀列略過、其餘照寫
    {
        id: 'PT5_fnReadonlyRow',
        title: 'b 為函數且第 1 列(ro)回 false:貼 3×3,第 1 列 b 不變,其餘格皆寫入',
        sel: '#e1',
        start: [0, 'a'],
        text: T3,
        optRows: [row(0, { a: '1', b: '2', c: '3' }), row(1, { a: '4', c: '6', ro: true }), row(2, { a: '7', b: '8', c: '9' })],
        screen: { a: ['1', '4', '7'], b: ['2', 'b1', '8'], c: ['3', '6', '9'] },
        check: async (page) => {
            assert.strictEqual(await agEditable(page, 'e1', 'b', '0'), true, 'ag-grid 自身對第 0 列 b 之判斷為可編輯')
            assert.strictEqual(await agEditable(page, 'e1', 'b', '1'), false, 'ag-grid 自身對第 1 列 b 之判斷為不可編輯(貼上結果與之一致)')
        }
    },
    //R22.5 函數回 true 不可被略過
    {
        id: 'PT6_fnAllEditable',
        title: 'b 為函數且恆回 true:貼 3×3,全部寫入(函數回 true 不可被略過)',
        sel: '#e2',
        start: [0, 'a'],
        text: T3,
        optRows: [row(0, { a: '1', b: '2', c: '3' }), row(1, { a: '4', b: '5', c: '6', ro: true }), row(2, { a: '7', b: '8', c: '9' })],
        screen: { a: ['1', '4', '7'], b: ['2', '5', '8'], c: ['3', '6', '9'] }
    },
    //R22.4 判斷依畫面列(節點), 不依資料列序
    {
        id: 'PT7_fnSorted',
        title: '點 d 表頭排成降冪後自畫面第 0 列貼 3×3:唯讀判斷依畫面列(原第 0 列在畫面最後一列)',
        sel: '#e3',
        start: [0, 'a'],
        text: T3,
        pre: 'sortDescByD',
        optRows: [row(0, { a: '7', c: '9', ro: true }), row(1, { a: '4', b: '5', c: '6' }), row(2, { a: '1', b: '2', c: '3' })],
        screen: { a: ['1', '4', '7'], b: ['2', '5', 'b0'], c: ['3', '6', '9'] }
    },
    {
        id: 'PT8_fnFiltered',
        title: '於 d 過濾列輸入 y 過濾掉第 0 列後自畫面第 0 列貼 3×3:唯讀判斷依畫面列(原第 2 列在畫面第 1 列),被過濾列不變',
        sel: '#e4',
        start: [0, 'a'],
        text: T3,
        pre: 'filterY',
        optRows: [row(0, { d: 'x0' }), row(1, { a: '1', b: '2', c: '3', d: 'y1' }), row(2, { a: '4', c: '6', ro: true, d: 'y2' }), row(3, { a: '7', b: '8', c: '9', d: 'y3' })],
        screen: { a: ['1', '4', '7'], b: ['2', 'b2', '8'], c: ['3', '6', '9'] }
    },
    //R22.3 函數拋錯: 該格不可編輯、整批不失敗、console 說明一次
    {
        id: 'PT9_fnThrows',
        title: 'b 之函數對第 1、2 列拋錯:貼 3×3 不拋錯,該二格視為不可編輯,其餘格寫入,console 說明一次',
        sel: '#e5',
        start: [0, 'a'],
        text: T3,
        optRows: [row(0, { a: '1', b: '2', c: '3' }), row(1, { a: '4', c: '6', boom: true }), row(2, { a: '7', c: '9', boom: true })],
        screen: { a: ['1', '4', '7'], b: ['2', 'b1', 'b2'], c: ['3', '6', '9'] },
        check: async (page, ctx) => {
            let msgs = pasteLogs(ctx)
            assert.strictEqual(msgs.length, 1, `console 說明應恰 1 次: ${JSON.stringify(msgs)}`)
            assert.match(msgs[0], /kpCellEditable\[b\] threw/, '說明含欄位 key')
            assert.match(msgs[0], /not editable/, '說明含處置')
            assert.match(msgs[0], /boom a1/, '說明含首個錯誤訊息(判斷時 a 仍為貼上前之值)')
        }
    },
    //R22.1 EditableCallbackParams; R22.4 判斷於寫入前
    {
        id: 'PT10_fnParams',
        title: 'b 之函數收到該儲存格之 ag-grid 參數(node、data、column、colDef、api、context),每格恰呼叫 1 次,判斷時 data 為貼上前之值',
        sel: '#e6',
        start: [0, 'a'],
        text: T3,
        optRows: [row(0, { a: '1', b: '2', c: '3' }), row(1, { a: '4', b: '5', c: '6', ro: true }), row(2, { a: '7', b: '8', c: '9' })],
        screen: { a: ['1', '4', '7'], b: ['2', '5', '8'], c: ['3', '6', '9'] },
        //記錄只在 Ctrl+V 前後開啟, 排除點擊與渲染時 ag-grid 自身之呼叫
        beforeKey: (page) => page.evaluate(() => {
            window.__seen = []; window.__rec = true
        }),
        check: async (page) => {
            let s = await page.evaluate(() => {
                window.__rec = false; return window.__seen
            })
            //貼上時 b 欄 3 格各被求值恰 1 次(實測記錄窗內無 ag-grid 因資料更新而重新求值之呼叫)
            assert.strictEqual(s.length, 3, `b 欄 3 格各呼叫 1 次: ${JSON.stringify(s)}`)
            assert.deepStrictEqual(s.map((x) => x.nodeId), ['0', '1', '2'], 'node.id 依畫面列序')
            let f = s
            assert.deepStrictEqual(f.map((x) => x.dataIsNodeData), [true, true, true], 'data 即 node.data')
            assert.deepStrictEqual(f.map((x) => x.dataA), ['a0', 'a1', 'a2'], '判斷於寫入前, data 為貼上前之值')
            assert.deepStrictEqual(f.map((x) => x.colId), ['b', 'b', 'b'], 'column')
            assert.deepStrictEqual(f.map((x) => x.field), ['b', 'b', 'b'], 'colDef')
            assert.deepStrictEqual(f.map((x) => x.apiHasGetRowNode), [true, true, true], 'api')
            assert.deepStrictEqual(f.map((x) => x.apiIsGridApi), [true, true, true], 'api 即該表之 grid api')
            for (let x of f) {
                for (let k of ['node', 'data', 'column', 'colDef', 'api', 'context']) {
                    assert.ok(x.keys.split(',').includes(k), `參數缺 ${k}: ${x.keys}`)
                }
            }
        }
    },
    //R22.4 起點格唯讀仍遞增欄位索引
    {
        id: 'PT11_startCellReadonly',
        title: '起點格(第 1 列 b,唯讀)取得焦點後貼 2×2:該格略過、欄位索引照常遞增(第 2 個值落在 c)',
        sel: '#e1',
        start: [1, 'b'],
        text: '1\t2\n3\t4',
        optRows: [row(0), row(1, { c: '2', ro: true }), row(2, { b: '3', c: '4' })],
        screen: { a: ['a0', 'a1', 'a2'], b: ['b0', 'b1', '3'], c: ['c0', '2', '4'] }
    },
    //R22.1 非布林非函數同 ag-grid(不可編輯)
    {
        id: 'PT12_truthyNonBool',
        title: 'b 為非布林真值 1:ag-grid 視為不可編輯(isColumnFunc 僅認布林與函數),貼上同 ag-grid 略過整欄',
        sel: '#e7',
        start: [0, 'a'],
        text: T3,
        optRows: [row(0, { a: '1', c: '3' }), row(1, { a: '4', c: '6', ro: true }), row(2, { a: '7', c: '9' })],
        screen: { a: ['1', '4', '7'], b: ['b0', 'b1', 'b2'], c: ['3', '6', '9'] },
        check: async (page) => {
            assert.strictEqual(await agEditable(page, 'e7', 'b', '0'), false, 'ag-grid 自身對 editable:1 之判斷為不可編輯')
        }
    },
    //R22.4 判斷於寫入前(編輯器未開之路徑; 編輯器開啟之路徑另見第 6 節 #19)
    {
        id: 'PT13_judgeBeforeWrite',
        title: '編輯器未開時 Ctrl+V:e9 之 b 於 a 為 a0 時唯讀,自 a0 貼 X、2 後 a=X、b 仍 b0(判斷依貼上前之 a0,不因同次貼上先寫入之 a 欄而改判)',
        sel: '#e9',
        start: [0, 'a'],
        text: 'X\t2',
        optRows: [row(0, { a: 'X' }), row(1, { ro: true }), row(2)],
        screen: { a: ['X', 'a1', 'a2'], b: ['b0', 'b1', 'b2'], c: ['c0', 'c1', 'c2'] }
    },
    //R22.2 真使用者路徑: 單擊後編輯器開啟中直接 Ctrl+V(編輯器先提交原生貼入文字再由元件貼上; 結果同 PT5)
    {
        id: 'PT15_editorOpen',
        title: '單擊 a0 後編輯器開啟中直接 Ctrl+V:自第 0 列 a 貼 3×3,ro 列(第 1 列)b 不寫入,其餘格寫入',
        sel: '#e1',
        start: [0, 'a'],
        text: T3,
        leaveEditor: false,
        optRows: [row(0, { a: '1', b: '2', c: '3' }), row(1, { a: '4', c: '6', ro: true }), row(2, { a: '7', b: '8', c: '9' })],
        screen: { a: ['1', '4', '7'], b: ['2', 'b1', '8'], c: ['3', '6', '9'] }
    },
    //R22.4 寫入落在畫面被判斷之那一列(filterall 時 rowData 為過濾後之子集, node.id 為子集索引, 不得索引全集); 元件數據(getNowData)只含畫面中之 2 列
    {
        id: 'PT16_fnFilterall',
        title: 'filterall 只顯示第 1、2 列:貼 3×3 寫入畫面第 0、1 列(原第 1、2 列),第 2 列(ro)b 不變,未顯示之第 0、3 列不變',
        sel: '#e10',
        start: [0, 'a'],
        text: T3,
        optRows: [row(0, { tag: 'hide' }), row(1, { a: '1', b: '2', c: '3', tag: 'show' }), row(2, { a: '4', c: '6', ro: true, tag: 'show' }), row(3, { tag: 'hide' })],
        screen: { a: ['1', '4'], b: ['2', 'b2'], c: ['3', '6'] },
        nowInds: [1, 2]
    },
    //R22.6 keys 重複時第二欄 colId 為 a_1(與其讀取之 field a 不同), 寫入以 colId 為資料鍵會新增 a_1 屬性; 同修前, 該欄略過(索引照常遞增)
    {
        id: 'PT17_dupKeys',
        title: 'keys 為 a、a、c:貼 3 個值,第二個 a(colId a_1)略過、不新增 a_1 屬性,第 3 個值落在 c',
        sel: '#e11',
        start: [0, 'a'],
        text: '1\t2\t3',
        optRows: [{ a: '1', c: '3' }],
        screen: { a: ['1'], a_1: ['1'], c: ['3'] }
    },
    //R22.3 editable 函數拋出無法轉字串之值(無原型物件): 通報本身亦不得使整批貼上失敗
    {
        id: 'PT18_fnThrowsOpaque',
        title: 'b 之函數對第 1 列拋出無原型物件:貼 3×3 不拋錯,該格視為不可編輯,其餘格寫入,console 仍說明一次',
        sel: '#e12',
        start: [0, 'a'],
        text: T3,
        optRows: [row(0, { a: '1', b: '2', c: '3' }), row(1, { a: '4', c: '6', boom: true }), row(2, { a: '7', b: '8', c: '9' })],
        screen: { a: ['1', '4', '7'], b: ['2', 'b1', '8'], c: ['3', '6', '9'] },
        check: async (page, ctx) => {
            let msgs = pasteLogs(ctx)
            assert.strictEqual(msgs.length, 1, `console 說明應恰 1 次: ${JSON.stringify(msgs)}`)
            assert.match(msgs[0], /kpCellEditable\[b\] threw/, '說明含欄位 key')
        }
    },
]

describe('e2e-pasteEditable:貼上遵守函數型 kpCellEditable', function() {
    let ctx = null

    beforeEach(async function() {
        ctx = await openPage(pageUrl('pasteEditable.html'), { minCells: 20 })
        //setup: 授權頁面讀寫(headless 瀏覽器之)剪貼簿
        await ctx.page.context().grantPermissions(['clipboard-read', 'clipboard-write'])
    })

    afterEach(async function() {
        if (ctx) {
            await ctx.close()
        }
        ctx = null
    })

    for (let c of cases) {
        it(`${c.id} ${c.title}`, async function() {
            let { page } = ctx
            let key = c.sel.slice(1)
            //宿主頁含多張表, 開頁之等待不保證目標表已渲染, 故先等目標表靜止
            await waitGridIdle(page, { scope: c.sel })
            if (c.pre) {
                await pre[c.pre](page, c.sel)
                await waitGridIdle(page, { scope: c.sel })
            }
            //貼上前之畫面操作不得有錯; 其後只收貼上期間之 console 與 pageerror
            assertNoErrors(ctx)
            ctx.logs.length = 0
            ctx.pageErrors.length = 0

            //act: 真滑鼠單擊起點格 + 真鍵盤 Ctrl+V
            await pasteByKeyboard(page, c.sel, c.text, c.start[0], c.start[1], { leaveEditor: c.leaveEditor !== false, beforeKey: c.beforeKey })

            //assert: 等宿主 opt.rows 達預期終態, 靜止後再確認未有後續變動
            await waitRows(page, key, c.optRows)
            await waitGridIdle(page, { scope: c.sel })
            //唯讀格不得被寫入、可編輯格照寫(宿主 opt.rows 與元件數據)
            assert.deepStrictEqual(await hostRows(page, key), c.optRows, '宿主之 opt.rows')
            assert.deepStrictEqual(await nowRows(page, key), now(c.nowInds ? c.nowInds.map((k) => c.optRows[k]) : c.optRows), '元件之數據')
            //使用者看得到的結果: 畫面各欄儲存格文字
            for (let col of Object.keys(c.screen)) {
                assert.deepStrictEqual(await columnTexts(page, c.sel, col), c.screen[col], `畫面 ${col} 欄`)
            }
            assertNoErrors(ctx)
            if (c.check) {
                await c.check(page, ctx)
            }
        })
    }

    //R22.2 ag-grid 自身之編輯入口與貼上之判斷一致: 同一欄 ro 列不開編輯器、非 ro 列開編輯器(對照組, 不執行貼上)
    it('PT14_clickParity ag-grid 自身之編輯入口(真滑鼠單擊;元件設 singleClickEdit)與貼上判斷一致:ro 列 b 不開編輯器、非 ro 列 b 開編輯器(對照組,不執行貼上)', async function() {
        let { page } = ctx
        let editing = async () => page.locator('#e1 .ag-cell-inline-editing').count()
        await waitGridIdle(page, { scope: '#e1' })
        //act: 點非 ro 列(第 0 列)之 b → 開編輯器
        await focusCell(page, '#e1', 0, 'b')
        assert.strictEqual(await editing(), 1, '非唯讀列之 b 應進入編輯')
        await page.keyboard.press('Escape')
        await waitUntilExist(page, '#e1 離開編輯器', () => !document.querySelector('#e1 .ag-cell-inline-editing'), { timeout: 10000 })
        //act: 點 ro 列(第 1 列)之 b → 不開編輯器; focusCell 以該格取得焦點(點擊已被 ag-grid 處理)為正向訊號後再斷言未進入編輯
        await focusCell(page, '#e1', 1, 'b')
        assert.strictEqual(await editing(), 0, '唯讀列之 b 不應進入編輯')
        assertNoErrors(ctx)
    })

})
