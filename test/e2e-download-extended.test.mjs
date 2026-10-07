//下載補測 91 格(規則帳本 R01、R02、R04、R12–R16)
//使用者路徑: ①開宿主頁(十七張表格) ②部分案例先以 grid API 建立前置狀態(移欄、排序、表頭過濾; setup 例外, 模擬使用者先前之操作)
//③點宿主頁之按鈕, 其處理函數以該案例之選項呼叫元件方法 ④無輸入 ⑤讀回下載檔比對內容、核對拋錯訊息、console 提示與呼叫後狀態 ⑥副作用: 下載檔(存於 test/_tmp 讀回即刪)
import assert from 'assert'
import { openPage, pageUrl, runHostCase, assertDownloadCase, headerOrder, columnTexts, useTmpDir } from './tools/e2e-setup.mjs'
import { waitGridIdle } from './tools/e2eLib.mjs'

let tmp = useTmpDir('e2e-download-extended')

let H4 = ['id', 'make', 'model', 'price']
let H4c = ['主鍵', '製造商', '型號', '價格']
let R4 = [['r1', 'Toyota', 'Celica', '35000'], ['r2', 'Ford', 'Mondeo', '32000']]
let F4 = [H4, ...R4]
//WIDE: 原 4 欄後接 c4 起之欄位至共 n 欄, 數據列之補欄值為 v<欄索引>(同宿主頁 manyKeys 加 fillMat、widenMat)
let WIDE = (n) => {
    let ext = (pre) => Array.from({ length: n - 4 }, (v, i) => `${pre}${i + 4}`)
    return [H4.concat(ext('c')), ...R4.map((r) => r.concat(ext('v')))]
}
//colsAt: Excel 一個分頁至多 16384 欄, 以最終二維陣列之各列判定(寫檔器 hucre 於寫檔時才拒絕且無法回報, 故同步拋錯並指出列索引)
let colsAt = (name, i) => new RegExp(`^\\[w-aggrid-vue\\] ${name}: too many columns, Excel allows at most 16384 columns, invalid row\\[${i}\\]$`)
//rowsOver: Excel 一個分頁至多 1048576 列(含表頭列); hucre 寫檔不拒絕但產出之檔讀不回, 故同步拋錯
let rowsOver = (name) => new RegExp(`^\\[w-aggrid-vue\\] ${name}: too many rows, Excel allows at most 1048576 rows including the header row$`)
//writeFail: 寫檔才失敗(mat 掛鉤之儲存格物件由寫檔器解讀而失敗)時, 以方法前綴記錄於 console
let writeFail = (name) => new RegExp(`^\\[w-aggrid-vue\\] ${name}: can not write excel file`)
//分頁名稱長度依 UTF-16 單位計(同 Excel 與 hucre 之 name.length), 表情符號與擴充 B 區漢字各佔 2 單位
let logSheet = (re) => new RegExp(`invalid sheetName\\[${re}\\], use default sheetName 'data'`)
let VT = [['id', 'v'], ['null', ''], ['undef', ''], ['nan', 'null'], ['inf', ''], ['bool', 'true'], ['obj', '{"a":1}'], ['arr', '[1,2]'], ['date', '"2026-01-02T00:00:00.000Z"'], ['empty', ''], ['zero', '0']]
let CK = [['MAKE(改)', 'model'], ['Toyota', 'Celica'], ['Ford', 'Mondeo']]

//前置狀態(setup 例外: 以 grid API 建立使用者先前操作之結果), 於點擊前執行
let pre = {
    P_moved_disp: (page) => page.evaluate(() => window.__vm.$refs.t8.getApi().moveColumns(['price'], 0)),
    Q_sort_disp: (page) => page.evaluate(() => {
        let api = window.__vm.$refs.t8.getApi()
        api.moveColumns(['price'], 3)
        api.applyColumnState({ state: [{ colId: 'price', sort: 'asc' }] })
    }),
    Q_sort_raw: (page) => page.evaluate(() => window.__vm.$refs.t8.getApi().applyColumnState({ state: [{ colId: 'price', sort: 'asc' }] })),
    Q_filteredToZero_disp: (page) => page.evaluate(() => window.__vm.$refs.t8.setHeadFilter('price', 1, 'lessThan')),
}

