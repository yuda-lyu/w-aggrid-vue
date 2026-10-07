//e2e 共用層: 只放專案組態與專案專屬原語(宿主頁協定、下載與上傳之執行與判定、中介檔目錄、範例頁之外部資源路由)
//共用實作一律經 e2eLib.mjs 引用 w-package-tools-e2e, 本檔與測試檔皆不得自行 chromium.launch
import fs from 'fs'
import path from 'path'
import vm from 'vm'
import assert from 'assert'
import { fileURLToPath, pathToFileURL } from 'url'
import getDataFromExcelFileU8Arr from 'wsemi/src/getDataFromExcelFileU8Arr.mjs'
import getExcelWorkbookFromData from 'wsemi/src/getExcelWorkbookFromData.mjs'
import getExcelU8ArrFromWorkbook from 'wsemi/src/getExcelU8ArrFromWorkbook.mjs'
import { launchBrowser, openCasePage, waitUntilExist, waitGridIdle, pollUntil } from './e2eLib.mjs'


//projRoot, 本模組位於 test/tools/, 上兩層為專案根; 相對路徑一律由此解析
export const projRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..')
export const testDir = path.join(projRoot, 'test')

//VIEWPORT, 各案例之確定性視窗
const VIEWPORT = { width: 1400, height: 900 }


//loadFixtureData, 讀入版控之 w-demores 資料 fixture(瀏覽器腳本 let 名稱 = [...]); 以 JSON 轉回本 realm, 否則 deepStrictEqual 因原型不同而判為不等
export function loadFixtureData(name) {
    let src = fs.readFileSync(path.join(testDir, 'fixtures', 'w-demores', `${name}.js`), 'utf8')
    return JSON.parse(JSON.stringify(vm.runInNewContext(`${src}\n;${name}`, { window: {} })))
}


//pageUrl, 宿主頁(test/pages/)之網址; 宿主頁以相對路徑載入本地 dist 與 node_modules 之 vue
export function pageUrl(name) {
    return pathToFileURL(path.join(testDir, 'pages', name)).href
}


//exampleUrl, 官方範例頁(docs/examples/)之網址
export function exampleUrl(name, query = '') {
    return pathToFileURL(path.join(projRoot, 'docs', 'examples', name)).href + query
}


//useTmpDir, 各測試檔專用之中介檔目錄 test/_tmp/<name>/(已 gitignore), 由該檔 after 刪除; 不得使用 ./tmp(AI 代理暫存區, 隨時會被清除)
export function useTmpDir(name) {
    let root = path.join(testDir, '_tmp')
    let dir = path.join(root, name)
    return {
        dir,
        file: (fn) => path.join(dir, fn),
        make: () => {
            fs.mkdirSync(dir, { recursive: true })
        },
        clean: () => {
            fs.rmSync(dir, { recursive: true, force: true })
            //test/_tmp 已無其他測試檔之目錄時一併移除; 並行之另一檔可能正要建立, 失敗即略過
            try {
                if (fs.readdirSync(root).length === 0) {
                    fs.rmdirSync(root)
                }
            }
            catch (err) {}
        },
    }
}


//EXTERNAL, 官方範例頁自 CDN 載入之資源一律改由本機供應, 測試不依賴網路且測到的是本地 dist
const EXTERNAL = [
    { re: /\/npm\/vue@2[^/]*\/dist\/vue\.min\.js$/, file: 'node_modules/vue/dist/vue.min.js' },
    { re: /\/npm\/w-aggrid-vue@[^/]+\/dist\/w-aggrid-vue\.umd\.js$/, file: 'dist/w-aggrid-vue.umd.js', key: 'w-aggrid-vue' },
    { re: /\/npm\/w-jsonview-tree@[^/]+\/dist\/w-jsonview-tree\.umd\.js$/, file: 'node_modules/w-jsonview-tree/dist/w-jsonview-tree.umd.js' },
    //範例頁之 @babel/polyfill 為 nomodule 腳本(Chrome 不執行), 且非本套件宣告之相依, 以空腳本供應
    { re: /\/npm\/@babel\/polyfill(@[^/]+)?\/dist\/polyfill\.min\.js$/, body: '' },
    { re: /\/npm\/w-demores(@[^/]+)?\/res\/data\/dataEasy\.js$/, file: 'test/fixtures/w-demores/dataEasy.js' },
    { re: /\/npm\/w-demores(@[^/]+)?\/res\/data\/dataLikeNumber\.js$/, file: 'test/fixtures/w-demores/dataLikeNumber.js' },
    //受測範例未使用(106 KB), 以同名之空陣列供應
    { re: /\/npm\/w-demores(@[^/]+)?\/res\/data\/dataEduagency\.js$/, body: 'window.dataEduagency=[]' },
]


