//opt.kpCellFormat 11 項(規則帳本 R06、R07)
//使用者路徑: ①開宿主頁(三張表格: 無 slot、只給 cell-tooltip、給 cell-render) ②看儲存格文字、停留儲存格看提示、點表頭排序、於浮動過濾輸入、點下載鈕
//③看到格式化後之文字、提示、排序與過濾結果、下載檔 ④過濾值以真鍵盤輸入 ⑤比對畫面文字與下載檔內容 ⑥副作用: 下載檔(存於 test/_tmp 讀回即刪)
import assert from 'assert'
import { openPage, pageUrl, columnTexts, waitColumnTexts, typeIntoFloatingFilter, readDownload, assertNoErrors, useTmpDir } from './tools/e2e-setup.mjs'
import { waitUntilExist } from './tools/e2eLib.mjs'

let tmp = useTmpDir('e2e-kpCellFormat')

let PRICE_FMT = ['35000.1', '32000.0', '72000.5']

//download, 真點擊下載鈕並讀回(ltdt 格式)
async function download(ctx, btn) {
    let [dl] = await Promise.all([ctx.page.waitForEvent('download', { timeout: 20000 }), ctx.page.click(btn)])
    return readDownload(dl, tmp.dir, 'ltdt')
}

describe('e2e-kpCellFormat:儲存格格式化', function() {
    let ctx = null

    before(function() {
        tmp.make()
    })

    after(function() {
        tmp.clean()
    })

    beforeEach(async function() {
        ctx = await openPage(pageUrl('kpCellFormat.html'), { viewport: { width: 1200, height: 1400 }, downloadsPath: tmp.dir })
    })

    afterEach(async function() {
        if (ctx) {
            await ctx.close()
        }
        ctx = null
    })

    it('F1 預設路徑:make 顯示大寫(R07)', async function() {
        assert.deepStrictEqual(await columnTexts(ctx.page, '#g1', 'make'), ['TOYOTA', 'FORD', 'PORSCHE'])
        assertNoErrors(ctx)
    })

    it('F2 預設路徑:price 顯示 1 位小數(R07)', async function() {
        assert.deepStrictEqual(await columnTexts(ctx.page, '#g1', 'price'), PRICE_FMT)
        assertNoErrors(ctx)
    })

    it('F3 格式化函數回傳 null:維持原值,null 與 undefined 顯示空白(R06、R07)', async function() {
        assert.deepStrictEqual(await columnTexts(ctx.page, '#g1', 'note'), ['', 'x', ''])
        assertNoErrors(ctx)
    })

    it('F4 只給 cell-tooltip 之 fallback 路徑:與預設路徑顯示相同(R06)', async function() {
        assert.deepStrictEqual(await columnTexts(ctx.page, '#g2', 'price'), PRICE_FMT)
        assertNoErrors(ctx)
    })

    it('F5 停留儲存格:cell-tooltip slot 拿到 valueFormatted(R06)', async function() {
        await ctx.page.locator('#g2 .ag-cell[col-id="price"]').first().hover()
        await waitUntilExist(ctx.page, '提示 tip:35000.1', () => document.body.innerText.includes('tip:35000.1'))
        assertNoErrors(ctx)
    })

    it('F6 cell-render slot:同時拿到 value 與 valueFormatted(R06)', async function() {
        assert.deepStrictEqual(await columnTexts(ctx.page, '#g3', 'price'), ['35000.129|35000.1', '32000|32000.0', '72000.5|72000.5'])
        assertNoErrors(ctx)
    })

    it('F7 點 price 表頭兩次:依原值數值降冪排序(R07)', async function() {
        let head = ctx.page.locator('#g1 .ag-header-cell[col-id="price"] .ag-header-cell-label').first()
        await head.click()
        await waitColumnTexts(ctx.page, '#g1', 'price', ['32000.0', '35000.1', '72000.5'])
        await head.click()
        await waitColumnTexts(ctx.page, '#g1', 'price', ['72000.5', '35000.1', '32000.0'])
        assertNoErrors(ctx)
    })

    it('F8 price 浮動過濾:依原值比對(35000.129 命中 1 列,35000.1 命中 0 列)(R07)', async function() {
        await typeIntoFloatingFilter(ctx.page, '#g1', 2, '35000.129')
        await waitColumnTexts(ctx.page, '#g1', 'price', ['35000.1'])
        await typeIntoFloatingFilter(ctx.page, '#g1', 2, '35000.1')
        await waitColumnTexts(ctx.page, '#g1', 'price', [])
        assertNoErrors(ctx)
    })

    it('F9 下載(useFormat 預設):輸出格式化值(R07、R14)', async function() {
        let f = await download(ctx, '#btnDl')
        assert.deepStrictEqual(f.data.map((r) => r.make), ['TOYOTA', 'FORD', 'PORSCHE'])
        assert.deepStrictEqual(f.data.map((r) => String(r.price)), PRICE_FMT)
        assertNoErrors(ctx)
    })

    it('F10 下載(useFormat 為 false):輸出原值(R07)', async function() {
        let f = await download(ctx, '#btnDlRaw')
        assert.deepStrictEqual(f.data.map((r) => r.make), ['Toyota', 'Ford', 'Porsche'])
        assert.deepStrictEqual(f.data.map((r) => Number(r.price)), [35000.129, 32000, 72000.5])
        assertNoErrors(ctx)
    })

    it('F11 下載後:表格之原始數據未被改動(R14)', async function() {
        await download(ctx, '#btnDl')
        let src = await ctx.page.evaluate(() => {
            let r = window.__vm.opt1.rows[0]
            return { make: r.make, price: r.price }
        })
        assert.deepStrictEqual(src, { make: 'Toyota', price: 35000.129 })
        assertNoErrors(ctx)
    })

})