//點擊前之畫面觀察(下載須與畫面一致者)
let peek = {
    P_pinnedLeft_disp: async (page) => (await headerOrder(page, '#t7')).join(','),
    P_moved_disp: async (page) => (await headerOrder(page, '#t8')).join(','),
    F_rowDep_raw: async (page) => (await columnTexts(page, '#t13', 'price')).join(','),
    F_order_raw: async (page) => {
        let m = await columnTexts(page, '#t14', 'model')
        let p = await columnTexts(page, '#t14', 'price')
        return m.map((v, i) => `${v}/${p[i]}`).join(',')
    },
}

//回傳值為非二維陣列之方法(getDisplayData、getDisplayDataKeys)之判定
let custom = {
    G_getDisplayData_pinned: (r) => {
        assert.ok(!r.out.threw, r.out.err)
        assert.deepStrictEqual(Object.keys(r.out.ret[0]), ['price', 'id', 'make', 'model'], '鍵序依畫面欄序(R13)')
        assert.strictEqual(r.out.ret[0].id, 'r1')
        assert.strictEqual(r.out.ret.length, 2)
    },
    G_getDisplayData_plain: (r) => {
        assert.ok(!r.out.threw, r.out.err)
        assert.deepStrictEqual(Object.keys(r.out.ret[0]), H4)
        assert.strictEqual(r.out.ret[1].make, 'Ford')
        assert.strictEqual(r.out.ret.length, 2)
    },
    G_keys_pinned: (r) => {
        assert.ok(!r.out.threw, r.out.err)
        assert.deepStrictEqual(r.out.ret, ['price', 'id', 'make', 'model'], '畫面欄序含固定欄位置(R13)')
    },
}