//routeExternal, 攔截全部 http(s) 請求: 對照表內者由本機供應, 其餘中止並記錄(測試端斷言未對照者為 0)
async function routeExternal(page, hits) {
    await page.route(/^https?:\/\//, async (route) => {
        let url = route.request().url()
        let m = EXTERNAL.find((v) => v.re.test(url))
        if (!m) {
            hits.unmapped.push(url)
            await route.abort()
            return
        }
        hits.mapped.push(m.key || url)
        let body = m.body !== undefined ? m.body : fs.readFileSync(path.join(projRoot, m.file))
        await route.fulfill({ status: 200, contentType: 'application/javascript', body })
    })
}


//openPage, 每案例一個新瀏覽器與新頁面(launchBrowser 六旗標), 收集 console 與 pageerror, 開頁後等表格靜止
//idle 為 false 時只等首批儲存格出現(頁面自帶計時器而須觀察其中間狀態者, 等靜止會錯過中間狀態)
//downloadsPath 為下載之暫存目錄(該測試檔之 test/_tmp/<名稱>/), 未給時由 Playwright 置於系統暫存區; 暫存之下載檔於瀏覽器關閉時刪除
export async function openPage(url, opt = {}) {
    let { viewport = VIEWPORT, routeExternalResources = false, minCells = 1, idle = true, downloadsPath = null } = opt
    let browser = await launchBrowser(downloadsPath ? { downloadsPath } : {})
    let ctx = {
        browser,
        page: null,
        logs: [],
        pageErrors: [],
        //downloads, 開頁起之全部下載(範例頁可能於掛載時即下載, 故於 goto 前開始收集)
        downloads: [],
        external: { mapped: [], unmapped: [] },
        close: async () => {
            await browser.close()
        },
    }
    try {
        let page = await openCasePage(browser, { contextOptions: { acceptDownloads: true, viewport } })
        ctx.page = page
        page.on('console', (m) => ctx.logs.push({ type: m.type(), text: m.text() }))
        page.on('pageerror', (e) => ctx.pageErrors.push(String(e)))
        page.on('download', (d) => ctx.downloads.push(d))
        if (routeExternalResources) {
            await routeExternal(page, ctx.external)
        }
        await page.goto(url)
        if (idle) {
            await waitGridIdle(page, { minCells, timeout: 30000 })
        }
        else {
            await page.waitForSelector('.ag-cell', { timeout: 30000 })
        }
    }
    catch (err) {
        await browser.close()
        throw err
    }
    return ctx
}


//readDownload, 存下載檔於中介檔目錄並以 wsemi 讀回, 讀完即刪
export async function readDownload(dl, dir, fmt = 'array') {
    let fileName = dl.suggestedFilename()
    let fp = path.join(dir, `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.xlsx`)
    await dl.saveAs(fp)
    let u8a = new Uint8Array(fs.readFileSync(fp))
    fs.unlinkSync(fp)
    let d = await getDataFromExcelFileU8Arr(u8a, { fmt })
    let s = Array.isArray(d) ? d[0] : null
    return { fileName, sheet: s ? s.sheetname : null, data: s ? s.data : d }
}


//writeXlsx, 以 wsemi 產生上傳用之 xlsx(矩陣中之 null 寫成無儲存格)
export async function writeXlsx(fp, mat, sheetName = 'data') {
    let u8a = await getExcelU8ArrFromWorkbook(getExcelWorkbookFromData(mat, sheetName))
    fs.writeFileSync(fp, u8a)
    return fp
}


