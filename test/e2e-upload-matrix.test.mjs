//上傳 62 格(規則帳本 R01、R02、R04、R17), 含取消選檔
//使用者路徑: ①開宿主頁(表格初始為 Toyota、Ford 兩列) ②點宿主頁之上傳鈕(真點擊, 瀏覽器須使用者啟動才開選檔視窗), 其處理函數以該案例之選項呼叫 uploadData
//③選檔視窗開啟 ④選入該案例之 xlsx(或取消) ⑤看到表格被取代、附加或維持原樣, Promise 之結果與 console 提示 ⑥副作用: 表格數據(每案例新頁面, 無殘留)
import { openPage, pageUrl, runUploadCase, assertUploadCase, writeXlsx, useTmpDir } from './tools/e2e-setup.mjs'
import fs from 'fs'

let tmp = useTmpDir('e2e-upload-matrix')

//上傳用之 xlsx(測試時以 wsemi 產生於 test/_tmp, after 刪除); null 寫成無儲存格
let mats = {
    ok: [['make', 'model', 'price'], ['BMW', 'Sedan', 66000]],
    ok2: [['make', 'model', 'price'], ['BMW', 'Sedan', 66000], ['Audi', 'A4', 40000]],
    headOnly: [['make', 'model', 'price']],
    cnHead: [['製造商', '型號', '價格'], ['BMW', 'Sedan', 66000]],
    partial: [['make', 'extra'], ['BMW', 'x']],
    blankRow: [['make', 'model', 'price'], ['BMW', 'Sedan', 66000], ['', '', ''], ['Audi', 'A4', 40000]],
    //表格旁之備註欄(無表頭): 只有備註之列讀為 {}
    noteMixed: [['make', 'model', 'price', null], ['BMW', 'Sedan', 66000, null], [null, null, null, 'note']],
    noteOnly: [['make', 'model', 'price', null], [null, null, null, 'note']],
    allBlank: [['make', 'model', 'price'], ['', '', ''], ['', '', '']],
    dateCell: [['make', 'model', 'price'], ['BMW', new Date(Date.UTC(2024, 0, 2)), 66000]],
}
let files = {}

let INIT = ['Toyota|Celica|35000', 'Ford|Mondeo|32000']
let BMW = ['BMW|Sedan|66000']
let ok = (rows, o = {}) => ({ ok: rows, ...o })
let rej = (m, o = {}) => ({ rej: m, ...o })
let CN = { 製造商: 'make', 型號: 'model', 價格: 'price' }

