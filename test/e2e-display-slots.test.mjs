//slot 兩路徑一致與自訂表頭之互動指示 8 項(規則帳本 R06、R08、R10)
//使用者路徑: ①開宿主頁(四張表格: 無 slot、只給 cell-tooltip、給 head-render、opt 含已移除之 4 個鍵) ②看儲存格文字與表頭圖示、於浮動過濾輸入、點表頭排序(含 Shift 多欄排序)、點宿主按鈕重新設定
//③看到顯示文字、過濾圖示、選單鈕、排序圖示與序號、console 警告 ④過濾值以真鍵盤輸入 ⑤比對自訂表頭與預設表頭之指示一致 ⑥無副作用
import assert from 'assert'
import { openPage, pageUrl, columnTexts, typeIntoFloatingFilter, assertNoErrors } from './tools/e2e-setup.mjs'
import { waitUntilExist, waitGridIdle } from './tools/e2eLib.mjs'

//filterIcon, 某表 make 欄表頭之過濾圖示狀態
function filterIcon(page, gridSel) {
    return page.evaluate((s) => {
        let el = document.querySelector(`${s} .ag-header-cell[col-id="make"] .ag-filter-icon`)
        if (!el) {
            return { has: false }
        }
        return { has: true, hidden: el.classList.contains('ag-hidden') || getComputedStyle(el).display === 'none' }
    }, gridSel)
}

describe('e2e-display-slots:slot 路徑與自訂表頭', function() {
    let ctx = null

    beforeEach(async function() {
        ctx = await openPage(pageUrl('slots.html'), { viewport: { width: 1400, height: 1600 }, minCells: 40 })
    })

    afterEach(async function() {
        if (ctx) {
            await ctx.close()
        }
        ctx = null
    })

    it('S1 無 slot 與只給 cell-tooltip 之兩表:物件欄顯示相同(R06)', async function() {
        let g1 = await columnTexts(ctx.page, '#g1', 'obj')
        let g2 = await columnTexts(ctx.page, '#g2', 'obj')
        assert.deepStrictEqual(g1, ['{"a":1,"b":[1,2]}', '{"a":2,"b":[]}', ''])
        assert.deepStrictEqual(g2, g1)
        assertNoErrors(ctx)
    })

    it('S2 head-render 表頭:選單鈕常駐,與預設表頭相同(R08)', async function() {
        let f = (s) => ctx.page.evaluate((sel) => {
            let el = document.querySelector(`${sel} .ag-header-cell[col-id="make"] .ag-header-cell-menu-button`)
            return el ? { opacity: getComputedStyle(el).opacity, always: el.className.includes('ag-header-menu-always-show') } : null
        }, s)
        let g1 = await f('#g1')
        let g3 = await f('#g3')
        assert.ok(g3, '自訂表頭應有選單鈕')
        assert.strictEqual(g3.opacity, g1.opacity)
        assert.ok(g3.always, '應帶 ag-header-menu-always-show')
        assertNoErrors(ctx)
    })

    it('S3 過濾前:過濾圖示存在且隱藏,自訂表頭與預設表頭相同(R08)', async function() {
        assert.deepStrictEqual(await filterIcon(ctx.page, '#g1'), { has: true, hidden: true })
        assert.deepStrictEqual(await filterIcon(ctx.page, '#g3'), { has: true, hidden: true })
        assertNoErrors(ctx)
    })

    it('S4 於 make 浮動過濾輸入 To:兩表皆剩 1 列且過濾圖示顯示(R08)', async function() {
        for (let s of ['#g1', '#g3']) {
            await typeIntoFloatingFilter(ctx.page, s, 0, 'To')
        }
        for (let s of ['#g1', '#g3']) {
            await waitUntilExist(ctx.page, `${s} 過濾後剩 1 列且圖示顯示`, (sel) => {
                let el = document.querySelector(`${sel} .ag-header-cell[col-id="make"] .ag-filter-icon`)
                let shown = el && !el.classList.contains('ag-hidden') && getComputedStyle(el).display !== 'none'
                return shown && document.querySelectorAll(`${sel} .ag-center-cols-container .ag-row`).length === 1
            }, { arg: s })
        }
        assertNoErrors(ctx)
    })

    //removedWarns, 已移除之 4 個鍵之警告各幾則
    function removedWarns(logs) {
        let warns = logs.filter((m) => m.type === 'warning').map((m) => m.text)
        let n = (k, slot) => warns.filter((v) => v === `[w-aggrid-vue] opt.${k} was removed in 2.0.56, use scoped slot '${slot}' instead`).length
        return { kpCellRender: n('kpCellRender', 'cell-render'), kpCellTooltip: n('kpCellTooltip', 'cell-tooltip'), kpHeadRender: n('kpHeadRender', 'head-render'), kpHeadTooltip: n('kpHeadTooltip', 'head-tooltip') }
    }

    it('S5 opt 含已移除之 4 個鍵:各警告 1 次並指出對應 slot(R10)', async function() {
        assert.deepStrictEqual(removedWarns(ctx.logs), { kpCellRender: 1, kpCellTooltip: 1, kpHeadRender: 1, kpHeadTooltip: 1 })
        assertNoErrors(ctx)
    })

    it('S7 宿主重新設定 opt(仍含已移除之鍵):同一表格不再警告(R10 每實例一次)', async function() {
        await ctx.page.click('#btnReplaceOpt4')
        await waitGridIdle(ctx.page, { scope: '#g4' })
        //負向觀察窗: 重新設定後不得再出現警告
        await ctx.page.waitForTimeout(500)
        assert.deepStrictEqual(removedWarns(ctx.logs), { kpCellRender: 1, kpCellTooltip: 1, kpHeadRender: 1, kpHeadTooltip: 1 })
        assertNoErrors(ctx)
    })

    it('S8 以 Shift 多欄排序 make、model:預設表頭與 head-render 表頭皆顯示序號 1、2(R08 對稱)', async function() {
        for (let s of ['#g1', '#g3']) {
            await ctx.page.locator(`${s} .ag-header-cell[col-id="make"] .ag-header-cell-label`).first().click()
            await ctx.page.locator(`${s} .ag-header-cell[col-id="model"] .ag-header-cell-label`).first().click({ modifiers: ['Shift'] })
        }
        for (let s of ['#g1', '#g3']) {
            await waitUntilExist(ctx.page, `${s} 之排序序號 1、2`, (sel) => {
                let f = (c) => {
                    let e = document.querySelector(`${sel} .ag-header-cell[col-id="${c}"] .ag-sort-order`)
                    return e && !e.classList.contains('ag-hidden') ? e.innerText.trim() : ''
                }
                return f('make') === '1' && f('model') === '2'
            }, { arg: s })
        }
        assertNoErrors(ctx)
    })

    it('S6 點 head-render 表頭之 make:出現升冪排序圖示(R08)', async function() {
        await ctx.page.locator('#g3 .ag-header-cell[col-id="make"] .ag-header-cell-label').first().click()
        await waitUntilExist(ctx.page, '升冪排序圖示', () => !!document.querySelector('#g3 .ag-header-cell[col-id="make"] .ag-sort-ascending-icon'))
        assertNoErrors(ctx)
    })

})
