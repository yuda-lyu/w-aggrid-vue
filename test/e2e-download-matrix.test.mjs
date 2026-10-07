//下載 27 格(規則帳本 R02、R12–R15)
//使用者路徑: ①開宿主頁(五張表格) ②點宿主頁之按鈕, 其處理函數以該案例之選項呼叫 downloadData 或 downloadDisplayData ③看到下載檔或拋錯
//④無輸入 ⑤讀回下載檔比對內容, 拋錯者核對訊息且不得產檔 ⑥副作用: 下載檔(存於 test/_tmp 讀回即刪)
import { openPage, pageUrl, runHostCase, assertDownloadCase, useTmpDir } from './tools/e2e-setup.mjs'

let tmp = useTmpDir('e2e-download-matrix')

let H4 = ['id', 'make', 'model', 'price']
let H4c = ['主鍵', '製造商', '型號', '價格']
let H3 = ['make', 'model', 'price']
let H3c = ['製造商', '型號', '價格']
let R4 = [['r1', 'Toyota', 'Celica', '35000'], ['r2', 'Ford', 'Mondeo', '32000']]
let R3 = [['Toyota', 'Celica', '35000'], ['Ford', 'Mondeo', '32000']]

//每格: [代號, 說明(含對應規則), 應然]; file 為下載檔內容, throw 為拋錯訊息
let cases = [
    ['D1', 'disp 以 keys 掛鉤排除可見欄 id:表頭與數據同源而對齊(R14)', { file: [H3, ...R3] }],
    ['D1b', '同 D1 加 useHead:中文表頭對齊(R14)', { file: [H3c, ...R3] }],
    ['D1c', 'raw 排除 id:表頭與數據對齊(R14)', { file: [H3, ...R3] }],
    ['D2', 'raw 之 keys 掛鉤回 []:拋 no downloadable keys 不還原為全部欄位(R15)', { throw: /no downloadable keys/ }],
    ['D2b', 'disp 之 keys 掛鉤回 []:同上(R15)', { throw: /no downloadable keys/ }],
    ['D3', 'disp 於全部欄位隱藏:拋 no downloadable keys(R13、R15)', { throw: /no downloadable keys/ }],
    ['D4', 'ltdt 掛鉤為 async:拋須同步回傳(R15)', { throw: /funGetLtdtHook.*Promise/ }],
    ['D5', 'ltdt 掛鉤無 return:拋須回傳陣列(R15)', { throw: /funGetLtdtHook must return an array/ }],
    ['D6', 'mat 掛鉤無 return:拋錯(R15)', { throw: /funGetMatHook/ }],
    ['D7', 'raw 無數據列加 useHead:只輸出中文表頭 1 列(R15 表頭範本)', { file: [H4c] }],
    ['X1_keysHookNoReturn', 'keys 掛鉤無 return:拋須回傳陣列(R15)', { throw: /funGetKeysHook must return an array/ }],
    ['X2_ltdtHookReturnsArrays', 'ltdt 掛鉤回二維陣列:拋列須為非空物件並指出索引(R15)', { throw: /funGetLtdtHook must return an array of non-empty objects, invalid row\[0\]/ }],
    ['X3_displayAllHiddenWithRaw', 'raw 於全部欄位隱藏:仍輸出 opt.keys 全部欄位(R13)', { file: [H4, ...R4] }],
    ['K_throw', 'keys 掛鉤自身拋錯:原樣拋出(R02)', { throw: /keys hook boom/ }],
    ['K_unknown', 'keys 掛鉤回未知鍵 foo:該欄空白(R14)', { file: [['make', 'foo'], ['Toyota', ''], ['Ford', '']] }],
    ['K_dup', 'keys 掛鉤回重複鍵:兩欄同值(R14)', { file: [['make', 'make'], ['Toyota', 'Toyota'], ['Ford', 'Ford']] }],
    ['K_displayExcludeHidden', 'disp 排除本即隱藏之 id:三欄(R13)', { file: [H3, ...R3] }],
    ['L_emptyIntent', 'ltdt 掛鉤回 []:只輸出表頭(R15)', { file: [H4] }],
    ['L_emptyObj', 'ltdt 掛鉤回空物件列:拋錯並指出索引(R15)', { throw: /funGetLtdtHook must return an array of non-empty objects, invalid row\[0\]/ }],
    ['L_throw', 'ltdt 掛鉤自身拋錯:原樣拋出(R02)', { throw: /ltdt hook boom/ }],
    ['L_noRowsHookPass', '無數據列且 ltdt 掛鉤原樣回 []:不誤拋,只輸出中文表頭(R04、R15)', { file: [H4c] }],
    ['M_empty', 'mat 掛鉤回 []:拋錯(R15)', { throw: /funGetMatHook/ }],
    ['M_throw', 'mat 掛鉤自身拋錯:原樣拋出(R02)', { throw: /mat hook boom/ }],
    ['M_promise', 'mat 掛鉤為 async:拋須同步回傳(R15)', { throw: /funGetMatHook.*Promise/ }],
    ['E_displayNoRows', 'disp 無數據列加 useHead:只輸出中文表頭(R15)', { file: [H4c] }],
    ['F_formatDisplayExclude', 'disp 排除 id 且 price 有格式化:格式化值對齊(R14)', { file: [H3, ['Toyota', 'Celica', '35000.0'], ['Ford', 'Mondeo', '32000.0']] }],
    ['F_formatOff', 'raw 之 useFormat 為 false:輸出原值(R07)', { file: [H4, ...R4] }],
]

describe('e2e-download-matrix:下載 27 格', function() {
    let ctx = null

    before(function() {
        tmp.make()
    })

    after(function() {
        tmp.clean()
    })

    beforeEach(async function() {
        ctx = await openPage(pageUrl('download-matrix.html'), { downloadsPath: tmp.dir })
    })

    afterEach(async function() {
        if (ctx) {
            await ctx.close()
        }
        ctx = null
    })

    for (let [id, title, exp] of cases) {
        it(`${id} ${title}`, async function() {
            let r = await runHostCase(ctx, id, { expectDownloads: exp.throw ? 0 : 1, saveDir: tmp.dir })
            assertDownloadCase(r, exp)
        })
    }

})