//runHostCase, 宿主頁協定: 選定案例(setup) → 真點擊宿主頁按鈕(L3, 其處理函數呼叫元件方法, 同官方範例之用法) → 等結果 window.__out → 收下載
//expectDownloads 為預期之下載次數; 0 者以 noDownloadMs 為觀察窗(負向斷言), 讀回者為最後一個下載檔; readFile 為 false 時不讀回(百萬列之檔), file 只含檔名
export async function runHostCase(ctx, name, opt = {}) {
    let { expectDownloads = 0, saveDir = null, downloadTimeout = 20000, noDownloadMs = 1500, outTimeout = 30000, btn = '#btnRun', readFile = true } = opt
    let { page } = ctx
    ctx.logs.length = 0
    ctx.pageErrors.length = 0

    //setup: 選定宿主頁之案例(非 act)
    await page.evaluate((n) => {
        window.__case = n
        window.__out = null
    }, name)

    let downloads = []
    let onDownload = (d) => downloads.push(d)
    page.on('download', onDownload)
    try {
        //act
        await page.click(btn)
        await waitUntilExist(page, `案例 ${name} 之結果`, () => window.__out !== null, { timeout: outTimeout })
        if (expectDownloads > 0) {
            await pollUntil(`案例 ${name} 之下載`, () => downloads.length >= expectDownloads, { timeout: downloadTimeout, interval: 100 }).catch(() => null)
        }
        else {
            await page.waitForTimeout(noDownloadMs)
        }
    }
    finally {
        page.off('download', onDownload)
    }
    let out = await page.evaluate(() => window.__out)
    let file = null
    if (downloads.length > 0) {
        let dl = downloads[downloads.length - 1]
        file = readFile ? await readDownload(dl, saveDir) : { fileName: dl.suggestedFilename() }
    }
    return { out, file, downloadCount: downloads.length, logs: ctx.logs.slice(), pageErrors: ctx.pageErrors.slice() }
}


//normMat, 二維陣列之值一律轉字串(null、undefined 為 '')供比對
export function normMat(mat) {
    if (!Array.isArray(mat)) {
        return mat
    }
    return mat.map((r) => (Array.isArray(r) ? r.map((v) => (v === undefined || v === null ? '' : String(v))) : r))
}


//assertNoErrors, 頁面不得有 pageerror 或 console error
export function assertNoErrors(ctx) {
    let errs = ctx.pageErrors.concat(ctx.logs.filter((m) => m.type === 'error').map((m) => m.text))
    assert.deepStrictEqual(errs, [], 'pageerror 或 console error')
}


//assertLogs, console 提示之有無
export function assertLogs(logs, exp) {
    let texts = logs.map((m) => m.text)
    if (exp.log) {
        assert.ok(texts.some((t) => exp.log.test(t)), `缺少 console 提示 ${exp.log}: ${JSON.stringify(texts)}`)
    }
    if (exp.nolog) {
        assert.ok(!texts.some((t) => exp.nolog.test(t)), `不應有 console 提示 ${exp.nolog}: ${JSON.stringify(texts)}`)
    }
}


//assertDownloadCase, 下載案例之判定: throw 者須同步拋錯、訊息相符且不產檔; noFile 者(寫檔才失敗)須照常回傳二維陣列而不產檔; 其餘須產檔、內容相符且回傳值與檔案相同
export function assertDownloadCase(r, exp) {
    let { out, file } = r
    if (exp.throw) {
        assert.ok(out.threw, `應同步拋錯, 實際回傳 ${out.retType}`)
        assert.match(String(out.err), exp.throw)
        assert.strictEqual(file, null, '不應產生下載檔')
    }
    else if (exp.noFile) {
        assert.ok(!out.threw, `不應拋錯: ${out.err}`)
        assert.strictEqual(out.retType, 'array', '回傳型別')
        assert.strictEqual(file, null, '不應產生下載檔')
    }
    else {
        assert.ok(!out.threw, `不應拋錯: ${out.err}`)
        assert.ok(file, '應產生下載檔')
        assert.strictEqual(r.downloadCount, exp.downloads || 1, '下載次數')
        assert.deepStrictEqual(normMat(file.data), normMat(exp.file), '下載檔內容')
        assert.strictEqual(out.retType, 'array', '回傳型別')
        if (exp.retSame !== false) {
            assert.deepStrictEqual(normMat(out.ret), normMat(file.data), '回傳值須與下載檔相同')
        }
        if (exp.sheet !== undefined) {
            assert.strictEqual(file.sheet, exp.sheet, '分頁名')
        }
        if (exp.fileName !== undefined) {
            assert.strictEqual(file.fileName, exp.fileName, '檔名')
        }
    }
    if (exp.post) {
        assert.match(String(out.post), exp.post, '呼叫後之狀態')
    }
    assertLogs(r.logs, exp)
    if (exp.noUncaught) {
        assert.ok(!r.logs.some((m) => /Uncaught/.test(m.text)), `有未處理之 rejection: ${JSON.stringify(r.logs)}`)
    }
    assert.deepStrictEqual(r.pageErrors, [], 'pageerror')
}


