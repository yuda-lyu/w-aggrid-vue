//官方範例(對外文件)之下載 3 頁(規則帳本 R12、R13、R18)
//使用者路徑: ①開 docs/examples 之範例頁(CDN 資源一律路由至本機, w-aggrid-vue 為本地 dist) ②無操作: 範例於掛載後自行執行(downloadData 立即; downloadDisplayData、getDisplayData 於 1 秒隱藏欄位、2 秒設表頭過濾、3 秒後執行)
//③看到下載檔與頁面上之 #ckmsg ④無輸入 ⑤比對下載檔與 #ckmsg 之數據 ⑥副作用: 下載檔(存於 test/_tmp 讀回即刪)
import assert from 'assert'
import { openPage, exampleUrl, readDownload, assertNoErrors, normMat, loadFixtureData, useTmpDir } from './tools/e2e-setup.mjs'
import { waitUntilExist, pollUntil } from './tools/e2eLib.mjs'

let tmp = useTmpDir('e2e-examples-download')

//dataEasy, 範例所用之資料(取自入版控之 fixture)
let dataEasy = loadFixtureData('dataEasy')
let HEAD = ['make(製作)', 'model(モデル)', 'price(价钱)']
//價格低於 50000 之列, 欄位為 price、make(範例之 showKeys 與 setHeadFilter)
let FILTERED = dataEasy.filter((r) => r.price < 50000).map((r) => ({ price: r.price, make: r.make }))

//ckData, 讀 #ckmsg 中 'data: ' 之後之 JSON
function ckData(ck) {
    let i = ck.indexOf('data: ')
    return i >= 0 ? JSON.parse(ck.slice(i + 6)) : null
}

//openExample, 開範例頁(下載事件自開頁起即由 ctx.downloads 收集)
function openExample(name) {
    return openPage(exampleUrl(name), { routeExternalResources: true, viewport: { width: 1400, height: 900 }, downloadsPath: tmp.dir })
}

//assertRouted, 外部資源皆由本機供應且確實載入本地 dist
function assertRouted(ctx) {
    assert.deepStrictEqual(ctx.external.unmapped, [], '未對照之外部資源')
    assert.ok(ctx.external.mapped.includes('w-aggrid-vue'), '應載入本地 dist')
}

describe('e2e-examples-download:官方下載範例', function() {
    let ctx = null

    before(function() {
        tmp.make()
    })

    after(function() {
        tmp.clean()
    })

    afterEach(async function() {
        if (ctx) {
            await ctx.close()
        }
        ctx = null
    })

    it('EXD1 ex-downloadData:下載中文表頭與全部 13 列,#ckmsg 為回傳之二維陣列(R12、R18)', async function() {
        ctx = await openExample('ex-downloadData.html')
        await waitUntilExist(ctx.page, '#ckmsg 顯示 downloadData', () => /trigger: downloadData/.test(document.querySelector('#ckmsg').textContent))
        await pollUntil('下載檔', () => ctx.downloads.length >= 1, { timeout: 20000 })
        let f = await readDownload(ctx.downloads[0], tmp.dir)
        let exp = [HEAD, ...dataEasy.map((r) => [r.make, r.model, r.price])]
        assert.strictEqual(f.fileName, 'data.xlsx')
        assert.strictEqual(f.sheet, 'data')
        assert.deepStrictEqual(normMat(f.data), normMat(exp))
        let ck = await ctx.page.evaluate(() => document.querySelector('#ckmsg').textContent)
        assert.deepStrictEqual(ckData(ck), exp)
        assertRouted(ctx)
        assertNoErrors(ctx)
    })

    it('EXD2 ex-downloadDisplayData:只下載顯示欄 price、make 與過濾後之 5 列(R13、R18)', async function() {
        ctx = await openExample('ex-downloadDisplayData.html')
        await waitUntilExist(ctx.page, '#ckmsg 顯示 downloadDisplayData', () => /trigger: downloadDisplayData/.test(document.querySelector('#ckmsg').textContent), { timeout: 20000 })
        await pollUntil('下載檔', () => ctx.downloads.length >= 1, { timeout: 20000 })
        let f = await readDownload(ctx.downloads[0], tmp.dir)
        let exp = [['price(价钱)', 'make(製作)'], ...FILTERED.map((r) => [r.price, r.make])]
        assert.deepStrictEqual(normMat(f.data), normMat(exp))
        let ck = await ctx.page.evaluate(() => document.querySelector('#ckmsg').textContent)
        assert.deepStrictEqual(ckData(ck), exp)
        assertRouted(ctx)
        assertNoErrors(ctx)
    })

    it('EXD3 ex-getDisplayData:#ckmsg 為顯示欄與過濾後之 5 列(R13、R18)', async function() {
        ctx = await openExample('ex-getDisplayData.html')
        await waitUntilExist(ctx.page, '#ckmsg 顯示 getDisplayData', () => /trigger: getDisplayData/.test(document.querySelector('#ckmsg').textContent), { timeout: 20000 })
        let ck = await ctx.page.evaluate(() => document.querySelector('#ckmsg').textContent)
        assert.deepStrictEqual(ckData(ck), FILTERED)
        assert.strictEqual(ctx.downloads.length, 0, '不應下載')
        assertRouted(ctx)
        assertNoErrors(ctx)
    })

})
