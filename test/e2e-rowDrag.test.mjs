//列拖曳排序(kpRowDrag)後寫回 opt.rows 須保留各列之全部欄位(規則帳本 R23; 第 6 節原 #18)
//每案之使用者路徑(6 步):
//  ①開宿主頁 test/pages/rowDrag.html(r1 之列含不在 keys 內之欄位 ro、note; b 欄 editable 為函數, ro 為 true 之列唯讀)
//  ②真滑鼠移到某列 a 欄之拖曳把手並按住 ③移動到目標列(必要時繼續移出表格) ④放開滑鼠
//  ⑤觀察: 畫面 a 欄之列序、宿主 opt.rows(列序、各列全部欄位、是否仍為原列物件)、元件數據(getNowData, 只含 keys)、回呼收到之值、console 與 pageerror
//  ⑥其後以真滑鼠單擊 b 欄儲存格, 觀察唯讀列不開編輯器(editable 函數所依之 ro 旗標仍在)
//拖曳之終止路徑有二: 放開時游標仍在表格內(ag-grid 觸發 rowDragEnd)、放開前已移出表格(只觸發 rowDragLeave), 元件對兩者共用同一寫回(triggerRowDragChange), 故兩路徑皆測
//ag-grid 於排序生效時隱藏拖曳把手(managed drag 不可用, 實測 .ag-row-drag 帶 ag-hidden), 故排序中拖曳不屬使用者可達之路徑, 不測
//標準圖: 本套件未產製標準圖(規則帳本 7.4/9, 待使用者裁示), 本檔不新增; 視覺面以畫面儲存格文字之語意斷言代替
import assert from 'assert'
import { openPage, pageUrl, columnTexts, waitColumnTexts, assertNoErrors, focusCell, hostRows, nowRows, waitRows } from './tools/e2e-setup.mjs'
import { waitGridIdle, waitUntilExist } from './tools/e2eLib.mjs'

//宿主頁 r1、r3 之原列(ro、note 不在 keys 內)
let R = [
    { a: 'a0', b: 'b0', c: 'c0', ro: false, note: 'n0' },
    { a: 'a1', b: 'b1', c: 'c1', ro: true, note: 'n1' },
    { a: 'a2', b: 'b2', c: 'c2', ro: false, note: 'n2' },
]
//only, 只取 keys(a、b、c)之欄位
let only = (rows) => rows.map((r) => ({ a: r.a, b: r.b, c: r.c }))
//order, 依索引排列原列
let order = (inds) => inds.map((i) => R[i])

let recs = (page) => page.evaluate(() => JSON.parse(JSON.stringify(window.__rd)))
//sameObjs, 宿主 opt.rows 是否恰為頁面載入時那批原列物件依 inds 排列(物件身分, 非僅值相等: 寫回不得複製或提取成新物件)
let sameObjs = (page, key, inds) => page.evaluate(({ k, inds }) => {
    let rows = window.__vm.opt[k].rows
    return rows.length === inds.length && inds.every((j, i) => rows[i] === window.__orig[k][j])
}, { k: key, inds })

//dragRow, 真滑鼠拖曳: 按住第 from 列 a 欄之把手 → 分段移動到第 to 列把手之上緣或下緣(依方向越過其中線)
//  → [roundTrip 時分段移回第 from 列] → [outside 時繼續移出表格外: 向下拖移到表格下緣外, 向上拖移到表格上緣外] → 放開
//  moveOnly 時只移開 8px 即放開(不離開原列)
async function dragRow(page, sel, from, to, { outside = false, moveOnly = false, roundTrip = false } = {}) {
    let g = await page.locator(sel).boundingBox()
    let hs = page.locator(`${sel} .ag-row-drag`)
    let b0 = await hs.nth(from).boundingBox()
    let b1 = await hs.nth(to).boundingBox()
    let x = b0.x + b0.width / 2
    let y = b0.y + b0.height / 2
    let dir = to > from ? 1 : -1
    await page.mouse.move(x, y)
    await page.mouse.down()
    //先移開一小段才算開始拖曳
    await page.mouse.move(x, y + dir * 8, { steps: 4 })
    if (!moveOnly) {
        await page.mouse.move(x, b1.y + b1.height / 2 + dir * 10, { steps: 12 })
    }
    if (roundTrip) {
        await page.mouse.move(x, y, { steps: 12 })
    }
    if (outside) {
        await page.mouse.move(x, dir > 0 ? g.y + g.height + 12 : Math.max(2, g.y - 12), { steps: 12 })
    }
    await page.mouse.up()
}