//headerOrder, 畫面欄序: 依表頭格之螢幕 x 座標排序(ag-grid 移動欄位時只改定位不重排 DOM, 不可依 DOM 順序)
export function headerOrder(page, gridSel) {
    return page.evaluate((s) => {
        return Array.from(document.querySelectorAll(`${s} .ag-header-row-column .ag-header-cell`))
            .map((e) => [e.getBoundingClientRect().left, e.getAttribute('col-id')])
            .sort((a, b) => a[0] - b[0])
            .map((x) => x[1])
    }, gridSel)
}


//columnTexts, 某欄各列之顯示文字(依 row-index 排序; 只取中間欄容器)
export function columnTexts(page, gridSel, col) {
    return page.evaluate(({ s, c }) => {
        return Array.from(document.querySelectorAll(`${s} .ag-center-cols-container .ag-row`))
            .sort((a, b) => Number(a.getAttribute('row-index')) - Number(b.getAttribute('row-index')))
            .map((r) => {
                let cell = r.querySelector(`.ag-cell[col-id="${c}"]`)
                return cell ? cell.innerText : null
            })
    }, { s: gridSel, c: col })
}


//waitColumnTexts, 等某欄各列之顯示文字等於預期(偵測等待; 用於排序、過濾等之後), 逾時拋錯並附當下文字
export async function waitColumnTexts(page, gridSel, col, expected, timeout = 10000) {
    try {
        await waitUntilExist(page, `${gridSel} 欄 ${col} 為 ${JSON.stringify(expected)}`, ({ s, c, e }) => {
            let arr = Array.from(document.querySelectorAll(`${s} .ag-center-cols-container .ag-row`))
                .sort((a, b) => Number(a.getAttribute('row-index')) - Number(b.getAttribute('row-index')))
                .map((r) => {
                    let cell = r.querySelector(`.ag-cell[col-id="${c}"]`)
                    return cell ? cell.innerText : null
                })
            return JSON.stringify(arr) === JSON.stringify(e)
        }, { timeout, arg: { s: gridSel, c: col, e: expected } })
    }
    catch (err) {
        let now = await columnTexts(page, gridSel, col)
        throw new Error(`${err.message}; 當下為 ${JSON.stringify(now)}`)
    }
}


//typeIntoFloatingFilter, 於表頭浮動過濾列第 n 欄之輸入框以真鍵盤輸入(L1); 先全選刪除既有內容
export async function typeIntoFloatingFilter(page, gridSel, n, text) {
    let input = page.locator(`${gridSel} .ag-header-row-column-filter .ag-floating-filter`).nth(n).locator('input:not([disabled]):visible').first()
    await input.click()
    await page.keyboard.press('Control+A')
    await page.keyboard.press('Backspace')
    if (text !== '') {
        await page.keyboard.type(text)
    }
}


//getNowRows, 表格目前之數據(元件公開方法 getNowData), 每列以 make|model|price 表示, 缺值記為 __undef__
export function getNowRows(page, gridSel = '#g1') {
    return page.evaluate((s) => {
        return document.querySelector(s).__vue__.getNowData()
            .map((r) => [r.make, r.model, r.price].map((v) => (v === undefined ? '__undef__' : v)).join('|'))
    }, gridSel)
}


