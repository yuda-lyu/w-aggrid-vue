//官方範例(對外文件)之上傳 8 情境(規則帳本 R17、R18)
//使用者路徑: ①開 ex-uploadData 或 ex-uploadDataWithConvertKeys(CDN 資源一律路由至本機) ②選上傳模式(radio)後點上傳鈕(真點擊)
//③選檔視窗開啟 ④選入該情境之 xlsx ⑤看到表格被取代、附加或維持原樣,#ckmsg 或 console 之結果 ⑥副作用: 表格數據(每情境新頁面)
import assert from 'assert'
import { openPage, exampleUrl, writeXlsx, assertNoErrors, loadFixtureData, useTmpDir } from './tools/e2e-setup.mjs'
import { waitUntilExist, waitGridIdle, pollUntil } from './tools/e2eLib.mjs'

let tmp = useTmpDir('e2e-examples-upload')

let dataEasy = loadFixtureData('dataEasy')
let mats = {
    ok: [['make', 'model', 'price'], ['BMW', 'Sedan', 66000]],
    noteMixed: [['make', 'model', 'price', null], ['BMW', 'Sedan', 66000, null], [null, null, null, 'note']],
    headOnly: [['make', 'model', 'price']],
    idHead: [['id', 'mappingId', 'order'], ['BMW', 'Sedan', 66000]],
    cnHead: [['製造商', '型號', '價格'], ['BMW', 'Sedan', 66000]],
}
let files = {}
let BMW = [{ make: 'BMW', model: 'Sedan', price: '66000' }]
let BLANK = { make: '', model: '', price: '' }

//每情境: [代號, 說明, 頁面, 模式 radio(null 為不切換), 按鈕文字, 檔案, 應然]; resolve 者比對表格並確認 #ckmsg 顯示 uploadData, reject 者表格不變並比對 console
let scenes = [
    ['EXU-E1', '取代模式、第 1 分頁:表格換成檔案內容', 'ex-uploadData', 'replace', 'use first sheet', 'ok', { rows: BMW }],
    ['EXU-E2', '附加模式、第 1 分頁:附加於原 13 列之後', 'ex-uploadData', 'append', 'use first sheet', 'ok', { rows: [...dataEasy, ...BMW] }],
    ['EXU-E3', '取代模式、第 2 分頁而檔案只有 1 分頁:表格不變並記錄錯誤', 'ex-uploadData', 'replace', 'use second sheet', 'ok', { rows: dataEasy, log: /can not get data from sheet/ }],
    ['EXU-E4', '取代模式、表格旁有備註欄:備註列寫為空白列', 'ex-uploadData', 'replace', 'use first sheet', 'noteMixed', { rows: [...BMW, BLANK] }],
    ['EXU-E5', '取代模式、只有表頭之檔:表格不被清空並記錄 no data', 'ex-uploadData', 'replace', 'use first sheet', 'headOnly', { rows: dataEasy, log: /no data/ }],
    ['EXU-K1', '鍵轉換範例、表頭 id/mappingId/order:轉為 make/model/price', 'ex-uploadDataWithConvertKeys', null, 'kpConvertKeysWhenUploadData', 'idHead', { rows: BMW }],
    ['EXU-K2', '鍵轉換範例、表頭即為 keys:照常寫入', 'ex-uploadDataWithConvertKeys', null, 'kpConvertKeysWhenUploadData', 'ok', { rows: BMW }],
    ['EXU-K3', '鍵轉換範例、中文表頭:表格不變並記錄 no matching keys', 'ex-uploadDataWithConvertKeys', null, 'kpConvertKeysWhenUploadData', 'cnHead', { rows: dataEasy, log: /no matching keys/ }],
]

describe('e2e-examples-upload:官方上傳範例', function() {
    let ctx = null

    before(async function() {
        tmp.make()
        for (let k of Object.keys(mats)) {
            files[k] = await writeXlsx(tmp.file(`${k}.xlsx`), mats[k])
        }
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

    for (let [id, title, pg, mode, btn, file, exp] of scenes) {
        it(`${id} ${pg}:${title}(R17、R18)`, async function() {
            ctx = await openPage(exampleUrl(`${pg}.html`), { routeExternalResources: true })
            if (mode) {
                await ctx.page.click(`#${mode}`)
            }
            let chooserP = ctx.page.waitForEvent('filechooser', { timeout: 10000 })
            await ctx.page.click(`button:has-text("${btn}")`)
            let chooser = await chooserP
            await chooser.setFiles(files[file])
            if (exp.log) {
                //reject 時範例以 console.log 記錄錯誤物件
                await pollUntil(`console 出現 ${exp.log}`, () => ctx.logs.some((m) => exp.log.test(m.text)), { timeout: 20000 })
            }
            else {
                await waitUntilExist(ctx.page, '#ckmsg 顯示 uploadData', () => /trigger: uploadData/.test(document.querySelector('#ckmsg').textContent), { timeout: 20000 })
            }
            await waitGridIdle(ctx.page, { minCells: 0 })
            let rows = await ctx.page.evaluate(() => document.querySelector('#app').__vue__.$refs.rftable.getNowData())
            assert.deepStrictEqual(rows, exp.rows, '表格數據')
            assert.deepStrictEqual(ctx.external.unmapped, [], '未對照之外部資源')
            assertNoErrors(ctx)
        })
    }

})