//每案: [代號, 說明, 起點列, 終點列, 是否移出表格, 預期畫面列序(原列索引), 預期終止回呼('end' 或 'leave'), 預期 indFrom、indTo]
let cases = [
    ['RD1_downInside', '列 0 向下拖到列 2 之位置並在表格內放開(rowDragEnd):畫面為 a1、a2、a0,opt.rows 依新序且各列保留 ro、note', 0, 2, false, [1, 2, 0], 'end', [0, 2]],
    ['RD2_downOutside', '列 0 向下拖到列 2 之位置後移出表格再放開(只觸發 rowDragLeave):畫面為 a1、a2、a0,opt.rows 依新序且各列保留 ro、note', 0, 2, true, [1, 2, 0], 'leave', [0, 2]],
    ['RD3_upInside', '列 2 向上拖到列 0 之位置並在表格內放開:畫面為 a2、a0、a1,opt.rows 依新序且各列保留 ro、note', 2, 0, false, [2, 0, 1], 'end', [2, 0]],
    ['RD4_upOutside', '列 2 向上拖到列 0 之位置後移出表格再放開:畫面為 a2、a0、a1,opt.rows 依新序且各列保留 ro、note', 2, 0, true, [2, 0, 1], 'leave', [2, 0]],
]

describe('e2e-rowDrag:列拖曳排序後 opt.rows 保留列之全部欄位', function() {
    let ctx = null

    beforeEach(async function() {
        ctx = await openPage(pageUrl('rowDrag.html'), { minCells: 12 })
    })

    afterEach(async function() {
        if (ctx) {
            await ctx.close()
        }
        ctx = null
    })

    for (let [id, title, from, to, outside, shown, endKind, [indFrom, indTo]] of cases) {
        it(`${id} ${title}`, async function() {
            let { page } = ctx
            await waitGridIdle(page, { scope: '#r1' })
            assertNoErrors(ctx)

            //act: 真滑鼠拖曳
            await dragRow(page, '#r1', from, to, { outside })

            //assert: 等回呼 rowDragChange 觸發(寫回 opt.rows 之同一時點), 靜止後再確認未有後續變動
            await waitUntilExist(page, 'rowDragChange 已觸發', () => window.__rd.change.length >= 1, { timeout: 10000 })
            await waitGridIdle(page, { scope: '#r1' })
            //使用者看得到的結果: 畫面 a 欄之列序
            await waitColumnTexts(page, '#r1', 'a', shown.map((i) => R[i].a))
            //列拖曳排序後宿主之 opt.rows: 依新序, 且各列保留全部欄位(含不在 keys 內之 ro、note)
            assert.deepStrictEqual(await hostRows(page, 'r1'), order(shown), '宿主之 opt.rows(依新序, 各列保留全部欄位)')
            //寫回之列為原列物件(身分不變), 不是提取或複製出來的新物件
            assert.strictEqual(await sameObjs(page, 'r1', shown), true, '宿主之 opt.rows 內各列為原列物件')
            //元件數據(getNowData)為依 keys 提取者, 只含 a、b、c
            assert.deepStrictEqual(await nowRows(page, 'r1'), only(order(shown)), '元件之數據(getNowData)')
            //回呼: 終止路徑對應之回呼各 1 次, 收到之 row 為被拖曳之整列, rows 為依 keys 提取之新序數據(回呼之 rows 既有行為不變)
            let rd = await recs(page)
            let other = endKind === 'end' ? 'leave' : 'end'
            assert.strictEqual(rd[endKind].length, 1, `${endKind} 回呼次數`)
            assert.strictEqual(rd[other].length, 0, `${other} 回呼次數`)
            assert.strictEqual(rd.change.length, 1, 'rowDragChange 回呼次數')
            for (let m of [rd[endKind][0], rd.change[0]]) {
                assert.strictEqual(m.indFrom, indFrom, 'indFrom')
                assert.strictEqual(m.indTo, indTo, 'indTo')
                assert.deepStrictEqual(m.row, R[from], '被拖曳之列(row)')
                assert.deepStrictEqual(m.rows, only(order(shown)), '回呼之 rows(依 keys 提取)')
            }
            assertNoErrors(ctx)
        })
    }

    //spec: 拖曳不影響 editable 函數(b 欄 ro 列唯讀)所依之旗標; 唯讀列拖曳後仍不可編輯, 非唯讀列仍可編輯
    it('RD5_editableAfterDrag 拖曳排序後以真滑鼠單擊 b 欄:ro 列(原列 1,現於畫面第 0 列)不開編輯器、非 ro 列(原列 2,現於畫面第 1 列)開編輯器', async function() {
        let { page } = ctx
        let editing = () => page.locator('#r1 .ag-cell-inline-editing').count()
        //ag-grid 自身對某儲存格之可編輯判斷(column.isCellEditable), 供對照
        let agEditable = (ri) => page.evaluate((r) => {
            let api = window.__vm.$refs.r1.getApi()
            return api.getColumn('b').isCellEditable(api.getDisplayedRowAtIndex(r))
        }, ri)
        await waitGridIdle(page, { scope: '#r1' })

        //act: 拖曳列 0 到列 2 之位置(列序變為 a1、a2、a0)
        await dragRow(page, '#r1', 0, 2)
        await waitUntilExist(page, 'rowDragChange 已觸發', () => window.__rd.change.length >= 1, { timeout: 10000 })
        await waitGridIdle(page, { scope: '#r1' })
        await waitColumnTexts(page, '#r1', 'a', ['a1', 'a2', 'a0'])

        //ag-grid 自身之判斷: 畫面第 0 列(a1, ro)b 欄不可編輯, 第 1 列(a2)可編輯
        assert.strictEqual(await agEditable(0), false, 'ag-grid 對畫面第 0 列(ro)b 欄之判斷為不可編輯')
        assert.strictEqual(await agEditable(1), true, 'ag-grid 對畫面第 1 列 b 欄之判斷為可編輯')

        //act: 單擊 ro 列之 b 欄 → 不開編輯器
        await focusCell(page, '#r1', 0, 'b')
        assert.strictEqual(await editing(), 0, '唯讀列之 b 不應進入編輯')
        //act: 單擊非 ro 列之 b 欄 → 開編輯器
        await focusCell(page, '#r1', 1, 'b')
        await waitUntilExist(page, '#r1 編輯器已開', () => !!document.querySelector('#r1 .ag-cell-inline-editing'), { timeout: 10000 })
        assert.strictEqual(await editing(), 1, '非唯讀列之 b 應進入編輯')
        assertNoErrors(ctx)
    })

    //列只含 keys 內之欄位時行為不變(對照組): 依新序、值不變
    it('RD6_keysOnlyRows 列只含 keys 內之欄位:列 0 向下拖到列 2 之位置後 opt.rows 依新序、各列值不變', async function() {
        let { page } = ctx
        await waitGridIdle(page, { scope: '#r2' })
        await dragRow(page, '#r2', 0, 2)
        await waitUntilExist(page, 'rowDragChange 已觸發', () => window.__rd.change.length >= 1, { timeout: 10000 })
        await waitGridIdle(page, { scope: '#r2' })
        await waitColumnTexts(page, '#r2', 'a', ['a1', 'a2', 'a0'])
        assert.deepStrictEqual(await hostRows(page, 'r2'), only(order([1, 2, 0])), '宿主之 opt.rows')
        assert.deepStrictEqual(await nowRows(page, 'r2'), only(order([1, 2, 0])), '元件之數據')
        assertNoErrors(ctx)
    })

    //拖曳後放回原位(indFrom 等於 indTo): 不視為變更, 不觸發 rowDragChange, opt.rows 不變且仍保留全部欄位
    it('RD7_dropSamePlace 按住列 0 把手略移動後在原位放開:不觸發 rowDragChange,opt.rows 不變(各列仍保留 ro、note)', async function() {
        let { page } = ctx
        await waitGridIdle(page, { scope: '#r1' })
        await dragRow(page, '#r1', 0, 1, { moveOnly: true })
        //rowDragEnd 觸發(放開之訊號)後再觀察一段靜止窗確認未多發 rowDragChange
        await waitUntilExist(page, 'rowDragEnd 已觸發', () => window.__rd.end.length >= 1, { timeout: 10000 })
        await page.waitForTimeout(500)
        await waitGridIdle(page, { scope: '#r1' })
        let rd = await recs(page)
        assert.strictEqual(rd.end.length, 1, 'rowDragEnd 回呼次數')
        assert.strictEqual(rd.end[0].indFrom, 0, 'indFrom')
        assert.strictEqual(rd.end[0].indTo, 0, 'indTo')
        assert.strictEqual(rd.change.length, 0, '原位放開不應觸發 rowDragChange')
        assert.deepStrictEqual(await columnTexts(page, '#r1', 'a'), ['a0', 'a1', 'a2'], '畫面 a 欄')
        assert.deepStrictEqual(await hostRows(page, 'r1'), R, '宿主之 opt.rows 不變')
        assert.strictEqual(await sameObjs(page, 'r1', [0, 1, 2]), true, '宿主之 opt.rows 內各列為原列物件')
        assertNoErrors(ctx)
    })

    //同一次拖曳中拖到別列後又拖回原位再放開: 終點索引等於起點, 同原位放開
    it('RD8_roundTrip 列 0 向下拖到列 2 之位置後又拖回列 0 之位置再放開:不觸發 rowDragChange,畫面與 opt.rows 皆回原序', async function() {
        let { page } = ctx
        await waitGridIdle(page, { scope: '#r1' })
        await dragRow(page, '#r1', 0, 2, { roundTrip: true })
        await waitUntilExist(page, 'rowDragEnd 已觸發', () => window.__rd.end.length >= 1, { timeout: 10000 })
        await page.waitForTimeout(500)
        await waitGridIdle(page, { scope: '#r1' })
        await waitColumnTexts(page, '#r1', 'a', ['a0', 'a1', 'a2'])
        let rd = await recs(page)
        assert.strictEqual(rd.end.length, 1, 'rowDragEnd 回呼次數')
        assert.strictEqual(rd.end[0].indFrom, 0, 'indFrom')
        assert.strictEqual(rd.end[0].indTo, 0, 'indTo')
        assert.strictEqual(rd.change.length, 0, '回到原位放開不應觸發 rowDragChange')
        assert.deepStrictEqual(await hostRows(page, 'r1'), R, '宿主之 opt.rows 不變')
        assertNoErrors(ctx)
    })

    //宿主於終止回呼(rowDragEnd)內銷毀 ag-grid: 寫回之列須在回呼之前取得, 否則銷毀後取得空列而把 opt.rows 清空
    //銷毀後 ag-grid 對已銷毀之 api 印 warning(console type 為 warning, 屬呼叫端經 getApi 銷毀之既有限制, 規則帳本第 6 節 #16), 不是 error
    it('RD9_callbackDestroysGrid rowDragEnd 回呼內銷毀 ag-grid:opt.rows 仍依新序、保留全部欄位與原列物件,rowDragChange 仍觸發,無 pageerror', async function() {
        let { page } = ctx
        await waitGridIdle(page, { scope: '#r3' })
        await dragRow(page, '#r3', 0, 2)
        await waitUntilExist(page, 'rowDragChange 已觸發', () => window.__rd.change.length >= 1, { timeout: 10000 })
        await waitRows(page, 'r3', order([1, 2, 0]))
        assert.deepStrictEqual(await hostRows(page, 'r3'), order([1, 2, 0]), '宿主之 opt.rows(依新序, 各列保留全部欄位)')
        assert.strictEqual(await sameObjs(page, 'r3', [1, 2, 0]), true, '宿主之 opt.rows 內各列為原列物件')
        let rd = await recs(page)
        assert.strictEqual(rd.end.length, 1, 'rowDragEnd 回呼次數')
        assert.strictEqual(rd.change.length, 1, 'rowDragChange 回呼次數')
        assertNoErrors(ctx)
    })

})