//每格: [代號, 說明(含對應規則), 應然]
let cases = [
    ['V_types_raw', 'raw 各型別之值:null 與 undefined 為空白,其餘依 wsemi 轉換(R14)', { file: VT, retSame: false }],
    ['V_types_disp', 'disp 各型別之值:同上(R14)', { file: VT, retSame: false }],
    ['S_sheetSlash', 'sheetName 含 /:改用 data 並提示(R01、R16)', { file: F4, sheet: 'data', log: /invalid sheetName\[2026\/10\], use default sheetName 'data'/ }],
    ['S_sheet32', 'sheetName 32 字:改用 data 並提示(R16)', { file: F4, sheet: 'data', log: /invalid sheetName\[x{32}\], use default sheetName 'data'/ }],
    ['S_sheetApos', 'sheetName 首字為單引號:改用 data 並提示(R16)', { file: F4, sheet: 'data', log: /invalid sheetName\['q3\], use default sheetName 'data'/ }],
    ['S_sheetHistory', 'sheetName 為保留名 History:改用 data 並提示(R16)', { file: F4, sheet: 'data', log: /invalid sheetName\[History\], use default sheetName 'data'/ }],
    ['S_sheetValid', 'sheetName 中文與數字:照用且無提示(R16)', { file: F4, sheet: '報表2026-10', nolog: /invalid sheetName/ }],
    ['S_sheetEmpty', 'sheetName 空字串:改用 data 並提示(R01)', { file: F4, sheet: 'data', log: /invalid sheetName\[\], use default sheetName 'data'/ }],
    ['S_sheetEmoji16', 'sheetName 為 16 個表情符號(32 單位):改用 data 並提示(R16)', { file: F4, sheet: 'data', log: logSheet('(😀){16}') }],
    ['S_sheetEmoji16_disp', 'disp 同上(R16)', { file: F4, sheet: 'data', log: logSheet('(😀){16}') }],
    ['S_sheetEmoji15', 'sheetName 為 15 個表情符號(30 單位):照用且無提示(R16)', { file: F4, sheet: '😀'.repeat(15), nolog: /invalid sheetName/ }],
    ['S_sheetExtB16', 'sheetName 為 16 個擴充 B 區漢字(32 單位):改用 data 並提示(R16)', { file: F4, sheet: 'data', log: logSheet('(𠀀){16}') }],
    ['S_sheetUnits31', 'sheetName 29 字加 1 表情符號(31 單位,上限):照用且無提示(R16)', { file: F4, sheet: 'x'.repeat(29) + '😀', nolog: /invalid sheetName/ }],
    ['S_sheetUnits32', 'sheetName 30 字加 1 表情符號(32 單位):改用 data 並提示(R16)', { file: F4, sheet: 'data', log: logSheet('x{30}😀') }],
    ['S_sheetBoxed', 'sheetName 為 new String 包裝之字串:改用 data 並提示(R16,hucre 要求字串原始值)', { file: F4, sheet: 'data', log: logSheet('boxed') }],
    ['C_keys16384', 'keys 掛鉤回 16384 欄(Excel 上限):照常產檔(R15)', { file: WIDE(16384) }],
    ['C_keys16385', 'keys 掛鉤回 16385 欄:同步拋錯且不產檔(R15)', { throw: colsAt('downloadData', 0) }],
    ['C_keys16385_disp', 'disp 同上(R15)', { throw: colsAt('downloadDisplayData', 0) }],
    ['C_mat16384', 'mat 掛鉤補欄至 16384 欄:照常產檔(R15)', { file: WIDE(16384) }],
    ['C_mat16385', 'mat 掛鉤補欄至 16385 欄:同步拋錯且不產檔(R15)', { throw: colsAt('downloadData', 0) }],
    ['C_matRow1Wide', 'mat 掛鉤只把第 1 列補至 16385 欄:同步拋錯並指出 row[1](R15)', { throw: colsAt('downloadData', 1) }],
    ['C_keysWideMatTrim', 'keys 掛鉤回 16385 欄而 mat 掛鉤裁為 3 欄:照常產檔,不得誤擋(R15)', { file: [['id', 'make', 'model'], ['r1', 'Toyota', 'Celica'], ['r2', 'Ford', 'Mondeo']] }],
    ['C_rows1048576', 'mat 掛鉤補至 1048576 列(含表頭,Excel 上限):照常產檔(R15)', { big: 1048576 }],
    ['C_rows1048577', 'mat 掛鉤補至 1048577 列:同步拋錯且不產檔(R15)', { throw: rowsOver('downloadData') }],
    ['C_rows1048577_disp', 'disp 同上(R15)', { throw: rowsOver('downloadDisplayData') }],
    ['M_cellStyleBad', 'mat 掛鉤之儲存格為寫檔器無法寫出之物件:照常回傳、不產檔,console 以方法前綴記錄(R02 已知限制、R03)', { noFile: true, log: writeFail('downloadData') }],
    ['M_cellObject', 'mat 掛鉤之儲存格為一般物件:原樣交寫檔器,該格為空白(R15 呼叫端責任)', { file: [H4, ['r1', '', 'Celica', '35000'], R4[1]], retSame: false }],
    ['H_addHidden', 'disp 之 keys 掛鉤加回隱藏欄 id:該欄有值(R14)', { file: F4 }],
    ['H_hiddenOnly', 'disp 之 keys 掛鉤只回隱藏欄 id:一欄有值(R14)', { file: [['id'], ['r1'], ['r2']] }],
    ['H_allHiddenAdd', 'disp 全部欄位隱藏而掛鉤回 make:該欄有值(R14)', { file: [['make'], ['Toyota'], ['Ford']] }],
    ['P_pinnedLeft_disp', 'disp 於 price 固定在左:欄序與畫面相同(R13)', { file: [['price', 'id', 'make', 'model'], ['35000', 'r1', 'Toyota', 'Celica'], ['32000', 'r2', 'Ford', 'Mondeo']], screen: 'price,id,make,model' }],
    ['P_pinnedLeft_raw', 'raw 於 price 固定在左:依 opt.keys 順序(R13)', { file: F4 }],
    ['P_moved_disp', 'disp 於使用者移欄後:欄序與畫面相同(R13)', { file: [['price', 'id', 'make', 'model'], ['35000', 'r1', 'Toyota', 'Celica'], ['32000', 'r2', 'Ford', 'Mondeo']], screen: 'price,id,make,model' }],
    ['Q_sort_disp', 'disp 於 price 升冪排序後:列依排序(R13)', { file: [H4, R4[1], R4[0]] }],
    ['Q_sort_raw', 'raw 於排序後:列不受排序影響(R13)', { file: F4 }],
    ['Q_filterall_disp', 'disp 於 filterall 為 Ford:只有 r2(R13)', { file: [H4, R4[1]] }],
    ['Q_filterall_raw', 'raw 於 filterall:全部列(R13)', { file: F4 }],
    ['Q_pinnedRows_disp', 'disp 於有置底合計列:不含置底列(R13)', { file: F4 }],
    ['Q_pinnedRows_raw', 'raw 於有置底合計列:不含置底列(R13)', { file: F4 }],
    ['Q_filteredToZero_disp', 'disp 於表頭過濾至零列加 useHead:只輸出中文表頭(R13、R15)', { file: [H4c] }],
    ['R_retMutate', '呼叫後改寫回傳值:已觸發之下載檔不受影響(R12)', { file: F4 }],
    ['R_nestedRaw', 'raw 之 ltdt 掛鉤改巢狀值:檔案為改後值,表格數據不變(R14)', { file: [['id', 'meta'], ['r1', '{"n":999}'], ['r2', '{"n":999}']], post: /vo\.rows\[0\]\.meta\.n=1$/ }],
    ['R_nestedDisp', 'disp 之 ltdt 掛鉤改巢狀值:同上(R14)', { file: [['id', 'meta'], ['r1', '{"n":999}'], ['r2', '{"n":999}']], post: /vo\.rows\[0\]\.meta\.n=1$/ }],
    ['R_constKeys1', 'keys 掛鉤回呼叫端常數陣列且 mat 掛鉤改表頭:常數陣列不變(R14)', { file: CK, post: /EXPORT_KEYS=\["make","model"\]/ }],
    ['R_constKeys2', '同上連續呼叫 2 次:第 2 次結果相同且常數陣列不變(R14)', { file: CK, downloads: 2, post: /EXPORT_KEYS=\["make","model"\]/ }],
    ['R_constKeysDisp1', 'disp 同 R_constKeys1(R14)', { file: CK, post: /EXPORT_KEYS=\["make","model"\]/ }],
    ['R_constKeysDisp2', 'disp 同 R_constKeys2(R14)', { file: CK, downloads: 2, post: /EXPORT_KEYS=\["make","model"\]/ }],
    ['L_keysAlias', 'keys 掛鉤回之陣列於 ltdt 掛鉤中被清空:仍依快照輸出(R15)', { file: [['make', 'model'], ['Toyota', 'Celica'], ['Ford', 'Mondeo']] }],
    ['D_hideViaHook', 'disp 之 keys 掛鉤內隱藏全部欄位:欄位與列於掛鉤前取定(R12)', { file: F4 }],
    ['F_rowDep_raw_exclMake', 'raw 排除 make 而 price 格式化讀同列 make:讀完整來源列(R07、R14)', { file: [['id', 'model', 'price'], ['r1', 'Celica', 'Toyota:35000'], ['r2', 'Mondeo', 'Ford:32000']] }],
    ['F_rowDep_disp_exclMake', 'disp 同上(R07、R14)', { file: [['id', 'model', 'price'], ['r1', 'Celica', 'Toyota:35000'], ['r2', 'Mondeo', 'Ford:32000']] }],
    ['F_rowDep_raw', 'raw 之格式化讀同列他欄:與畫面相同(R07)', { file: [H4, ['r1', 'Toyota', 'Celica', 'Toyota:35000'], ['r2', 'Ford', 'Mondeo', 'Ford:32000']], screen: 'Toyota:35000,Ford:32000' }],
    ['F_order_raw', 'model 格式化讀 price 原值:不受 price 格式化之影響,與畫面相同(R07)', { file: [H4, ['r1', 'Toyota', 'Celica@35000', '35000.0'], ['r2', 'Ford', 'Mondeo@32000', '32000.0']], screen: 'Celica@35000/35000.0,Mondeo@32000/32000.0' }],
    ['F_order_raw_reorder', '同上而 keys 掛鉤重排欄序:值不變(R07)', { file: [['id', 'price', 'model'], ['r1', '35000.0', 'Celica@35000'], ['r2', '32000.0', 'Mondeo@32000']] }],
    ['F_throw_raw', '格式化函數於下載時拋錯:原樣拋出(R02)', { throw: /^fmt boom$/ }],
    ['K_dupFmt', 'keys 掛鉤回重複鍵且格式化非冪等:不重複格式化(R07)', { file: [['price', 'price'], ['35001', '35001'], ['32001', '32001']] }],
    ['L_addRowsNoSource', '無數據列而 ltdt 掛鉤補列:新增之列不再格式化(R07)', { file: [H4, ['new', 'X', 'Y', '5']] }],
    ['O_keysHookArray', 'funGetKeysHook 給陣列:視為未給予並提示(R01)', { file: F4, log: /invalid funGetKeysHook\[\[object Array\]\], use default funGetKeysHook null/ }],
    ['O_optNull', 'opt 為 null:視為 {} 且不提示(R01)', { file: F4, nolog: /invalid opt/ }],
    ['O_useHeadStr', 'useHead 給字串:用預設 false 並提示(R01)', { file: F4, log: /invalid useHead\[true\], use default useHead false/ }],
    ['O_hookFalse', 'funGetLtdtHook 給 false:視為未給予並提示(R01)', { file: F4, log: /invalid funGetLtdtHook\[\[object Boolean\]\], use default funGetLtdtHook null/ }],
    ['K_unknownHead', 'keys 掛鉤回未知鍵加 useHead:表頭退回鍵名,該欄空白(R14)', { file: [['製造商', 'foo'], ['Toyota', ''], ['Ford', '']] }],
    ['K_asyncKeys', 'keys 掛鉤為 async:拋須同步回傳(R15)', { throw: /funGetKeysHook must return synchronously, Promise is not supported/ }],
    ['K_permute_disp', 'disp 之 keys 掛鉤反轉加 useHead:表頭與數據對齊(R14)', { file: [['價格', '型號', '製造商', '主鍵'], ['35000', 'Celica', 'Toyota', 'r1'], ['32000', 'Mondeo', 'Ford', 'r2']] }],
    ['K_permute_raw', 'raw 同上(R14)', { file: [['價格', '型號', '製造商', '主鍵'], ['35000', 'Celica', 'Toyota', 'r1'], ['32000', 'Mondeo', 'Ford', 'r2']] }],
    ['K_badElem', 'keys 掛鉤回含 null 之陣列:拋錯(R15)', { throw: /funGetKeysHook must return an array of non-empty strings/ }],
    ['K_emptyStr', 'keys 掛鉤回 [\'\']:拋錯(R04、R15)', { throw: /funGetKeysHook must return an array of non-empty strings/ }],
    ['K_rejected', 'keys 掛鉤回 rejected Promise:同步拋錯且無未處理之 rejection(R15)', { throw: /funGetKeysHook must return synchronously/, noUncaught: true }],
    ['L_rejected', 'ltdt 掛鉤同上(R15)', { throw: /funGetLtdtHook must return synchronously/, noUncaught: true }],
    ['M_rejected', 'mat 掛鉤同上(R15)', { throw: /funGetMatHook must return synchronously/, noUncaught: true }],
    ['L_mixedRows', 'ltdt 掛鉤回含空物件之列:拋錯並指出索引(R15)', { throw: /funGetLtdtHook must return an array of non-empty objects, invalid row\[1\]/ }],
    ['L_singleEmpty', 'ltdt 掛鉤回 [{}]:拋錯(R04、R15)', { throw: /funGetLtdtHook must return an array of non-empty objects, invalid row\[0\]/ }],
    ['M_1d', 'mat 掛鉤回一維陣列:拋須二維(R15)', { throw: /funGetMatHook must return a two-dimensional array/ }],
    ['M_ltdt', 'mat 掛鉤回物件陣列:拋須二維(R15)', { throw: /funGetMatHook must return a two-dimensional array/ }],
    ['M_nullRow', 'mat 掛鉤加 null 列:拋須二維(R15)', { throw: /funGetMatHook must return a two-dimensional array/ }],
    ['M_emptyRows', 'mat 掛鉤回 [[], []]:拋至少一列非空(R15)', { throw: /funGetMatHook must return at least one non-empty row/ }],
    ['M_oneBlankRow', 'mat 掛鉤回 [[]]:拋至少一列非空(R04、R15)', { throw: /funGetMatHook must return at least one non-empty row/ }],
    ['N_preReady_disp', '掛載後同一 tick 呼叫 disp:照常產檔(R12)', { file: F4 }],
    ['N_preReady_raw', '掛載後同一 tick 呼叫 raw:照常產檔(R12)', { file: F4 }],
    ['N_noOpt_raw', '元件未給 opt 時 raw:拋 no downloadable keys(R15)', { throw: /downloadData: no downloadable keys/ }],
    ['N_noOpt_disp', '元件未給 opt 時 disp:拋錯(R13、R15)', { throw: /downloadDisplayData: (no downloadable keys|grid is not available)/ }],
    ['N_destroyed_disp', '元件銷毀後 disp:拋 grid is not available(R13)', { throw: /downloadDisplayData: grid is not available/ }],
    ['N_destroyed_raw', '元件銷毀後 raw:不需 grid 而照常產檔(R12)', { file: F4 }],
    ['W_wtable_raw', '仿 w-table-vue 之呼叫形狀(raw):正確且無提示(R01)', { file: [['make', 'model', 'price'], ['Toyota', 'Celica', '35000'], ['Ford', 'Mondeo', '32000']], nolog: /invalid/ }],
    ['W_wtable_disp', '仿 w-table-vue 之呼叫形狀(disp 加 useHead):正確且無提示(R01)', { file: [['製造商', '型號', '價格'], ['Toyota', 'Celica', '35000'], ['Ford', 'Mondeo', '32000']], nolog: /invalid/ }],
    ['W_wtable_singleCol', '仿 w-table-vue 移除單欄表格之唯一欄:拋 no downloadable keys(R15)', { throw: /downloadData: no downloadable keys/ }],
    ['W_wtable_emptyHead', '仿 w-table-vue 下載表頭範本:只輸出中文表頭(R15)', { file: [H4c] }],
    ['Fn_noExt', 'fileName 無副檔名:補 .xlsx 且不提示(R01)', { file: F4, fileName: 'report.xlsx', nolog: /invalid fileName/ }],
    ['G_getDisplayData_pinned', 'getDisplayData 於有固定欄:鍵序依畫面(R13)', { custom: true }],
    ['G_getDisplayData_plain', 'getDisplayData 一般表格:鍵序依 opt.keys(R13)', { custom: true }],
    ['G_keys_pinned', 'getDisplayDataKeys 於有固定欄:畫面欄序(R13)', { custom: true }],
]

describe('e2e-download-extended:下載補測 91 格', function() {
    let ctx = null

    before(function() {
        tmp.make()
    })

    after(function() {
        tmp.clean()
    })

    beforeEach(async function() {
        ctx = await openPage(pageUrl('download-extended.html'), { minCells: 20, downloadsPath: tmp.dir })
    })

    afterEach(async function() {
        if (ctx) {
            await ctx.close()
        }
        ctx = null
    })

    for (let [id, title, exp] of cases) {
        it(`${id} ${title}`, async function() {
            if (pre[id]) {
                await pre[id](ctx.page)
                await waitGridIdle(ctx.page, { scope: '#t8' })
            }
            let screen = peek[id] ? await peek[id](ctx.page) : null
            let expectDownloads = exp.custom || exp.throw || exp.noFile ? 0 : (exp.downloads || 1)
            let r = await runHostCase(ctx, id, { expectDownloads, saveDir: tmp.dir, readFile: !exp.big })
            if (exp.custom) {
                custom[id](r)
                assert.deepStrictEqual(r.pageErrors, [], 'pageerror')
                return
            }
            if (exp.big) {
                //百萬列之檔不讀回(讀回需數十秒與大量記憶體), 只核對不拋錯、已產檔與回傳之列數
                assert.ok(!r.out.threw, `不應拋錯: ${r.out.err}`)
                assert.strictEqual(r.downloadCount, 1, '下載次數')
                assert.strictEqual(r.out.retLen, exp.big, '回傳之列數')
                assert.strictEqual(r.file.fileName, 'data.xlsx')
                assert.deepStrictEqual(r.pageErrors, [], 'pageerror')
                return
            }
            assertDownloadCase(r, exp)
            if (exp.screen !== undefined) {
                assert.strictEqual(screen, exp.screen, '下載內容須與畫面一致')
            }
        })
    }

})
