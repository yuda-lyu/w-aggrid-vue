//kpHeadFocusHighlight 之焦點框 4 項(規則帳本 R09)
//使用者路徑: ①開宿主頁(四欄: 關閉焦點框且無子控制項、關閉且內含 tabindex 元素、關閉且內含 button、預設) ②點儲存格或儲存格內之控制項
//③看到焦點框之有無 ④無輸入 ⑤比對儲存格邊框色與焦點狀態 ⑥無副作用
import assert from 'assert'
import { openPage, pageUrl, assertNoErrors } from './tools/e2e-setup.mjs'
import { waitUntilExist } from './tools/e2eLib.mjs'

//clickAndProbe, 真點擊第 0 列某欄之儲存格(或其內之控制項), 等焦點落定後讀儲存格之邊框與焦點狀態
async function clickAndProbe(page, col, innerSel) {
    let cellSel = `#g1 .ag-center-cols-container .ag-row[row-index="0"] .ag-cell[col-id="${col}"]`
    let cell = page.locator(cellSel)
    if (innerSel) {
        await cell.locator(innerSel).first().click()
    }
    else {
        await cell.click()
    }
    await waitUntilExist(page, `${col} 欄取得焦點`, (s) => document.querySelector(s).matches(':focus-within'), { arg: cellSel })
    return page.evaluate((s) => {
        let c = document.querySelector(s)
        let cs = getComputedStyle(c)
        return { borderColor: cs.borderColor, focus: c.matches(':focus'), focusWithin: c.matches(':focus-within') }
    }, cellSel)
}
let BLUE = 'rgb(0, 145, 234)'
let isTransparent = (bc) => bc.includes('rgba(0, 0, 0, 0)') || bc.includes('transparent')

describe('e2e-focus:焦點框', function() {
    let ctx = null

    beforeEach(async function() {
        ctx = await openPage(pageUrl('focus.html'), { viewport: { width: 1200, height: 500 } })
    })

    afterEach(async function() {
        if (ctx) {
            await ctx.close()
        }
        ctx = null
    })

    it('FO1 預設欄點擊:出現藍色焦點框(R09 對照)', async function() {
        let r = await clickAndProbe(ctx.page, 'keep')
        assert.ok(r.borderColor.includes(BLUE), r.borderColor)
        assert.ok(r.focus)
        assertNoErrors(ctx)
    })

    it('FO2 關閉焦點框之欄(無子控制項)點擊:無焦點框(R09)', async function() {
        let r = await clickAndProbe(ctx.page, 'plain')
        assert.ok(isTransparent(r.borderColor), r.borderColor)
        assert.ok(r.focus)
        assertNoErrors(ctx)
    })

    it('FO3 關閉焦點框之欄點擊其內 tabindex 元素:無焦點框(:focus-within)(R09)', async function() {
        let r = await clickAndProbe(ctx.page, 'ctrl', '.inner-ctrl')
        assert.ok(isTransparent(r.borderColor), r.borderColor)
        assert.ok(r.focusWithin && !r.focus, JSON.stringify(r))
        assertNoErrors(ctx)
    })

    it('FO4 關閉焦點框之欄點擊其內 button:無焦點框(:focus-within)(R09)', async function() {
        let r = await clickAndProbe(ctx.page, 'btn', '.inner-btn')
        assert.ok(isTransparent(r.borderColor), r.borderColor)
        assert.ok(r.focusWithin && !r.focus, JSON.stringify(r))
        assertNoErrors(ctx)
    })

})