//每格: [代號, 檔案(或 cancel), 說明(含對應規則), 應然, 鍵轉換]
let cases = [
    ['C_replace_ok', 'ok', '取代模式正常上傳(R17)', ok(BMW, { calls: 1 })],
    ['C_append_ok', 'ok', '附加模式正常上傳(R17)', ok([...INIT, ...BMW], { calls: 1 })],
    ['C_cancel', 'cancel', '取消選檔:reject no file、未呼叫 beforeUpload、表格不變、隱藏 input 已移除(R17)', rej({ msg: 'no file', err: /file selection was canceled/ }, { calls: 0, inputLeft: 0 })],
    ['U1_noReturn_replace', 'ok', 'beforeUpload 無 return:reject 並提示 missing return(R17)', rej({ msg: 'invalid beforeUpload return', err: /missing return/ }, { calls: 1 })],
    ['U1a_noReturn_append', 'ok', '同上於附加模式(R17)', rej({ msg: 'invalid beforeUpload return', err: /missing return/ }, { calls: 1 })],
    ['U2_returnObj', 'ok', 'beforeUpload 回物件:reject 須回陣列(R17)', rej({ msg: 'invalid beforeUpload return', err: /must return an array/ }, { calls: 1 })],
    ['U3_asyncUndefined', 'ok', 'async beforeUpload 無 return:reject(R17)', rej({ msg: 'invalid beforeUpload return', err: /missing return/ }, { calls: 1 })],
    ['U3b_asyncObj', 'ok', 'async beforeUpload 回物件:reject(R17)', rej({ msg: 'invalid beforeUpload return', err: /must return an array/ }, { calls: 1 })],
    ['U7_returnArrays', 'ok2', 'beforeUpload 回二維陣列:reject 並指出列索引(R17)', rej({ msg: 'invalid beforeUpload return', err: /invalid row\[0\]/ }, { calls: 1 })],
    ['U7a_returnNulls', 'ok', 'beforeUpload 回 [null, null]:reject(R17)', rej({ msg: 'invalid beforeUpload return', err: /invalid row\[0\]/ }, { calls: 1 })],
    ['U7b_returnEmptyObj', 'ok', 'beforeUpload 回 [{}]:允許 {} 而由 no matching keys 攔下(R04、R17)', rej({ msg: 'no matching keys' }, { calls: 1 })],
    ['U7c_returnMixed', 'ok', 'beforeUpload 回 [首列, null]:reject 並指出 row[1](R17)', rej({ msg: 'invalid beforeUpload return', err: /invalid row\[1\]/ }, { calls: 1 })],
    ['U4_throw', 'ok', 'beforeUpload 自身拋錯:原樣 reject(R02)', rej({ error: 'hook boom' }, { calls: 1 })],
    ['U5_rejectSentinel', 'ok', 'beforeUpload reject 哨兵:保持同一參照(R02)', rej({ sentinel: true }, { calls: 1 })],
    ['U6_returnEmpty_replace', 'ok', 'beforeUpload 回 []:reject no data(R17)', rej({ msg: 'no data' }, { calls: 1 })],
    ['U6a_headOnly_noHook', 'headOnly', '只有表頭之檔:reject no data,表格不被清空(R17)', rej({ msg: 'no data' }, { calls: 0 })],
    ['U6b_headOnly_append', 'headOnly', '同上於附加模式(R17)', rej({ msg: 'no data' }, { calls: 0 })],
    ['U8_cnHead_noMap', 'cnHead', '中文表頭而未設鍵轉換:reject no matching keys(R17)', rej({ msg: 'no matching keys' }, { calls: 0 })],
    ['U8a_cnHead_map', 'cnHead', '中文表頭且設鍵轉換:正常取代(R17)', ok(BMW, { calls: 0 }), CN],
    ['U8b_partial', 'partial', '部分欄名吻合:照常寫入,缺欄為空字串(R17)', ok(['BMW||'], { calls: 0 })],
    ['U16_blankRow', 'blankRow', '檔內夾空字串列:個別空白列照常寫入(R17)', ok(['BMW|Sedan|66000', '||', 'Audi|A4|40000'], { calls: 0 })],
    ['U15_notXlsx', 'notXlsx', '非 xlsx 檔:reject can not read excel(R17)', rej({ msg: 'can not read excel' }, { calls: 0 })],
    ['U9_sheetIndOut', 'ok', 'parseSheetInd 超出分頁數:reject 並說明分頁數(R17)', rej({ msg: 'can not get data from sheet', err: /sheet\[5\] does not exist, the workbook has 1 sheet/ }, { calls: 0 })],
    ['U9a_sheetIndNeg', 'ok', 'parseSheetInd 為 -1:用 0 並提示(R01)', ok(BMW, { calls: 0, log: /invalid parseSheetInd\[-1\], use default parseSheetInd 0/ })],
    ['U9b_sheetIndFloat', 'ok', 'parseSheetInd 為 1.5:用 0 並提示(R01)', ok(BMW, { calls: 0, log: /invalid parseSheetInd\[1\.5\], use default parseSheetInd 0/ })],
    ['U9c_sheetIndNull', 'ok', 'parseSheetInd 為 null:用 0 且不提示(R01)', ok(BMW, { calls: 0, nolog: /invalid parseSheetInd/ })],
    ['U9d_sheetIndStr1', 'ok', 'parseSheetInd 為整數字串 1:有效而讀第 2 分頁,檔案只有 1 分頁(R01、R17)', rej({ msg: 'can not get data from sheet' }, { calls: 0 })],
    ['U10_modeTypo', 'ok', 'uploadMode 誤植 apend:以取代執行並提示(R01)', ok(BMW, { calls: 0, log: /invalid uploadMode\[apend\], use default uploadMode 'replace'/ })],
    ['U10a_modeNull', 'ok', 'uploadMode 為 null:取代且不提示(R01)', ok(BMW, { calls: 0, nolog: /invalid uploadMode/ })],
    ['U11_optNull', 'ok', 'opt 為 null:視為 {} 且不提示(R01)', ok(BMW, { calls: 0, nolog: /invalid opt/ })],
    ['U12_hookNotFun', 'ok', 'beforeUpload 給字串:視為未給予並提示(R01)', ok(BMW, { calls: 0, log: /invalid beforeUpload\[x\], use default beforeUpload null/ })],
    ['W_wtable_hook_headOnly', 'headOnly', '仿 w-table-vue 包裝(呼叫端 hook 原樣回傳)上傳只有表頭之檔:reject 哨兵(R02、R17)', rej({ sentinel: true }, { calls: 1 })],
    ['W_wtable_default_cnHead', 'cnHead', '仿 w-table-vue 預設包裝上傳中文表頭:reject 哨兵(R17)', rej({ sentinel: true }, { calls: 1 })],
    ['W_wtable_default_ok', 'ok', '仿 w-table-vue 預設包裝正常上傳(R17)', ok(BMW, { calls: 1 })],
    ['R_optString', 'ok', 'opt 為字串 append:視為 {} 以取代執行並提示(R01)', ok(BMW, { calls: 0, log: /invalid opt\[append\], use default opt \{\}/ })],
    ['R_optArray', 'ok', 'opt 為陣列:視為 {} 並提示(R01)', ok(BMW, { calls: 0, log: /invalid opt\[\[object Array\]\], use default opt \{\}/ })],
    ['R_modeEmpty', 'ok', 'uploadMode 為空字串:取代並提示(R01)', ok(BMW, { calls: 0, log: /invalid uploadMode\[\], use default uploadMode 'replace'/ })],
    ['R_modeUpper', 'ok', 'uploadMode 為 Append(大小寫敏感):取代並提示(R01)', ok(BMW, { calls: 0, log: /invalid uploadMode\[Append\], use default uploadMode 'replace'/ })],
    ['R_sheetIndTrue', 'ok', 'parseSheetInd 為 true:用 0 並提示(R01)', ok(BMW, { calls: 0, log: /invalid parseSheetInd\[\[object Boolean\]\], use default parseSheetInd 0/ })],
    ['R_sheetIndEmptyStr', 'ok', 'parseSheetInd 為空字串:用 0 並提示(R01)', ok(BMW, { calls: 0, log: /invalid parseSheetInd\[\], use default parseSheetInd 0/ })],
    ['R_sheetIndInfinity', 'ok', 'parseSheetInd 為 Infinity:用 0 並提示(R01)', ok(BMW, { calls: 0, log: /invalid parseSheetInd\[Infinity\], use default parseSheetInd 0/ })],
    ['R_thenable', 'ok', 'beforeUpload 回 thenable:以 await 取值(R17)', ok(BMW, { calls: 1 })],
    ['R_thenableReject', 'ok', 'beforeUpload 回 reject 哨兵之 thenable:保持參照(R02)', rej({ sentinel: true }, { calls: 1 })],
    ['R_noteMixed_noHook', 'noteMixed', '表格旁有備註欄:{} 列照寫為空白列(R17)', ok(['BMW|Sedan|66000', '||'], { calls: 0 })],
    ['R_noteMixed_identity', 'noteMixed', '同上而 hook 原樣回傳:允許 {}(R17)', ok(['BMW|Sedan|66000', '||'], { calls: 1 })],
    ['R_noteOnly_noHook', 'noteOnly', '只有備註列:reject no matching keys(R17)', rej({ msg: 'no matching keys' }, { calls: 0 })],
    ['R_noteOnly_identity', 'noteOnly', '同上而 hook 原樣回傳(R17)', rej({ msg: 'no matching keys' }, { calls: 1 })],
    ['R_hookTwoEmptyObj', 'ok', 'beforeUpload 回 [{}, {}]:reject no matching keys(R04、R17)', rej({ msg: 'no matching keys' }, { calls: 1 })],
    ['R_hookUndefinedVals', 'ok', 'beforeUpload 回之列於 keys 皆 undefined:reject no matching keys(R17)', rej({ msg: 'no matching keys' }, { calls: 1 })],
    ['R_allBlank_replace', 'allBlank', '全部列皆空字串:reject no data(R17)', rej({ msg: 'no data', err: /all rows are empty/ }, { calls: 0 })],
    ['R_allBlank_append', 'allBlank', '同上於附加模式(R17)', rej({ msg: 'no data', err: /all rows are empty/ }, { calls: 0 })],
    ['R_dateCell', 'dateCell', '日期儲存格:讀為 YYYY-MM-DDTHH:mm:ss.SSS(第 6 節已知限制 3)', ok(['BMW|2024-01-02T00:00:00.000|66000'], { calls: 0 })],
    ['R_zeroFalse', 'ok', 'beforeUpload 回 0 與 false:視為有值而寫入(R17)', ok(['0|false|'], { calls: 1 })],
    ['R_inplaceNoReturn', 'ok', 'beforeUpload 就地改值但無 return:reject(R17)', rej({ msg: 'invalid beforeUpload return', err: /missing return/ }, { calls: 1 })],
    ['R_inplaceReturn', 'ok', 'beforeUpload 就地改值並回傳:寫入改後值(R17)', ok(['BMW!|Sedan|66000'], { calls: 1 })],
    ['W_wtable_identity_noteMixed', 'noteMixed', '仿 w-table-vue 包裝(呼叫端 hook 原樣回傳)上傳含備註欄之檔(R17)', ok(['BMW|Sedan|66000', '||'], { calls: 1 })],
    ['W_wtable_default_noteMixed', 'noteMixed', '仿 w-table-vue 預設包裝:空白列被包裝濾掉(R17)', ok(BMW, { calls: 1 })],
    ['W_wtable_default_allBlank', 'allBlank', '仿 w-table-vue 預設包裝上傳全空白檔:reject 哨兵(R17)', rej({ sentinel: true }, { calls: 1 })],
    ['W_wtable_default_headOnly', 'headOnly', '仿 w-table-vue 預設包裝上傳只有表頭之檔:reject 哨兵(R17)', rej({ sentinel: true }, { calls: 1 })],
    ['W_wtable_identity_allBlank', 'allBlank', '仿 w-table-vue 包裝(呼叫端 hook 原樣回傳)上傳全空白檔:reject no data(R17)', rej({ msg: 'no data' }, { calls: 1 })],
    ['W_wtable_identity_noteOnly', 'noteOnly', '仿 w-table-vue 包裝(呼叫端 hook 原樣回傳)上傳只有備註列:reject no matching keys(R17)', rej({ msg: 'no matching keys' }, { calls: 1 })],
    ['W_wtable_hook_arrays', 'ok', '仿 w-table-vue 包裝而呼叫端 hook 回二維陣列:reject invalid beforeUpload return(R17)', rej({ msg: 'invalid beforeUpload return' }, { calls: 1 })],
]

describe('e2e-upload-matrix:上傳 62 格', function() {
    let ctx = null

    before(async function() {
        tmp.make()
        for (let k of Object.keys(mats)) {
            files[k] = await writeXlsx(tmp.file(`${k}.xlsx`), mats[k])
        }
        files.notXlsx = tmp.file('notXlsx.xlsx')
        fs.writeFileSync(files.notXlsx, 'hello, this is not an xlsx file')
    })

    after(function() {
        tmp.clean()
    })

    beforeEach(async function() {
        ctx = await openPage(pageUrl('upload-matrix.html'))
    })

    afterEach(async function() {
        if (ctx) {
            await ctx.close()
        }
        ctx = null
    })

    for (let [id, fileKey, title, exp, kpConvert] of cases) {
        it(`${id} ${title}`, async function() {
            let r = await runUploadCase(ctx, id, fileKey === 'cancel' ? 'cancel' : files[fileKey], { kpConvert: kpConvert || null })
            assertUploadCase(r, exp, INIT)
        })
    }

})