//runUploadCase, 上傳宿主頁協定: 選定案例並重設表格(setup) → 真點擊上傳鈕(L3) → 餵檔或取消 → 等 Promise 結束
//取消: Playwright 無法操作作業系統選檔視窗之取消鈕, 改對 input 派發瀏覽器於取消時所派發之 cancel 事件(L5, 規則帳本 e2e 映射登錄之偏離)
export async function runUploadCase(ctx, name, fileOrCancel, opt = {}) {
    let { kpConvert = null, outTimeout = 30000, gridSel = '#g1' } = opt
    let { page } = ctx

    //setup: 選定案例並重設表格數據與鍵轉換
    await page.evaluate(({ n, kp }) => {
        window.__vm.reset(kp)
        window.__case = n
    }, { n: name, kp: kpConvert })
    await waitGridIdle(page, { minCells: 1 })
    let rowsBefore = await getNowRows(page, gridSel)
    ctx.logs.length = 0
    ctx.pageErrors.length = 0

    //act: 真點擊(瀏覽器須使用者啟動才開選檔視窗)
    let chooserP = page.waitForEvent('filechooser', { timeout: 10000 }).catch(() => null)
    await page.click('#btnUpload')
    let chooser = await chooserP
    if (chooser) {
        if (fileOrCancel === 'cancel') {
            let el = await chooser.element()
            await el.evaluate((e) => e.dispatchEvent(new Event('cancel', { bubbles: true })))
        }
        else {
            await chooser.setFiles(fileOrCancel)
        }
    }
    await waitUntilExist(page, `上傳案例 ${name} 之結果`, () => window.__log && window.__log.result !== 'pending', { timeout: outTimeout })
    await waitGridIdle(page, { minCells: 0 })
    let log = await page.evaluate(() => window.__log)
    let rowsAfter = await getNowRows(page, gridSel)
    //inputLeft, wsemi 開窗所用之隱藏 input 殘留數(取消後應已移除)
    let inputLeft = await page.evaluate(() => document.querySelectorAll('[name=GrpDomReadFile]').length)
    return { chooser: !!chooser, log, rowsBefore, rowsAfter, inputLeft, logs: ctx.logs.slice(), pageErrors: ctx.pageErrors.slice() }
}


//assertUploadCase, 上傳案例之判定: ok 者須 resolve 且表格為指定列; rej 者須 reject、代碼或原錯誤相符且表格不變
export function assertUploadCase(r, exp, initRows) {
    let rs = r.log && r.log.result
    assert.ok(rs && rs !== 'pending', '上傳之 Promise 未結束')
    if (exp.ok) {
        assert.strictEqual(rs.settled, 'resolve', `應 resolve: ${rs.raw || rs.message}`)
        assert.deepStrictEqual(r.rowsAfter, exp.ok, '表格數據')
    }
    else {
        assert.strictEqual(rs.settled, 'reject', `應 reject, 實際 ${rs.settled}`)
        let raw = rs.raw ? JSON.parse(rs.raw) : null
        if (exp.rej.sentinel) {
            assert.ok(rs.isSentinel, `應為哨兵參照: ${rs.raw}`)
        }
        if (exp.rej.error) {
            assert.strictEqual(rs.message, exp.rej.error, '應原樣傳出呼叫端之錯誤')
        }
        if (exp.rej.msg) {
            assert.strictEqual(raw && raw.msg, exp.rej.msg, `msg: ${rs.raw || rs.message}`)
        }
        if (exp.rej.err) {
            assert.match(String(raw && raw.err), exp.rej.err, 'err')
        }
        assert.deepStrictEqual(r.rowsAfter, initRows, '表格不得被改動')
    }
    assert.ok(r.chooser, '應開啟選檔視窗')
    if (exp.calls !== undefined) {
        assert.strictEqual(r.log.calls, exp.calls, 'beforeUpload 呼叫次數')
    }
    if (exp.inputLeft !== undefined) {
        assert.strictEqual(r.inputLeft, exp.inputLeft, '隱藏之選檔 input 殘留數')
    }
    assertLogs(r.logs, exp)
    assert.deepStrictEqual(r.pageErrors, [], 'pageerror')
}
