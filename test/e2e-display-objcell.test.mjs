//物件格 16 格(規則帳本 R06): 儲存格值為物件、陣列、循環參照等時整表照常渲染
//使用者路徑: ①開宿主頁(8 欄 × 2 列, 值含字串、數值、布林、null、undefined、物件、陣列、循環參照) ②無操作 ③看到全部儲存格之文字
//④無輸入 ⑤比對 16 格之顯示文字、無頁面錯誤 ⑥無副作用
import assert from 'assert'
import { openPage, pageUrl, assertNoErrors } from './tools/e2e-setup.mjs'

describe('e2e-display-objcell:各型別儲存格之顯示', function() {
    let ctx = null

    afterEach(async function() {
        if (ctx) {
            await ctx.close()
        }
        ctx = null
    })

    it('OC1 16 格:物件與陣列為 JSON 字串、循環參照與 null、undefined 為空白,其餘原樣,無例外(R06)', async function() {
        //表寬 1800px, 視窗須夠寬, 否則欄位虛擬化不渲染右側欄
        ctx = await openPage(pageUrl('objcell.html'), { viewport: { width: 1900, height: 500 }, minCells: 16 })
        let cells = await ctx.page.evaluate(() => {
            let rows = Array.from(document.querySelectorAll('#g1 .ag-center-cols-container .ag-row'))
            rows.sort((a, b) => Number(a.getAttribute('row-index')) - Number(b.getAttribute('row-index')))
            return rows.map((r) => {
                let o = {}
                r.querySelectorAll('.ag-cell').forEach((c) => {
                    o[c.getAttribute('col-id')] = c.innerText
                })
                return o
            })
        })
        assert.deepStrictEqual(cells, [
            { k1: 'str', k2: '12.5', k3: 'true', k4: '', k5: '', k6: '{"mode":"diff","origin":1,"new":2}', k7: '[1,"a",{"b":2}]', k8: '' },
            { k1: '', k2: '0', k3: 'false', k4: '', k5: '', k6: '{}', k7: '[]', k8: '' },
        ])
        assertNoErrors(ctx)
    })

})
