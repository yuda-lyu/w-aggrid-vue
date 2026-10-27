# 規則帳本

本檔為套件設計與開發階段之規則帳本,為要求程式碼須長成什麼樣,或由規格產出之測試(項目/說明/流程)有哪些,包含軸、單一擁有者、已知限制、破壞性變更紀錄,以及對應是哪些測試檔案或指令等,由agent自行編列、擴充與維護.

## 0. 用法

- **以規則為單位**:每條列出規則、單一擁有者(規則只實作於此,他處呼叫它)、盤點指令、站點全集與狀態、測試、來源.已知限制、測試帳本、變更紀錄分別集中於第 6、7、8 節.
- **盤點指令**於 repo 根以 Git Bash 執行,也可用 Grep 工具以同一 regex 搜尋.括號內之命中數與行號為 2026-10-07 工作樹之值;改版後以命中內容定位,命中數變動即須回頭核對站點表.
- **站點狀態**:已套/未套(違反本規則,待修或待裁示)/刻意不套(附理由)/範圍外(不歸本規則管,附理由)/未驗(未實測,判準待確認).盤點出現表外之命中,先補列並給狀態才算完成.
- **改碼後**:重建 dist(`node toolg/gDistRollupComps.mjs`),重跑受影響規則之盤點與測試(第 7 節);命中與表不符時,修碼或更新本檔後才交付.
- 下文之 `F` 指 `src/components/WAggridVue.vue`;案例代號(如 D1、U5、FC8)為 `test/` 內 `it()` 標題之開頭,以代號 Grep 測試檔即得其輸入與應然(第 7 節列檔案對照).

### 規則索引

| 編號 | 規則 | 未套站點 |
|---|---|---|
| R01 | 選項無效即預設,有給予時於 console 提示 | 無(位置參數待裁示) |
| R02 | 失敗訊號:下載同步拋 Error、上傳 reject { msg, err };呼叫端函數之錯誤原樣傳出 | 無 |
| R03 | 訊息前綴 `[w-aggrid-vue] <方法名>: `(prop 為 `opt.<鍵>`) | 無 |
| R04 | 資料列之投影只經 pickRowsByKeys,不以 wsemi isearr/ltdtmapping 判斷資料列之有無 | 無 |
| R05 | 共用契約之 JSDoc 只寫一處 | 無 |
| R06 | 儲存格文字只經 cvCellText;valueFormatted 以 bCellFormat 門控 | 無 |
| R07 | kpCellFormat 之作用範圍與簽名 | 無 |
| R08 | 自訂表頭補齊預設表頭之互動指示;監聽成對移除 | 無 |
| R09 | 焦點框 CSS 同時涵蓋 :focus 與 :focus-within | 無 |
| R10 | 已移除之 opt 鍵只警告一次 | 無 |
| R11 | showKeys 只傳最小欄位狀態 | 無 |
| R12 | 兩個下載方法共用 downloadCore | 無 |
| R13 | 下載與顯示數據之欄位與列來源 | 無(pasteText 之固定欄貼上規則未驗) |
| R14 | 下載之值:提取、格式化與正規化 | 無 |
| R15 | 三個下載掛鉤之回傳契約;最終二維陣列之 Excel 上限 | 無 |
| R16 | 分頁名規則照抄 hucre | 無 |
| R17 | uploadData 之流程順序與寫入前檢查 | 無 |
| R18 | 範例即對外文件 | 無 |
| R19 | 需表格之方法以 isGridAvailable 判斷:公開方法拋 grid is not available,內部延後路徑靜默 | 無 |
| R20 | 過濾狀態以同步之 getFilterModel 取得;filterChange 每次變更恰 1 次、表格不存在不發 | 無 |
| R21 | 標頭容器被程式單獨捲動時,資料區須捲到相同位置 | 無 |
| R22 | 元件自寫之資料寫入路徑一律經 isCellEditable 判斷,語意同 ag-grid 之 colDef.editable | 無(uploadData 整表載入刻意不套,主控 2026-10-28 裁示維持) |
| R23 | 元件寫回 opt.rows 時保留列之全部欄位(列拖曳、貼上);只有整表載入(uploadData)依 opt.keys 提取 | 無(filterall 時列拖曳寫回僅顯示子集,待裁示,第 6 節 #21) |

## 1. 共通規則

### R01 選項無效即預設,有給予時於 console 提示

- **規則**:公開方法之 `opt` 及其各鍵為額外傳入.未給予(null、undefined)時用預設且不提示;有給予但非指定之值或型態時亦用預設,並呼叫 `logUseDefault(方法名, 鍵, 值, 預設)`,印出 `[w-aggrid-vue] <方法名>: invalid <鍵>[<值>], use default <鍵> <預設>`(字串與數值顯示原值,其餘顯示型態).不拋錯、不 reject.掛鉤類之鍵非函數時視為未給予.
- **不適用**:資料內容之契約(掛鉤或 beforeUpload 之回傳值、無可寫入之列)不屬選項,依 R02、R15、R17 拋錯或 reject.
- **單一擁有者**:F 模組層 `isGiven`、`logUseDefault`(176–185).
- **盤點**:
  - 帶 opt 之公開方法:`git grep -nE '^ {8}[A-Za-z]+: (async )?function\(.*opt' -- src/components/WAggridVue.vue`(4 筆:showKeys、downloadDisplayData、downloadData、uploadData)
  - 提示站點:`git grep -n 'logUseDefault(' -- src/components/WAggridVue.vue`(13 筆:定義 1、downloadCore 6、showKeys 2、uploadData 4)
- **站點**:

| 方法 | 鍵 | 有效判準 | 預設 | 狀態 |
|---|---|---|---|---|
| downloadData、downloadDisplayData(經 downloadCore) | opt | isobj | {} | 已套 |
| 〃 | funGetKeysHook、funGetLtdtHook、funGetMatHook | isfun | 不呼叫 | 已套 |
| 〃 | useHead | isbol | false | 已套 |
| 〃 | useFormat | isbol | true | 已套 |
| 〃 | fileName | isestr;無 '.' 時補 '.xlsx'(補副檔名不提示) | 'data.xlsx' | 已套 |
| 〃 | sheetName | 見 R16 | 'data' | 已套 |
| uploadData | opt | isobj | {} | 已套 |
| 〃 | beforeUpload | isfun | 不處理 | 已套 |
| 〃 | uploadMode | 'replace' 或 'append'(大小寫敏感) | 'replace' | 已套 |
| 〃 | parseSheetInd | `isp0int(v, { useLimitSafe: true })`(接受整數字串),通過後 cint | 0 | 已套 |
| showKeys | opt | isobj | {} | 已套(2026-10-07) |
| 〃 | opt.applyOrder | isbol | true | 已套(2026-10-07) |
| 元件 prop opt(changeOpt) | opt 本身 | 非空物件(iseobj) | 不更新表格 | 已套(2026-10-07):未給予不提示;有給予而無效時印 `[w-aggrid-vue] opt is invalid, ...the table is not updated`(prop 為主設定,無預設可退,故「預設」為不更新) |
| 〃 | keys、rows | isearr、isarr | 不更新表格 | 已套:印 `[w-aggrid-vue] opt.keys is invalid, ...`/`opt.rows is invalid, ...`(R03) |
| setHeadFilter 之 type、key;fitColumns 之 bDebounce;pasteText 之 showRowIndNow/showColKeyNow | — | — | — | 範圍外:位置參數,非 opt;**待裁示**是否比照(setHeadFilter 之 type 誤植時 ag-grid 靜默改用預設、key 為物件或 null 時靜默結束,皆不拋原生錯誤) |

- **測試**:上傳 U9a、U9b、U9c、U9d、U10、U10a、U11、U12、R_optString、R_optArray、R_modeEmpty、R_modeUpper、R_sheetIndTrue、R_sheetIndEmptyStr、R_sheetIndInfinity;下載 O_keysHookArray、O_hookFalse、O_useHeadStr、O_optNull、S_sheet*、Fn_noExt、W_wtable_raw、W_wtable_disp;showKeys SK6_str、SK6_zero、SK6_x(提示)、SK6_null、SK7、SK12_optNull(不提示)、SK12_optStr(提示);元件 prop O3、O4(提示)、O5(不提示).
- **來源**:使用者裁示 2026-10-06(先定於 uploadData,下載端隨後追認).取代原「無效選項拋錯或開窗前 reject」之決定.
- **取捨**:uploadMode 誤植(如 'apend')會以 'replace' 清掉表格原有數據;使用者知悉後仍採此風格,以 console 提示為訊號.

### R02 失敗訊號:下載同步拋 Error、上傳 reject { msg, err };呼叫端函數之錯誤原樣傳出

- **規則**:
  1. 下載:同步 `throw new Error('[w-aggrid-vue] <方法名>: <訊息>')`,不產檔.
  2. 上傳:`return Promise.reject({ msg, err })`,msg 為簡短代碼(供呼叫端比對,不加前綴),err 為說明;reject 前不寫入表格、不觸發 rowsChange.
  3. 同步拋錯一律為 Error 實例(lint `no-throw-literal`),不 throw 物件常值.兩者形狀不同屬刻意(一同步一非同步,2026-10-06 核准).
  4. 呼叫端提供之函數(三個下載掛鉤、kpCellFormat、beforeUpload)自身之錯誤原樣傳出,不包裝、不 try/catch;beforeUpload 之 reject 值保持同一參照(w-table-vue 以 `err === errNoEffData` 比對).
- **單一擁有者**:downloadCore 內 `newError`;uploadData 內 `newErr`;表格不可用之錯誤為模組層 `getApiOrThrow`(R19).
- **盤點**:
  - 拋錯與 reject:`git grep -nE 'throw |Promise\.reject\(' -- src/components/WAggridVue.vue`(23 筆:throw 12、reject 11)
  - 呼叫端函數之呼叫點:`git grep -nE '(funGetKeysHook|funGetLtdtHook|funGetMatHook|funCellFormat|beforeUpload)\(' -- src/components/WAggridVue.vue`(6 筆)
- **站點**:

| 行 | 位置 | 訊息或代碼 | 狀態 |
|---|---|---|---|
| 214 | getApiOrThrow(R19) | `<方法名>: grid is not available`(10 個需表格之公開方法共用) | 已套 |
| 234 | downloadCore 之 checkSync | `<掛鉤名> must return synchronously, Promise is not supported` | 已套 |
| 307、310 | downloadCore | `funGetKeysHook must return an array of keys`、`... an array of non-empty strings` | 已套 |
| 317 | downloadCore | `no downloadable keys` | 已套 |
| 347、353 | downloadCore | `funGetLtdtHook must return an array`、`... an array of non-empty objects, invalid row[i]` | 已套 |
| 387、392 | downloadCore | `funGetMatHook must return a two-dimensional array`、`... at least one non-empty row` | 已套 |
| 399、405 | downloadCore | `too many rows, Excel allows at most 1048576 rows including the header row`、`too many columns, Excel allows at most 16384 columns, invalid row[i]`(R15) | 已套(2026-10-07) |
| 2481 | showKeys | `[w-aggrid-vue] showKeys: keys must be an array of non-empty strings`(keys 為必要資料,不改欄位狀態) | 已套(2026-10-07) |
| 2904 | uploadData | `can not read file`,err 為 wsemi 原錯誤物件 | 已套;err 刻意不加前綴(保留原物件) |
| 2913 | uploadData | `no file`,err 為 `file selection was canceled` | 已套;err 刻意不加前綴(2026-09-24 起之既有值) |
| 2927 | uploadData | `can not read excel`,err 為 wsemi 之錯誤字串 | 已套;err 刻意不加前綴(既有值) |
| 2935、2941 | uploadData | `can not get data from sheet` | 已套 |
| 2964、2967、2973 | uploadData | `invalid beforeUpload return` | 已套 |
| 2985、3006 | uploadData | `no data` | 已套 |
| 2995 | uploadData | `no matching keys` | 已套 |
| 304、328、344、384、2962 | 下載三掛鉤、下載之格式化函數、beforeUpload 之呼叫點 | 未以 try/catch 包住 | 已套 |
| 1928 | 畫面 valueFormatter 內呼叫格式化函數 | 由 ag-grid 呼叫 | 範圍外 |

- **測試**:
  - 下載拋錯且不產檔:D2、D2b、D3、D4、D5、D6、X1、X2、L_emptyObj、M_empty、M_promise、K_asyncKeys、K_badElem、K_emptyStr、L_mixedRows、L_singleEmpty、M_1d、M_ltdt、M_nullRow、M_emptyRows、M_oneBlankRow、N_noOpt_raw、N_noOpt_disp、N_destroyed_disp、W_wtable_singleCol、C_keys16385、C_keys16385_disp、C_mat16385、C_matRow1Wide、C_rows1048577、C_rows1048577_disp
  - 寫檔才失敗(無法拋錯,只記錄):M_cellStyleBad
  - 表格不可用:E01–E09、E14、X01–X09、X13、W1、W2(R19);showKeys 之 keys:SK13、SK14、SK16–SK19
  - 下載原錯誤:K_throw、L_throw、M_throw、F_throw_raw;無未處理之 rejection:K_rejected、L_rejected、M_rejected
  - 上傳 reject 且表格不變:U1、U1a、U2、U3、U3b、U6、U6a、U6b、U7、U7a、U7b、U7c、U8、U9、U9d、U15、R_noteOnly_noHook、R_noteOnly_identity、R_hookTwoEmptyObj、R_hookUndefinedVals、R_allBlank_replace、R_allBlank_append、R_inplaceNoReturn、W_wtable_identity_allBlank、W_wtable_identity_noteOnly、W_wtable_hook_arrays、C_cancel
  - 上傳原錯誤:U4;哨兵參照:U5、R_thenableReject、W_wtable_hook_headOnly、W_wtable_default_cnHead、W_wtable_default_allBlank、W_wtable_default_headOnly
- **來源**:2026-10-06 下載複審 Q3、Q4、R6、R26;上傳複審 Q8、Q10、R9、R10.

### R03 訊息前綴

- **規則**:套件產生之錯誤訊息與 console 提示以 `[w-aggrid-vue] <方法名>: ` 開頭;元件 prop opt 之訊息(prop 無方法名)為 `[w-aggrid-vue] opt ...` 或 `[w-aggrid-vue] opt.<鍵> ...`(已移除鍵之警告、opt 與其 keys、rows 無效),使呼叫端只記錄錯誤內容時仍可辨識來源.內部方法(changeOpt)之名稱不出現在 prop 之訊息中.
- **盤點**:錯誤見 R02;console:`git grep -nE '^[[:space:]]*console\.(log|warn|error)\(' -- src/components/WAggridVue.vue`(9 筆)
- **站點**(console):

| 行 | 位置 | 狀態 |
|---|---|---|
| 184 | logUseDefault | 已套 |
| 412、416 | downloadCore 寫檔之 `.then`({ error })與 `.catch`(觸發下載時之例外):`<方法名>: can not write excel file` | 已套(2026-10-07) |
| 2019 | changeOpt:`opt is invalid, it must be an object with keys and rows, the table is not updated` | 已套(2026-10-07) |
| 2035 | changeOpt 已移除鍵警告 | 已套 |
| 2043、2050 | changeOpt:`opt.keys is invalid, it must be a non-empty array of keys, ...`、`opt.rows is invalid, it must be an array, ...` | 已套(2026-10-07) |
| 2748 | fitColumns 之 catch:`fitColumns:` | 已套(2026-10-07);表格不可用時已先靜默略過(R19),此 catch 只收非預期之錯誤,未能以操作觸發 |
| 3068 | triggerFilterChange 之 catch:表格可用而取得過濾狀態失敗時 `triggerFilterChange:` | 已套(2026-10-07);未能以操作觸發(getFilterModel 於表格可用時不拋錯) |

- **測試**:R01、R02 之訊息比對(log 與 err 皆含前綴);O1–O4(prop 之訊息);M_cellStyleBad(寫檔失敗之記錄).
- **來源**:2026-10-06 下載複審 R18、上傳複審 R7;2026-10-07 規則帳本盤點缺陷之修正(三方複審).

### R04 資料列之投影只經 pickRowsByKeys,不以 wsemi isearr/ltdtmapping 判斷資料列之有無

- **規則**:wsemi `isearr` 對「長度 1 且唯一元素為空({}、''、null、undefined、[]、NaN,即 wsemi iser 之判準)」回 false,`ltdtmapping` 內部以之判斷,故 `ltdtmapping([{}], keys)` 回 `[]`,而 `ltdtmapping([{},{}], keys)` 回 2 列空白列(2026-10-06 以 wsemi 1.9.10 實測).依 keys 投影列一律用模組層 `pickRowsByKeys(rows, keys)`(keys 為空回 [],否則各列 `get(row, key, '')`,列數不變);判斷有無列、非空陣列、二維陣列一律用 `isarr`、`size`、`every(mat, isarr)`.呼叫其他內含 isearr 閘門之 wsemi 函數時,須說明其參數不會落入單一空元素之特例.rows 之元素須為物件;非物件之列經 pickRowsByKeys 各鍵為 ''.
- **單一擁有者**:F 模組層 `pickRowsByKeys`.
- **盤點**:`git grep -nE 'isearr\(|ltdtmapping\(|ltdtkeys2mat\(|binstr\(|arrHas\(|pickRowsByKeys\(' -- src/components/WAggridVue.vue`(11 筆)
- **站點**:

| 行 | 位置 | 狀態 |
|---|---|---|
| 190 | pickRowsByKeys 定義 | 單一擁有者 |
| 2696 | getDisplayData `pickRowsByKeys(rs, keys)` | 已套(2026-10-07);全部欄位隱藏時 keys 為空而回 [] |
| 2716 | getNowData `pickRowsByKeys(rs, vo.keys)` | 已套(2026-10-07);其內部呼叫端 agRowDragEnd、agRowDragLeave 之 rows 隨之正確 |
| 3010 | uploadData `pickRowsByKeys(rows, keys)` | 已套;其前之 no data、no matching keys 檢查須在投影前(投影後各列皆有 keys 之鍵) |
| 369 | downloadCore `ltdtkeys2mat(dataOut, useKeys)` | 刻意不套:dataOut 每列皆含 useKeys 全部之鍵(非空物件),useKeys 已驗為非空;單一 {} 列之下載見 C7、C8 |
| 979 | filterRows `binstr(c, filterall)` | 範圍外:keys 為非空之 filterall,非資料列之判斷 |
| 2042 | changeOpt `isearr(opt.keys)` | 刻意不套:keys 之唯一元素為空時本即無效 |
| 2089、2151、2261 | changeOpt `arrHas(選項, [...])` | 範圍外:純量選項之判斷 |
| 2912 | uploadData `isearr(選檔結果)` | 刻意不套:元素為檔案物件不會為空,取消時為 [] |

- **間接站點**(wsemi 內部):downloadExcelFileFromData 只在首列為非空物件時走 ltdtkeysheads2mat(本套件傳二維陣列,不走);getDataFromExcelFileU8Arr 之 isearr 閘門只在 fmt 為 'csv' 時走(本套件用 'ltdt'、'array').
- **測試**:C1、C2(單一 {} 列)、C10(過濾後恰剩 1 列 {})、C11(全部欄位隱藏時 getNowData)、C12(拖曳回呼)、C3–C9(對照);L_noRowsHookPass、L_singleEmpty、M_oneBlankRow、K_emptyStr、U7b、R_hookTwoEmptyObj.
- **來源**:2026-10-06 下載與上傳複審(isearr 特例曾造成欄位還原洩漏、ltdt 掛鉤回 [] 之誤拋、單一空列清空表格);2026-10-07 三方複審(間接站點、過濾後與拖曳之到達路徑).

### R05 共用契約之 JSDoc 只寫一處

- **規則**:兩個以上公開方法共用同一契約時,完整契約只寫在一處,其餘寫「同 <方法>」並只列差異,避免同一規則手寫兩份而日後不同步.
- **盤點**:`git grep -n '同downloadData' -- src/components/WAggridVue.vue`(4 筆,皆在 downloadDisplayData 之 JSDoc)
- **站點**:downloadData(完整契約)、downloadDisplayData(引用;差異為畫面欄序、表格不存在時拋錯、掛鉤加入隱藏欄亦輸出其值):已套.
- **來源**:2026-10-06 下載修正.

### R19 需表格之方法以 isGridAvailable 判斷:公開方法拋錯,內部延後路徑靜默

- **規則**:表格可用 = `getApi()` 非 null 且非 `isDestroyed()`(元件銷毀後 getApi 為 null;呼叫端經 getApi 呼叫 destroy 後 api 仍在、isDestroyed 為 true,其方法皆被 ag-grid 換成只印警告之函數).
  1. 需表格之公開方法以 `getApiOrThrow(vo, 方法名)` 取 api,不可用即拋 `[w-aggrid-vue] <方法名>: grid is not available`(async 方法即 reject);同一方法內只取一次並沿用.
  2. async 方法於 await 之後再以 getApiOrThrow 重取(等待期間表格可能已銷毀).
  3. 內部延後執行之路徑(去抖動、resize、delay、事件回呼後之延續)以 `isGridAvailable` 判斷,不可用即靜默略過,不拋錯(無人可接)、不呼叫已銷毀之 api(會印 ag-grid 警告).
  4. 不需表格之方法(downloadData、uploadData、getGridOptions)不檢查;getApi 為存取器,原樣回傳.
- **單一擁有者**:F 模組層 `isGridAvailable`、`getApiOrThrow`.
- **盤點**:`git grep -nE 'getApiOrThrow\(|isGridAvailable\(|vo\.getApi\(\)' -- src/components/WAggridVue.vue`(30 行:getApiOrThrow 13 行(定義 1、呼叫 12)、isGridAvailable 8 行(定義 1、呼叫 7)、vo.getApi() 11 行(其中 2 行同時含 isGridAvailable、3 行為註解));命中之 `vo.getApi()` 須皆在 getApiOrThrow 內、isGridAvailable 之引數或註解,或為下表之刻意不套.
- **站點**:

| 方法 | 處置 | 狀態 |
|---|---|---|
| showKeys、getDisplayDataKeys、getDisplayData、getNowData、pasteText、downloadDisplayData | getApiOrThrow(同步拋錯) | 已套(2026-10-07;downloadDisplayData 原只判 null) |
| getFilters、clearHeadFilterAll | getApiOrThrow(reject) | 已套(2026-10-07) |
| setHeadFilter、clearHeadFilter | getApiOrThrow,await setColumnFilterModel 後再取一次 | 已套(2026-10-07) |
| refresh(delay 後)、fitColumns 之 fit(去抖動、resize 後)、setRowsPinnTop、setRowsPinnBottom(呼叫端之產生函數與 cellChange 等回呼之後) | isGridAvailable 不成立即 return | 已套(2026-10-07) |
| triggerFilterChange | 見 R20 | 已套(2026-10-07) |
| agCellKeyDown 之 `vo.getApi().stopEditing()`、agRowSelect 之 params.api、HeaderSlotRenderer 之 params.api | 由 ag-grid 之事件或表頭元件呼叫,當下表格必在 | 刻意不套(HeaderSlotRenderer 之銷毀見 R08) |
| getApi | 原樣回傳(null 或可能已銷毀之 api) | 範圍外:存取器;w-table-vue 以 isfun 檢查後使用 |
| downloadData、uploadData、getGridOptions | 不需表格 | 範圍外(uploadData 見 R17 第 8 步) |

- **測試**:`test/e2e-lifecycle.test.mjs` 之 E01–E17(元件銷毀後)、X01–X14(ag-grid 已銷毀、元件仍在)、W1、W2(await 期間銷毀)、PB1(使用者編輯後宿主於 cellChange 回呼內移除表格,置底列不得出錯);各格並斷言 console 無原生 TypeError 與 ag-grid 已銷毀之警告;N_destroyed_disp、N_destroyed_raw(下載).
- **來源**:2026-10-06 盤點之候選規則;2026-10-07 規則帳本盤點缺陷之修正(三方複審:isDestroyed、await 後重取、內部路徑、固定列回呼).

## 2. 畫面呈現

### R06 儲存格文字只經 cvCellText;valueFormatted 以 bCellFormat 門控

- **規則**:預設 cellRenderer 與 CellSlotRenderer 之 fallback 一律經 `cvCellTextByParams` → `cvCellText`:null、undefined 為 '',字串與數值為 cstr,其餘(物件、陣列、布林等)為 `JSON.stringify`,循環參照為 ''.renderer 不得回傳物件(ag-grid 會當 DOM 節點 appendChild 而拋錯,並中斷整表渲染).只有該欄有 kpCellFormat 時(cellRendererParams.bCellFormat 為 true)才採用 valueFormatted;slot props 之 valueFormatted 亦同,否則 ag-grid 對推斷為物件之欄自帶之 '[object Object]' 會流入.
- **單一擁有者**:F 模組層 `cvCellText`(138)、`cvCellTextByParams`(160).
- **盤點**:`git grep -nE 'cvCellText(ByParams)?\(|bCellFormat' -- src/components/WAggridVue.vue`(11 筆)
- **站點**:預設 renderer 1945、CellSlotRenderer fallback 436、cell-render slot props 430、cell-tooltip slot props 443、cellRendererParams 1940 與 1948:皆已套.
- **對稱**:下載之 null 亦輸出 ''(R14),與畫面一致.
- **測試**:`test/e2e-display-objcell.test.mjs` 之 OC1(16 格)、`test/e2e-display-slots.test.mjs` 之 S1、`test/e2e-kpCellFormat.test.mjs`(無 kpCellFormat 之物件欄仍顯示 JSON 字串).
- **來源**:2026-09-04 提交 d5a8d81、2026-09-05 提交 9ce2e47.

### R07 kpCellFormat 之作用範圍與簽名

- **規則**:`opt.kpCellFormat[key](value, key, row, params)` 作用於畫面顯示(colDef.valueFormatter)與下載(useFormat 為 true 時);排序與過濾依原值.row 一律為該列完整數據(畫面為 params.data,下載為完整來源列),下載時 params 為 null.回傳值原樣使用,套件不檢查、不轉換(含 Promise);回傳 null、undefined 代表不格式化.所有原值(含空值)原樣傳入,空值如何呈現由呼叫端決定.
- **單一擁有者**:畫面為 keys2columns 之 valueFormatter(1921–1931);下載為 downloadCore 之提取段(320–340).
- **盤點**:`git grep -n 'funCellFormat(' -- src/components/WAggridVue.vue`(2 筆:328 下載、1928 畫面)
- **站點**:兩筆皆已套.
- **測試**:`test/e2e-kpCellFormat.test.mjs` 之 F1–F11;下載 F_rowDep_raw_exclMake、F_rowDep_disp_exclMake、F_rowDep_raw、F_order_raw、F_order_raw_reorder、K_dupFmt(重複 key 不重複格式化)、L_addRowsNoSource(掛鉤新增之列不再格式化)、F_throw_raw、F_formatDisplayExclude、F_formatOff.
- **來源**:2026-09-05 提交 9ce2e47;使用者裁示「回傳值由呼叫端負責」;2026-10-06 下載複審 R10、R21.

### R08 自訂表頭補齊預設表頭之互動指示;監聽成對移除

- **規則**:HeaderSlotRenderer(head-render、head-tooltip slot 時使用)須自行實作 ag-grid 預設 HeaderComp 之:filter 圖示(聽 column 之 filterChanged,未過濾時 ag-hidden)、選單鈕常駐(gridOption suppressMenuHide 時加 ag-header-menu-always-show)、排序箭頭與多欄排序序號(聽 grid 層級之 sortChanged).凡 addEventListener 或 on 必有對應之 removeEventListener 或 clear,於 beforeDestroy 執行;grid 可能已銷毀時先檢查 isDestroyed 並 try/catch.
- **單一擁有者**:HeaderSlotRenderer(463–664).
- **盤點**:`git grep -nE 'addEventListener\(|removeEventListener\(|\.de\.(on|clear)\(' -- src/components/WAggridVue.vue`(10 筆,須兩兩成對)
- **站點**:sortChanged 616 與 658、filterChanged 624 與 651、window paste 902 與 917、domDetect 884 與 911、標頭容器 scroll(R21)1352 與 1356:皆成對,已套.
- **測試**:`test/e2e-display-slots.test.mjs` 之 S2(選單鈕常駐)、S3、S4(過濾圖示)、S6(排序圖示)、S8(Shift 多欄排序之序號,預設表頭與 head-render 表頭對稱);監聽成對移除以本條盤點指令靜態核對,無動態測試.
- **來源**:2026-09-04 提交 d5a8d81、58b2d36.

### R09 焦點框 CSS 同時涵蓋 :focus 與 :focus-within

- **規則**:opt.kpHeadFocusHighlight[key] 為 false 之欄,cellClass 為 'no-border';其 CSS 選擇器須同時有 `.no-border.ag-cell:focus` 與 `.no-border.ag-cell:focus-within`.ag-grid 31 之焦點框規則為 `.ag-cell-focus:focus-within`,儲存格內子控制項(tabindex 元素、input、button)取得焦點時,儲存格只符合 :focus-within.
- **盤點**:`git grep -n 'no-border' -- src/components/WAggridVue.vue`(3 筆:1833、3115、3116)
- **站點**:已套.
- **測試**:`test/e2e-focus.test.mjs` 之 FO1–FO4(原 tmp 腳本以注入規則重驗之 4 格未遷移:其驗的是 CSS 規則本身,與 FO2–FO4 之結果相同).
- **來源**:2026-09-16 提交 d91f842.

### R10 已移除之 opt 鍵只警告一次

- **規則**:opt 含 2.0.56 移除之 kpCellRender、kpCellTooltip、kpHeadRender、kpHeadTooltip 時,每個實例於首次 changeOpt 以 console.warn 對各鍵警告一次並指出對應 slot 名,不改行為.
- **盤點**:`git grep -nE 'kpRemoved|bWarnedRemovedKeys' -- src/components/WAggridVue.vue`(5 筆)
- **站點**:changeOpt(2025–2038),已套.
- **測試**:`test/e2e-display-slots.test.mjs` 之 S5(4 個鍵各警告 1 次)、S7(重新設定 opt 不再警告).
- **來源**:2026-09-04 提交 d5a8d81.

### R11 showKeys 只傳最小欄位狀態

- **規則**:`applyColumnState` 只給 `{ colId, hide }`,不回灌 getColumnState 之 width、sort、pinned;opt.applyOrder 預設 true(依 keys_new 重排),false 時只切換顯示並保留目前欄序(含使用者拖曳後之順序);固定欄(pinned)不論順序一律在左區.
- **盤點**:`git grep -nE 'applyColumnState\(|applyOrder' -- src/components/WAggridVue.vue`(9 筆,皆在 showKeys)
- **站點**:showKeys,已套;applyOrder、opt 無效時之提示屬 R01,keys 之契約屬 R02.
- **測試**:`test/e2e-showKeys.test.mjs`(SK1–SK19);範例 SKX1、SKX2、AL-*(`test/e2e-examples-display.test.mjs`).
- **來源**:2026-09-16 提交 673d2b3(外部建議文件之建議二).

### R20 過濾狀態以同步之 getFilterModel 取得;filterChange 每次變更恰 1 次、表格不存在不發

- **規則**:
  1. getFilters 先 `await $nextTick()`(首次 render 中由 computed changeFilterall 觸發時子組件 ag-grid 尚未建立),再以 getApiOrThrow(R19)取 api,以同步之 `getFilterModel()` 取生效中之模型(含隱藏欄),依 opt.keys 之順序以 `fm[key]` 收 iseobj 者(getFilterModel 之鍵序為過濾器建立順序;key 含 '.' 時不可用 lodash get).不使用 `getColumnFilterInstance`(對未啟用過濾之欄與不存在之 key 永不 resolve),不讀非公開之 appliedModel.
  2. opt.filterChange 於掛載與 filterall 變更(from 'filterall')、表頭過濾變更(from 'heads',含 setHeadFilter、clearHeadFilter、clearHeadFilterAll 與使用者於浮動過濾之輸入)各發 1 次;flts 為觸發後下一個更新週期讀取之狀態;各事件依觸發順序發出.
  3. 表格不可用時不發事件(取得過濾狀態之前或之後銷毀皆然);表格可用而取得失敗時以 `[w-aggrid-vue] triggerFilterChange:` 記錄且不發,不以錯誤之過濾狀態通知呼叫端.呼叫端之 filterChange 自身拋錯則原樣傳出(R02 第 4 項).
  4. clearHeadFilterAll:有生效過濾時由 ag-grid 之 setFilterModel 觸發 onFilterChanged(不再自行觸發),無生效過濾時自行觸發,皆恰 1 次.
  5. computed changeFilterall 只應依賴 filterall:triggerFilterChange 於同步段只讀 filterall,vo.keys 由 getFilters 於 await 之後讀取(否則 opt 換成新 keys 陣列時 computed 重算而多發 filterall 事件).
- **單一擁有者**:getFilters、triggerFilterChange、clearHeadFilterAll.
- **盤點**:`git grep -nE 'getColumnFilterInstance|getFilterModel\(|onFilterChanged\(|triggerFilterChange\(' -- src/components/WAggridVue.vue`(9 行;getColumnFilterInstance 須為 0)
- **站點**:

| 位置 | 處置 | 狀態 |
|---|---|---|
| getFilters | getFilterModel + 依 keys 收集 | 已套(2026-10-07) |
| triggerFilterChange 之呼叫:computed changeFilterall、agFilterChanged | 掛載與 filterall、表頭過濾 | 已套 |
| clearHeadFilterAll | 依有無生效過濾決定是否自行觸發 | 已套(2026-10-07) |
| setHeadFilter、clearHeadFilter | await setColumnFilterModel 後自行觸發 1 次(setColumnFilterModel 不觸發) | 已套 |
| HeaderSlotRenderer 之 onFilterChanged | 表頭元件自身之方法(過濾圖示) | 範圍外(R08) |

- **測試**:`test/e2e-filters.test.mjs` 之 FL1–FL14(getFilters 與過濾方法,含複合、數值、多欄之鍵序、隱藏且關閉、空表之排隊)、FC1–FC12(事件之有無、內容與筆數,筆數以靜止窗確認未多發);範例 EXF1;E05、X05(表格不可用).
- **來源**:2026-10-06 盤點(getFilters 永不結束、有關閉過濾欄時 filterChange 全不觸發,w-table-vue 之「下載過濾後數據」鈕因此不出現);2026-10-07 三方複審(isDestroyed、事件數、keys 依賴、時序).

### R21 標頭容器被程式單獨捲動時,資料區須捲到相同位置

- **成因(2026-10-20 真瀏覽器實測,Gitea issue #9)**:ag-grid 31 之水平捲動只由資料區 `.ag-center-cols-viewport` 單向同步到標頭 `.ag-header-viewport`(GridBodyScrollFeature 之 `horizontallyScrollHeaderCenterAndFloatingCenter`),從不讀回標頭自身之 scrollLeft.標頭容器雖為 overflow:hidden,仍可被**程式或瀏覽器**單獨捲動:Playwright `locator.click()` 對只露出一部分之元素先捲入可見(置中)、呼叫端對標頭內元素 `scrollIntoView()`、對標頭內可聚焦元素 `focus()`.標頭 scrollLeft 變動而資料區不動,每欄欄名即對到相鄰欄之資料.
  - **與本套件標頭範本無關**:原生 ag-grid-community 31.3.4(無本套件範本)、預設標頭、head-render slot、slot 內含可聚焦元素(a),四者同樣重現(`locator.click` 標頭格:hv=52/cv=0).真滑鼠點擊露出之部分、鍵盤 Tab/方向鍵走過標頭(ag-grid 先 ensureColumnVisible)、真滑鼠點擊 slot 內之 a,皆不引起標頭單獨捲動.「可聚焦元素觸發捲入」只有程式 `focus()` 才成立(與 scrollIntoView 同屬程式觸發).
- **規則**:agReady 對 `.ag-header-viewport` 掛 scroll 監聽,標頭與資料區 scrollLeft 相差 ≥1px 時排入下一個畫面幀再確認:資料區於期間未動(位置與事件當下相同)而仍不一致,才使資料區跟上標頭(以標頭位置為準:目標是被有意捲入可見的位置;Playwright 以捲入後之位置算點擊座標,還原標頭會使目標移位).**跟上時同時寫入資料區 `.ag-center-cols-viewport` 與 ag-grid 之橫向捲軸元件 `.ag-body-horizontal-scroll-viewport`**:ag-grid 同一時間只接受一個捲動來源(`isControllingScroll`;使用者拖曳捲軸後 500ms 內只認捲軸、其餘認資料區,被拒之寫入會使捲軸位置、頂/底釘選列之 translateX、欄虛擬化停在舊位置而資料區已動——2026-10-20 實測 fake=300、cv=276、最右欄未渲染,兩位審查者獨立指出),兩處皆寫則不論當下由誰掌控,ag-grid 都走完整同步.資料區捲動範圍小於標頭到不了該位置者,再隔一幀仍不一致則標頭還原為資料區位置.ag-grid 自身之資料區→標頭同步、連續滾輪(資料區仍在動)皆不介入.容許差 1px(`isSync`):ag-grid 同步標頭時對位置取整(`onHScrollCommon` 之 `Math.round`),縮小容許值會與其取整互相追逐.beforeDestroy 移除監聽並取消排程中之畫面幀.
  - **範圍差之成因**(minimax 審查指出,已核對 ag-grid.css):`.ag-ltr .ag-header-cell-resize { right: -4px }`,最末欄之欄寬調整把手溢出標頭容器 4px,故標頭可捲範圍比資料區多 4px(7 欄×150px、表寬 950:標頭 1054、資料區 1050),與垂直捲軸無關.
  - **已知限度(不處理,已登記)**:①第一次補償寫入後、ag-grid 回寫標頭前,若標頭又被捲到新位置,新位置會被回寫蓋掉(連續兩幀內之兩次程式捲動;平滑捲動 `scroll-behavior: smooth` 亦屬此類),不含於本規則;②背景分頁不執行畫面幀,錯位持續到分頁回前景;③`bindHeaderScrollSync` 只掛監聽、不於綁定當下檢查既有錯位(gridReady 時兩者皆在初始位置);④呼叫端僅以 getApi().destroy() 銷毀 ag-grid 而外層元件仍存活時,監聽與閉包保留到元件銷毀;⑤高 DPI 小數 scrollLeft、觸控慣性、RTL(元件未開放 enableRtl)未實測;⑥以 querySelector 取表格內第一個符合者,表頭 slot 內再嵌套一個 w-aggrid-vue 時可能綁錯(未實測,不支持此用法).
- **單一擁有者**:bindHeaderScrollSync(掛)、unbindHeaderScrollSync(拆).
- **盤點**:`git grep -nE 'bindHeaderScrollSync|headerScrollOff|ag-header-viewport|ag-center-cols-viewport|ag-body-horizontal-scroll-viewport' -- src/components/WAggridVue.vue`
- **站點**:

| 位置 | 處置 | 狀態 |
|---|---|---|
| agReady → bindHeaderScrollSync | 掛監聽 | 已套 |
| beforeDestroy → unbindHeaderScrollSync | 拆監聽、取消畫面幀 | 已套 |
| 浮動過濾列 | 與欄名列同在 `.ag-header-viewport` 內,隨之 | 範圍內 |
| 釘選左側欄之標頭 | 無水平捲動(HS5、HS6、HS16) | 範圍外 |
| 右側釘選(元件無 opt,經 getApi().applyColumnState 可達) | 中間欄仍為單一捲動容器(HS28) | 範圍內 |
| 頂部、底部釘選列 | ag-grid 以 translateX 同步資料區位置,非 scrollLeft;因跟上時寫入橫向捲軸元件而走完整同步,儲存格左緣與欄名對齊(HS26) | 間接受益(已驗) |
| 垂直方向 | 未涉本問題 | 範圍外 |
| RTL | 元件未開放 enableRtl,未驗 | 範圍外 |

- **測試**:`test/e2e-headerscroll.test.mjs` 31 格,宿主頁 `test/pages/headerscroll.html`(查詢字串切換標頭範本、釘選、置頂置底列、寬度、欄數、列數;頁首包裝 addEventListener 記錄 `.ag-header-viewport` 之 scroll 監聽註冊與移除).
  - 修(修前 HEAD 紅,19 格):HS1–HS8(locator.click 欄名文字/標頭格 × 預設/slot/slot 含 a × 有無釘選 × 末欄且有垂直捲軸)、HS9(呼叫端 `focus()`)、HS10(呼叫端 `scrollIntoView()`)、HS11(補償後回捲)、HS17(監聽成對移除)、HS18(資料區已在最右之範圍差)、HS19(左緣被裁切之欄,方向相反)、HS20(連續兩次程式捲動)、HS21(銷毀後重建)、HS22(0 列)、HS26(拖曳橫向捲軸後 500ms 內之來源仲裁,含置頂置底列)、HS28(經 API 右側釘選).
  - 保留(修前後皆綠,12 格):HS12(真滑鼠點擊,預設/含 a)、HS13(先以滾輪捲到完整可見再點之對照組,預設/slot)、HS14(鍵盤 Tab 與方向鍵逐欄,預設/含 a)、HS15、HS16(連續快速滾輪,資料區只前進不倒退、最終 400)、HS23(同一任務內標頭 100/資料區 300 → 皆 300)、HS24(確認前資料區又被捲動 → 皆為資料區之位置)、HS25(滾輪置於標頭上,皆不捲動)、HS27(同一任務內先資料區 300 再標頭 400 → 皆 300).
  - 判準:`alignedProblem`(hv、cv 差 <1px;已渲染各欄標頭格與第 0 列儲存格左緣差 ≤0.5px,至少 3 欄含目標欄;需完整可見者目標欄標頭格在容器內);`waitAligned` 達一致後再觀察 300ms 仍須一致.排序斷言為已渲染各列升冪且第 0 列為 v000.
  - **變異**(2026-10-20,單點變異後重建 dist 跑全檔,每次都還原並重建):M1 不掛監聽(等同修正前)→ 19 格紅(恰為上列「修」)、12 格綠;M2 拿掉第二階段(標頭還原)→ HS18;M3 拿掉 removeEventListener → HS17;M4 不延後直接採用 → HS18、HS26、HS23;M5 拿掉「資料區於期間未動」之判斷 → HS24;M6 跟上時不寫橫向捲軸元件 → HS26;**M7 銷毀時不取消畫面幀 → 無格轉紅**(脫離 DOM 後之畫面幀讀寫皆為 0,無可觀察後果,屬資源衛生,不設測試).
  - **已知限度**:「標頭落後資料區」之競態以 CDP 滾輪(間隔 0/4/8/16/33ms × 40 次)實測,標頭事件當下 hv≠cv 之次數為 0,此環境無法自然重現,延後確認與「資料區未動」判斷屬防禦性設計,以 HS23、HS24、HS27 之合成情境守護;橫向捲軸以程式捲動捲軸元件模擬(Playwright headless 以 `--hide-scrollbars` 啟動,無法拖曳原生捲軸);觸控慣性、背景分頁暫停畫面幀、高 DPI 之小數 scrollLeft 未實測.
- **來源**:2026-10-20 Gitea issue #9(frliq 之 e2e 發現,建議檔 `建議w-aggrid-vue修正.md`);建議書推測之成因(欄名格取得焦點使瀏覽器只捲標頭)經實測部分成立(僅程式觸發),主因為 Playwright 之捲入可見.

### R22 元件自寫之資料寫入路徑一律經 isCellEditable 判斷,語意同 ag-grid 之 colDef.editable

- **成因(2026-10-28,Gitea issue #13,w-web-perm 提出)**:`opt.kpCellEditable[key]` 原樣指給 `colDef.editable`(F:1947),ag-grid 原生入口(雙擊、F2、鍵入)皆依 `column.isCellEditable(rowNode)` 判斷,傳入函數即可逐列唯讀.元件自寫之貼上(Ctrl+V → agCellKeyDown → pasteText)原本把各欄 `colDef.editable` 存成表、以真值判斷,函數恆為真值 → 唯讀列上貼上仍寫入(修前 HEAD:pasteText 之 `kpEditable[v.field] = v.editable`、`if (!kpEditable[trueColKey])`).
- **規則**:
  1. `kpCellEditable` 之值型態同 ag-grid `colDef.editable`:布林值(整欄)、函數 `(params) => boolean`(逐儲存格求值,`params` 為 EditableCallbackParams:node、data、column、colDef、api、columnApi、context);其他型態(非布林非函數,如 `1`、`'yes'`)ag-grid 視為不可編輯(`Column.isColumnFunc` 僅認布林與函數),貼上同之.
  2. 元件自寫、不經 ag-grid 編輯器而直接寫入資料列之儲存格路徑,寫入前一律經模組層 `isCellEditable(column, node, onError)`;不得另存 editable 表、不得以真值判斷、不得自行讀 `colDef.editable`.
  3. `isCellEditable` 委由 ag-grid 之 `column.isCellEditable(node)`(與 ag-grid 自身入口同一個判斷,升版時語意隨 ag-grid),回傳依真假(`!!`);**函數拋錯 → 視為不可編輯並回 false,拋錯交 `onError` 通報,不使整批寫入失敗;通報本身再拋錯(拋出之值無法轉字串)亦不外傳**(外審 terra 指出,PT18).editable 函數須無副作用(ag-grid 亦同要求).
  4. pasteText 之處置:逐儲存格判斷(`column` 為 `getAllGridColumns()` 之 Column、`node` 為 `forEachNodeAfterFilterAndSort` 之畫面列節點,故排序、表頭過濾後仍依畫面列);唯讀者略過,**欄位索引照常遞增**(起點格唯讀亦然);**判斷於寫入前全部完成**(先收集 `writes`,迴圈結束後才寫,同次貼上先寫入之儲存格不影響後面儲存格之判斷,與欄/列迴圈順序無關);**寫入落在被判斷之 `node.data`**,不以 `node.id` 索引 `vo.rows`(filterall 生效時 rowData 為過濾後之子集,`node.id` 為子集索引,與 `vo.rows` 索引不同——修前 `rows[node.id]` 會寫到畫面以外之列,使逐列唯讀亦可被繞過);函數拋錯時同一次貼上同一欄於 console 說明一次:`[w-aggrid-vue] pasteText: kpCellEditable[<key>] threw, the cell is treated as not editable: <錯誤訊息>`(R03 前綴).
  5. 布林值行為不變:`true` 全欄寫入、`false`/未給(`undefined`)整欄略過.
  6. **colId 與 field 不同之欄不貼上**(`opt.keys` 重複時 ag-grid 以 `<key>_1` 為第二欄之 colId,其讀取之 field 仍為 `<key>`;寫入以 colId 為資料鍵,會新增 `<key>_1` 屬性或覆蓋他欄):`kpColumn` 只收 `colDef.field === colId` 者,其餘 `continue`(欄位索引照常遞增).同修前之實際行為(修前以 field 建表,colId 查不到而略過);首版修正曾誤改為依該欄判斷並寫入 `<key>_1`(外審 terra 指出,PT17).
- **單一擁有者**:F 模組層 `isCellEditable`(234)(pasteText 內另有 `onEditableError` 負責通報、`kpColumn` 負責 colId 與 field 一致之篩選,皆屬 pasteText 區域變數,不另作判斷).
- **盤點**:
  - 寫入站點:`git grep -nE "applyTransaction\(|setDataValue\(|\.setData\(|setRowData\(|setGridOption\('rowData'|set\(vo, .opt\.rows.|\.data\[[^]]+\] *=|rows\[[^]]+\]\[[^]]+\] *=" -- src/components/WAggridVue.vue`(5 筆:1081 triggerRowDragChange、1837 pasteText 寫入、1842 pasteText applyTransaction、1846 pasteText set、3206 uploadData;2026-10-28 agv-run03 工作樹;出現表外之命中,或 `setDataValue`、`setData(`、`rows[..][..] =` 命中,須先補列站點並給狀態)
  - 判斷站點:`git grep -nE "isCellEditable\(|o\.editable|kpEditable\b" -- src/components/WAggridVue.vue`(命中 5 行:註解 231、定義 234、定義內 `column.isCellEditable` 236、pasteText 呼叫 1813、`o.editable` 1983;`kpEditable\b` 須為 0,即不得再有自存之 editable 表)
- **站點全集**(2026-10-28 盤點,F 行號依工作樹):

| 行 | 位置 | 是否寫入儲存格值 | 是否遵守 editable | 狀態 |
|---|---|---|---|---|
| 1983 | keys2columns 之 `o.editable = vo.kpCellEditable[key]` | 否(宣告來源) | — | 來源(ag-grid 原生入口與 isCellEditable 皆讀此) |
| 1261 | agCellChange(`cellValueChanged` 回呼) | 否(ag-grid 編輯器已寫入後之通知) | ag-grid 以 `column.isCellEditable` 擋在編輯器入口(PT14) | 範圍外(通知,非寫入) |
| 1587→1614 | agCellKeyDown(Ctrl+V)→ pasteText;宿主亦可直接呼叫 pasteText | 是 | 已套(2026-10-28):逐儲存格 `isCellEditable` | **已套**(e2e-pasteEditable PT5–PT18 與 e2e-pasteText PT1–PT4 全走真滑鼠單擊起點格 + 真鍵盤 Ctrl+V;宿主按鈕呼叫 pasteText 之路徑由 api-pasteText PA1–PA4 驗) |
| 1837 | pasteText 之 `each(writes ...)` 寫入 | 是(`node.data[col] = value`) | 同上,僅寫入已通過判斷者 | 已套 |
| 1081 | triggerRowDragChange `set(vo, 'opt.rows', rowsFull)` | 否(只改列序,值不變;寫回保留各列全部欄位,見 R23) | — | 範圍外(列序非儲存格值;ag-grid 之 rowDrag 亦不受 editable 約束) |
| 3206 | uploadData `set(vo, 'opt.rows', rows)` | 是(整表載入:replace 取代、append 附加) | 否 | 刻意不套(主控 2026-10-28 裁示維持):整表載入屬程式化資料替換,非使用者編輯路徑,語意同呼叫端設定 `opt.rows`(ag-grid 之 `rowData` 載入亦不受 editable 約束);`kpCellEditable` 只管使用者互動編輯.JSDoc(`uploadData` 說明)已載此語意 |
| — | setRowsPinnTop / setRowsPinnBottom(`genRowsPinn*` 回傳之置頂置底列) | 否(衍生列,不回寫 `opt.rows`) | — | 範圍外 |
| — | ag-grid Enterprise 之剪貼簿貼上、填滿把手、範圍選取、Delete 清除 | — | — | 範圍外:僅裝 ag-grid-community,未載入 enterprise 模組(`_enableRangeSelection` 等為底線佔位 prop,未啟用);元件亦未啟用 `undoRedoCellEditing` |
| — | 呼叫端經 `getApi()` 呼叫 `setDataValue`、`applyTransaction` 等 | 是 | 否(ag-grid api 層本身不檢查 editable) | 範圍外:呼叫端責任 |

- **測試**:`test/e2e-pasteEditable.test.mjs`(宿主頁 `test/pages/pasteEditable.html`,頁內無貼上按鈕)PT5–PT18 共 14 格;布林值由 `test/e2e-pasteText.test.mjs` 之 PT1、PT4 驗.
  - **act 全走使用者操作(agv-run02 改寫,2026-10-28)**:剪貼簿寫入(setup;headless 瀏覽器之剪貼簿與作業系統隔離)→ 真滑鼠單擊起點格(以「該格取得焦點且 `document.activeElement` 在該格內」為正向訊號)→ 多數格按 Escape 離開編輯器(`singleClickEdit` 使可編輯格單擊即開編輯器;PT15 不離開)→ 真鍵盤 `Control+V`.PT7 以真滑鼠點 d 表頭兩次排成降冪(升冪生效後才點第二次)、PT8 以 `typeIntoFloatingFilter`(Pattern A)於 d 過濾列輸入 `y`,皆不再用 grid API(首版之 setup 例外已取消).貼上完成之訊號為宿主 `opt.rows` 達預期終態(`waitUntilExist`,上限 8 秒;預期含被貼入之格,唯讀格被誤寫時永不相等,逾時以 `deepStrictEqual` 呈現差異),再等表格靜止後重驗一次,全檔無固定等待.
  - 修(修前 HEAD 紅,11 格):PT5(函數逐列唯讀)、PT7(排序後)、PT8(表頭過濾後)、PT9(函數拋錯:整批不失敗、console 一次)、PT10(參數內容、每格恰呼叫 1 次、判斷時 data 為貼上前之值)、PT11(起點格唯讀、索引續增)、PT12(非布林真值同 ag-grid)、PT13(編輯器未開之 Ctrl+V,判斷於寫入前)、PT15(單擊後編輯器開啟中直接 Ctrl+V)、PT16(filterall)、PT18(拋出無法轉字串之值)
  - 保留(修前後皆綠,3 格):PT6(函數恆回 true 仍全寫入)、PT14(真滑鼠單擊,ag-grid 自身編輯入口對 ro 列不開編輯器、非 ro 列開,為「貼上判斷與原生入口一致」之對照,不執行貼上)、PT17(keys 重複之第二欄略過;首版修正曾使之紅,守護此回歸)
  - **變異**(2026-10-28,重建 dist 跑全檔,還原並重建,src 與 dist 皆與變異前逐位元相同):六處同時變異——①寫入改回 `rows[node.id]`、②逐儲存格立即寫入(取消寫入前判斷)、③拿掉 onError 去重、④kpColumn 不篩 colId===field、⑤通報訊息建構不防轉字串失敗、⑥`isCellEditable` 內通報不防再拋——恰紅 6 格:PT16(①)、PT10 與 PT13(②;判斷時 data 已被改寫)、PT9(③;console 2 次)、PT17(④;`a_1` 被寫入)、PT18(⑤⑥);其餘 8 格綠.
  - **穩定性**:同一檔連跑 5 次,每次 14 passing(共 70 格次 0 失敗);全套 `--parallel` 下亦綠.
  - **契約符合**(agv-run02 逐項比對 role-coder-for-test-e2e):無標準圖(本套件未產製,待裁示,見 7.4/9);選擇器沿用共用層 `columnTexts` 同形之 ag-grid 屬性 `col-id`/`row-index`(結構 selector,既有慣例,未新增降級型態);未使用 `test/_tmp`、`./tmp`;無 server、無 port(file://);每格新瀏覽器.
- **來源**:2026-10-28 Gitea issue #13(建議檔 `建議w-aggrid-vue修正.md`);站點盤點與 filterall 寫入落點為本輪新增(filterall 時 `rows[node.id]` 寫錯列,以 `tmp` 探測實測確認:filterall 'xx' 顯示 r1、r2,貼 `P1\nP2` 卻寫入 r0、r1).

### R23 元件寫回 opt.rows 時保留列之全部欄位(列拖曳、貼上);只有整表載入(uploadData)依 opt.keys 提取

- **成因(2026-10-28 agv-run03;agv-run02 報告遺留,實測於第 6 節原 #18)**:列拖曳排序(kpRowDrag)後 `triggerRowDragChange` 以 `set(vo, 'opt.rows', rows)` 寫回,`rows` 為 `getNowData()` 之結果(`pickRowsByKeys` 依 `opt.keys` 提取),故不在 keys 內之欄位(如供 `kpCellEditable` 函數判斷唯讀之旗標 `ro`)寫回後消失,其後 editable 判斷改變——被拖曳過之表格,唯讀列變成可編輯(資料遺失).
- **判定:缺陷,非設計**.證據:①JSDoc(`opt.rows`、`opt.kpRowDrag`)與 README 皆未宣告只留 keys,`opt.rows` 之定義為「各列為物件,內含各欄位 keys 之值」(未禁止多餘欄位);②ag-grid 原生列拖曳(`rowDragManaged`)只重排節點,資料物件不重建,應用端之列物件完整保留;③元件另一寫回 opt.rows 之路徑(pasteText)保留全欄(R22:寫入落在 `node.data`,`set(vo, 'opt.rows', vo.rows)`);④該提取為重用 `getNowData`(供回呼之 `rows` 引數)之副作用,註解(原 F:1069)之意圖只是「讓外面數據同步新列序」;⑤回呼 `rowDragEnd/Leave/Change` 之 `row` 引數為 `node.data`(完整列),`rows` 引數卻只含 keys,同一回呼內不一致.
- **規則**:
  1. 元件寫回 `opt.rows` 之路徑,除整表載入(uploadData:取代或附加,「寫入時只保留 opt.keys 之欄」已載於 JSDoc)外,一律寫回原列物件(`node.data`),不得依 `opt.keys` 提取、不得複製成新物件.
  2. 列拖曳:`getNodeRows(api)`(F 模組層,`forEachNode` 之 `node.data`,順序同 `getNowData`)取得 `rowsFull`,於 `agRowDragEnd`/`agRowDragLeave` **呼叫端回呼之前**取得(回呼可能已銷毀表格),傳給 `triggerRowDragChange` 之第 5 參數,`set(vo, 'opt.rows', rowsFull)`.
  3. 回呼(`rowDragEnd`、`rowDragLeave`、`rowDragChange`)之 `rows` 引數維持 `getNowData()`(依 keys 提取之副本),`row` 為被拖曳之整列;行為不變,JSDoc(`opt.kpRowDrag`)已載.
  4. `indFrom === indTo`(原位放開)不寫回、不觸發 `rowDragChange`(既有行為,RD7 守護).
- **單一擁有者**:F 模組層 `getNodeRows`(220);列拖曳之寫回只在 `triggerRowDragChange`(1081).
- **盤點**:
  - 寫回站點:同 R22 之「寫入站點」指令(5 筆:1081 列拖曳〔已套,保留全欄〕、1846 pasteText〔已套,原列〕、3206 uploadData〔刻意依 keys 提取〕)
  - 提取站點:`git grep -nE "pickRowsByKeys\(" -- src/components/WAggridVue.vue`(定義 1 + 回呼與公開方法用 getDisplayData、getNowData、uploadData;**不得**有任何 `set(vo, .opt\.rows., <提取結果>)` 之列拖曳或貼上路徑)
  - 列拖曳取列:`git grep -nE "getNodeRows|rowsFull" -- src/components/WAggridVue.vue`(命中 11 行:定義 2、triggerRowDragChange 3、agRowDragEnd 3、agRowDragLeave 3)
- **站點**:列拖曳之 End 路徑(放開時游標在表格內)與 Leave 路徑(放開前已移出表格,只觸發 rowDragLeave)共用 `triggerRowDragChange`,皆已套.
- **測試**:`test/e2e-rowDrag.test.mjs`(宿主頁 `test/pages/rowDrag.html`)RD1–RD9 共 9 格,act 全為真滑鼠(按住 a 欄把手、分段移動、放開;RD5 另以真滑鼠單擊 b 欄):
  - 修(修前 HEAD 之 dist 紅,6 格):RD1(往下、表格內放開)、RD2(往下、移出表格放開)、RD3(往上、表格內)、RD4(往上、移出表格)——四格皆驗畫面列序、`opt.rows` 依新序且保留 `ro`、`note`、各列為原列物件(身分 `===`)、`getNowData` 只含 keys、回呼次數與引數;RD5(拖曳後 ro 列單擊 b 欄不開編輯器、非 ro 列開,並對照 ag-grid 之 `isCellEditable`);RD9(宿主於 `rowDragEnd` 內銷毀 ag-grid,`opt.rows` 仍依新序、保留全欄與原列物件)
  - 保留(修前後皆綠,3 格):RD6(列只含 keys 時行為不變)、RD7(原位放開不觸發 rowDragChange、`rowDragEnd` 之 indFrom=indTo=0、`opt.rows` 不變)、RD8(同一次拖曳拖到別列後拖回原位再放開,同原位放開)
  - **修前紅**(2026-10-28):以 HEAD 之 dist 跑 RD1–RD5(首版 7 格:5 紅 2 綠);擴充為 9 格後以變異 D1(寫回改回提取後之 `rows`,等同修前)重驗:RD1–RD5、RD9 紅,RD6–RD8 綠.
  - **穩定性**:擴充為 9 格後,本檔連跑 6 次(單檔 3 次、與他檔同跑 1 次、全套 `--parallel` 1 次、首次)皆 9 passing,0 失敗;擴充前 7 格版與 e2e-pasteText、api-pasteText 合跑 5 次皆 15 passing.
  - **變異**(重建 dist 跑本檔,還原後與變異前逐位元相同):D1 全部寫回改用提取後 `rows`;D2 僅 End 路徑用 `rows`;D3 僅 Leave 路徑用 `rows`;D4 回呼之後才取 `rowsFull`;D5 `getNodeRows` 改複製列(`cloneDeep`);D6 原位放開也寫回(取消 `indFrom !== indTo`).各變異被偵測之格見該輪報告.
  - 方向(下/上)× 終止路徑(End/Leave)四格全列;RD2、RD4 斷言 leave 回呼恰 1 次、end 回呼 0 次(確走 Leave 路徑),RD1、RD3 反之
- **未涵蓋**:filterall 生效時之列拖曳(第 6 節 #21,待裁示);列拖曳後置頂/置底列不重算(#23)與回呼內同步 pasteText(#22);表頭過濾(非 filterall)生效時之列拖曳(`forEachNode` 含被過濾掉之節點,資料不會缺,未實測);同一次拖曳中移出表格後又移回再放開(Leave 後 End,兩者共用 `iRowDragEnter`,未實測);缺欄之列(修前被提取補成 `''`,修後保持缺欄,見第 8 節);多於 3 列之表.
  - **有排序時**:ag-grid 於排序生效時隱藏拖曳把手(實測 `.ag-row-drag` 帶 `ag-hidden`,探測腳本 `probeEdge.mjs` s1;腳本留存於主控任務資料夾 `dnow/20261028054319/agent-out/agv-run03-evidence/scripts/`,repo 內不留),使用者無法拖曳,故不測;`forEachNode` 之順序與 `getNowData` 同(R04),拖曳可達之情況下(無排序)等於畫面列序.
  - **回呼內銷毀表格**:`rowsFull` 於呼叫端回呼之前取得,RD9 驗(宿主於 `rowDragEnd` 內 `getApi().destroy()` 後,`opt.rows` 仍依新序且保留全欄與原列物件;銷毀後 ag-grid 對已銷毀 api 印 warning 為既有限制 #16);變異 D4(回呼後才取列)令 RD9 紅.
  - **回呼引數可變性**:`rowDragEnd`、`rowDragLeave`、`rowDragChange` 收到之 `rows` 為副本(`getNowData()`),修改它**不再**影響寫回之 `opt.rows`(修前同一陣列物件隨後被寫入 `opt.rows`,宿主若曾在 `rowDragEnd` 內就地改動 `rows` 以改變最終列序,現已無效;屬未載於文件之偶然管道,JSDoc 現明載為副本);`row` 為 `node.data`(原列物件),修改它會改到 `opt.rows` 內之同一物件(修前 `opt.rows` 為提取後之新物件,改 `row` 不影響之).
- **來源**:2026-10-28 agv-run02 報告遺留項(主控排程第 155 項),agv-run03.

## 3. 下載

### R12 兩個下載方法共用 downloadCore

- **規則**:downloadData、downloadDisplayData 只負責取定欄位 keys 與來源列 rows(disp 於執行任何掛鉤前取定),其餘流程只在模組層 `downloadCore(vo, name, keys, rows, opt)`.downloadCore 不放 methods(不經 $refs 外露)、不呼叫 grid API(downloadData 可於表格就緒前呼叫);寫檔只此一處.處理順序:keys → funGetKeysHook → 依 keys 由來源列取值並格式化 → funGetLtdtHook → 轉二維並加表頭 → funGetMatHook → Excel 上限檢查(R15)→ 觸發下載 → 同步回傳二維陣列.
- **單一擁有者**:downloadCore(223).
- **盤點**:`git grep -nE 'downloadCore\(|downloadExcelFileFromData\(' -- src/components/WAggridVue.vue`(4 筆:定義 223、寫檔 409、呼叫 2807 與 2832)
- **站點**:兩個方法皆已套.
- **測試**:`test/e2e-download-matrix.test.mjs`(27 格)、`test/e2e-download-extended.test.mjs`(91 格)、`test/e2e-examples-download.test.mjs` 之 EXD1–EXD3.
- **來源**:2026-10-06 下載複審 Q7、R15、R19、R20.

### R13 下載與顯示數據之欄位與列來源

- **規則**:
  - downloadData:keys 為 vo.keys(opt.keys 順序,含隱藏欄),rows 為 vo.rows(全部列,不受表頭過濾、filterall、排序影響).
  - downloadDisplayData、getDisplayData:keys 為 `getDisplayDataKeys()`,即 `getAllDisplayedColumns()` 之 colId(畫面欄序:左固定、中間、右固定,含拖曳後之順序);rows 為 `forEachNodeAfterFilterAndSort` 之 node.data.
  - 兩者皆不含置頂、置底列.畫面欄序不得用 getColumnState(其順序不反映固定欄位置).
- **單一擁有者**:getDisplayDataKeys(2659).
- **盤點**:`git grep -nE '^[^/]*(getAllDisplayedColumns|getAllGridColumns|getColumnState|forEachNodeAfterFilterAndSort|forEachNode)\(' -- src/components/WAggridVue.vue`(8 筆)
- **站點**:

| 行 | 位置 | 狀態 |
|---|---|---|
| 2668 | getDisplayDataKeys | 已套 |
| 2688 | getDisplayData | 已套 |
| 2803 | downloadDisplayData | 已套 |
| 2711 | getNowData(forEachNode,鍵為 vo.keys) | 範圍外:取全部列,非畫面欄序 |
| 592 | HeaderSlotRenderer 數排序欄數 | 範圍外:只計數,與欄序無關 |
| 1597 起 | pasteText(列序 forEachNodeAfterFilterAndSort;欄序 getAllGridColumns,略過隱藏欄與不可編輯儲存格〔逐儲存格 isCellEditable,見 R22〕;固定欄另分區、只貼固定欄) | 已驗:一般、排序後、隱藏欄、不可編輯欄(e2e-pasteText PT1–PT4 真滑鼠單擊 + 真鍵盤 Ctrl+V;api-pasteText PA1–PA4 宿主呼叫公開方法之契約)、函數型 editable 與真鍵盤 Ctrl+V(e2e-pasteEditable PT5–PT18);**未驗**:固定欄之貼上規則 |

- **測試**:P_pinnedLeft_disp、P_pinnedLeft_raw、P_moved_disp、Q_sort_disp、Q_sort_raw、Q_filterall_disp、Q_filterall_raw、Q_pinnedRows_disp、Q_pinnedRows_raw、Q_filteredToZero_disp、H_addHidden、H_hiddenOnly、H_allHiddenAdd、D_hideViaHook、G_getDisplayData_pinned、G_getDisplayData_plain、G_keys_pinned、N_preReady_disp、N_preReady_raw、N_destroyed_raw、X3、K_displayExcludeHidden;pasteText PT1–PT4(e2e-pasteText)、PA1–PA4(api-pasteText).
- **來源**:2026-10-06 下載複審 R1、R9、R14、R24.

### R14 下載之值:提取、格式化與正規化

- **規則**:
  1. 依 useKeys 由來源列以 lodash get 取原值;useFormat 時以 `(原值, key, 完整來源列, null)` 呼叫格式化函數,回傳非 null、undefined 才採用;仍為 undefined 者為 ''.
  2. 取出之值 cloneDeep 後寫入新列物件,掛鉤改寫巢狀值不影響表格數據.
  3. funGetLtdtHook 之後另建列物件,把 useKeys 欄之 null 轉為 ''(畫面亦顯示空白);掛鉤收到的仍是原值.
  4. 表頭一律 map 為新陣列,不與 useKeys 或呼叫端之陣列同址;useHead 時取 kpHead,無對應者退回 key.
  5. 其餘值依 wsemi ltdtkeys2mat 轉換:布林為 'true'、'false',物件與陣列為 JSON 字串(NaN、Infinity、Date 見第 6 節).
- **單一擁有者**:downloadCore(320–377).
- **盤點**:`git grep -nE 'cloneDeep\(v\)|isnull\(t\[key\]\)|let heads = map|haskey\(vo\.kpHead' -- src/components/WAggridVue.vue`(4 筆:337、361、372、373)
- **站點**:皆在 downloadCore,已套.
- **測試**:V_types_raw、V_types_disp、R_nestedRaw、R_nestedDisp、R_constKeys1、R_constKeys2、R_constKeysDisp1、R_constKeysDisp2、L_keysAlias、R_retMutate、K_unknown、K_unknownHead、K_dup、K_permute_disp、K_permute_raw、D1、D1b、D1c、D7、E_displayNoRows、W_wtable_emptyHead.
- **來源**:2026-10-06 下載複審 R2、R7、R10、R11、R12.

### R15 三個下載掛鉤之回傳契約;最終二維陣列之 Excel 上限

- **規則**:皆須同步回傳.回傳 Promise 時先 `.catch(() => {})` 接手其 rejection(避免未處理之 rejection),再拋 `<掛鉤名> must return synchronously, Promise is not supported`.
  - funGetKeysHook:陣列,元素為非空字串或數字;通過後另存快照.結果為空陣列時拋 `no downloadable keys`,不還原為全部欄位.
  - funGetLtdtHook:陣列,各列為非空物件(iseobj),錯誤訊息指出列索引;回傳 [] 合法(只輸出表頭).
  - funGetMatHook:二維陣列(外層為陣列且每列為陣列),至少一列非空.其儲存格值原樣交給寫檔器,套件不偵測、不轉換(同 R07 對呼叫端函數回傳值之裁示);寫檔器之轉換與失敗見第 6 節 #1、#10.
  - 無數據列時只輸出表頭 1 列,不得改(w-table-vue 以此提供表頭範本下載).
  - **Excel 上限**:於 funGetMatHook 段之後(無掛鉤時亦然)以最終二維陣列檢查:含表頭超過 1048576 列拋 `too many rows, Excel allows at most 1048576 rows including the header row`;任一列超過 16384 欄拋 `too many columns, Excel allows at most 16384 columns, invalid row[i]`.只在此一處檢查,不另於 useKeys 階段檢查(keys 超過而 mat 掛鉤裁窄者為合法輸出).理由:hucre 寫檔時才逐格拒絕欄索引而無法回報;列數不拒絕,但產出之檔連本套件之 uploadData 都讀不回(hucre 讀檔器拒讀).
- **單一擁有者**:downloadCore 內 `checkSync` 與各掛鉤之檢查段、上限檢查段.
- **盤點**:`git grep -nE 'checkSync\(|throw newError' -- src/components/WAggridVue.vue`(13 筆:checkSync 呼叫 3、throw 10)
- **站點**:三個掛鉤與上限檢查皆已套.
- **測試**:D2、D2b、D3、D4、D5、D6、X1、X2、L_emptyObj、L_emptyIntent、L_noRowsHookPass、M_empty、M_promise、K_asyncKeys、K_badElem、K_emptyStr、K_rejected、L_rejected、M_rejected、L_mixedRows、L_singleEmpty、M_1d、M_ltdt、M_nullRow、M_emptyRows、M_oneBlankRow、W_wtable_singleCol;上限 C_keys16384、C_mat16384、C_rows1048576(上限照常產檔)、C_keys16385、C_keys16385_disp、C_mat16385、C_matRow1Wide、C_rows1048577、C_rows1048577_disp(拋錯)、C_keysWideMatTrim(不得誤擋);儲存格值 M_cellObject、M_cellStyleBad.
- **來源**:2026-10-06 下載複審 Q1、Q2、Q5、Q6、Q8、R4、R5、R6、R13;2026-10-07 三方複審(上限以最終二維陣列判定、列數上限可於瀏覽器觸發).

### R16 分頁名規則照抄 hucre

- **規則**:downloadCore 之 sheetName 有效判準須與 wsemi 寫檔器 hucre 之 `validateSheetName` 完全一致;不符時用 'data' 並提示(R01).理由:hucre 拒絕時 wsemi 以 resolve 回 { error },同步介面無從得知,只能事前檢查.
- **單一擁有者**:hucre 之 `validateSheetName`(`node_modules/hucre/dist/_validate.mjs`);F 之 `bSheetName` 為其副本.同一規則兩處手寫屬刻意(寫檔失敗無法回報),以本條之逐項比對與 `test/unit-hucre-limits.test.mjs` 維持一致.
- **盤點**:
  - 本套件:`git grep -n 'bSheetName' -- src/components/WAggridVue.vue`(2 筆:定義與判斷)
  - hucre:`grep -nE 'MAX_SHEET_NAME_LENGTH =|FORBIDDEN_SHEET_NAME_CHARS =|RESERVED_SHEET_NAME =|name\.length|startsWith|toLowerCase\(\) ===' node_modules/hucre/dist/_validate.mjs`(1.2.0 為 8 筆:常數 12、17、19,檢查 23、26、27、35、38)
- **站點**:

| 條件 | hucre 1.2.0 | F bSheetName | 狀態 |
|---|---|---|---|
| 字串原始值且非空 | typeof 為 string 且 length > 0 | `typeof sheetName === 'string' && sheetName.length > 0`(wsemi isestr 對 new String() 亦為 true,不可用) | 已套(2026-10-07) |
| 長度 | `name.length > 31` 即拒(計 UTF-16 碼元) | `sheetName.length <= 31`(不可用 lodash size,其計 Unicode 碼位) | 已套(2026-10-07) |
| 禁用字元 | `/[[\]:*?/\\]/` | 同 | 已套 |
| 首尾單引號 | startsWith、endsWith 單引號即拒 | 同 | 已套 |
| 保留名 | `toLowerCase() === 'history'` 即拒 | 同 | 已套 |
| 控制字元 | 不拒,寫成 `_xHHHH_` | 不檢查 | 範圍外:見第 6 節 #13 |

- **升版時**:wsemi 或 hucre 升版即重跑上列 hucre 盤點並逐條比對,並跑 `npx mocha test/unit-hucre-limits.test.mjs`(1.1.0 → 1.2.0 未變,2026-10-06).
- **測試**:S_sheetSlash、S_sheet32、S_sheetApos、S_sheetHistory、S_sheetEmpty、S_sheetEmoji16、S_sheetEmoji16_disp、S_sheetExtB16、S_sheetUnits32、S_sheetBoxed(皆為 'data' 並提示)、S_sheetValid、S_sheetEmoji15、S_sheetUnits31(照用、無提示);unit-hucre-limits 之分頁名 21 格.
- **來源**:2026-10-06 下載複審 R3;使用者裁示改為預設並提示;2026-10-07 三方複審(boxed String).

## 4. 上傳

### R17 uploadData 之流程順序與寫入前檢查

- **規則**(依序;任一步 reject 即不寫入表格、不觸發 rowsChange):
  1. 開窗前只做 opt 之同步處理(R01),不得 await、不得檢查元件狀態(瀏覽器之使用者啟動會逾時而不開窗).
  2. 選檔:取消 → `no file`(未呼叫 beforeUpload);wsemi reject(如檔案過大)→ `can not read file`.
  3. 讀檔:非 xlsx → `can not read excel`;分頁索引 ≥ 分頁數 → `can not get data from sheet`(err 為說明字串).
  4. 套用 kpConvertKeysWhenUploadData 之鍵轉換.
  5. beforeUpload:一律 `await`(同步陣列、Promise、thenable 皆可);回 undefined、非陣列、含非物件之列(`!isobj`,允許 {})→ `invalid beforeUpload return`(undefined 時 err 提示 missing return?,列錯誤指出索引).
  6. 寫入前檢查,須在 beforeUpload 之後(w-table-vue 之包裝於無有效數據時先 reject 其哨兵)、投影之前(投影後各列皆有 keys 之鍵,無從判斷原列有無值):0 列 → `no data`;無任一列有任一 keys 之值(`!isundefined(get(row, key))`,與 pickRowsByKeys 取值一致)→ `no matching keys`;全部列於 keys 之值皆為 ''、null、undefined → `no data`(0 與 false 為有值;個別空白列照寫).
  7. pickRowsByKeys(R04)→ replace 或 append(append 重建既有列物件)→ `set(vo, 'opt.rows', rows)` → resolve 該陣列(即 opt.rows).
  8. 不需表格(R19 刻意不套):元件銷毀後呼叫仍開窗、resolve 並寫入呼叫端之 opt.rows(與 downloadData 一致);開窗前不得加入表格狀態之檢查(違反第 1 步).
- **單一擁有者**:uploadData.
- **盤點**:`git grep -nE '^[^/]*(await |Promise\.reject\(|pickRowsByKeys\(rows|set\(vo, .opt\.rows)' -- src/components/WAggridVue.vue`,取 uploadData 範圍內之 16 筆核對順序:第一個 await 為選檔;11 個 reject 皆在 pickRowsByKeys 之前;寫入在最後.範圍外之命中(其他方法之 await、pasteText 之寫入)不屬本條.
- **站點**:uploadData,已套.
- **測試**:`test/e2e-upload-matrix.test.mjs`(上傳 62 格,含取消選檔 C_cancel)、`test/e2e-examples-upload.test.mjs`(官方範例 8 情境)、E17(銷毀後上傳).
- **來源**:2026-10-06 上傳複審 Q1–Q4、Q8、R1–R4、R9–R11、R17、R18.

## 5. 範例與文件

### R18 範例即對外文件

- **規則**:對外文件為範例 `src/App<名稱>.vue`,建置為 `docs/examples/ex-<名稱>.html` 與 `test-html/ex-<名稱>.html`;README 不改(使用者指示).命名為 API 名之 camelCase(方法如 AppDownloadData、選項如 AppKpCellFormat),slot 範例以 Slot 為前綴(AppSlotCellRender),變體加後綴(AppShowKeysApplyOrder、AppUploadDataWithConvertKeys、AppSlotCellRenderAlign).新增或改名範例時,App.vue 之選單、v-if、import、components 四處一致.重產順序依 script.txt:gDistApp → gExtractHtml → gDocExams(gDistApp 會清空 docs/examples).
- **盤點**(兩者須相等):
  - `git ls-files 'src/App*.vue' | grep -vc '^src/App.vue$'`(77)
  - `git ls-files docs/examples | grep -c '^docs/examples/ex-.*\.html$'`(77)
  - test-html 已列於 .gitignore(入版控者只有舊有之 42 個),本機由 gExtractHtml 產生,不作為盤點與測試之依據.
- **站點**:77 個範例,已套.
- **測試**:`test/e2e-examples-display.test.mjs`(SL1–SL4、APP-*、SKX1、SKX2、EXF1、AL-*)、`test/e2e-examples-download.test.mjs`(EXD1–EXD3)、`test/e2e-examples-upload.test.mjs`(EXU-E1–E5、EXU-K1–K3);範例頁之 CDN 資源一律路由至本機(第 7 節映射).APP- 之格載入 gDistApp 之產物 app.umd.js,驗選單與標題,不驗本次 dist.
- **來源**:2026-09-04 提交 626fbda(範例正名).

## 6. 已知限制(套件不處理,由呼叫端或上游負責)

| # | 限制 | 證據 | 歸屬 |
|---|---|---|---|
| 1 | 寫檔失敗無法回報:wsemi downloadExcelFileFromData 以 resolve 回 { error }(hucre 拒絕)或 reject(觸發下載時之例外),下載方法已同步回傳;本套件以 `[w-aggrid-vue] <方法名>: can not write excel file` 記錄於 console.事前可擋者(分頁名 R16、Excel 上限 R15)已同步處理,已知仍可到達者只有 mat 掛鉤之儲存格物件(#10) | wsemi 原始碼;M_cellStyleBad | wsemi |
| 2 | 下載之 Infinity 為空白、NaN 為 'null'、Date 為含引號之 JSON 字串(如 `"2026-01-02T00:00:00.000Z"`) | V_types_raw、V_types_disp | wsemi ltdtkeys2mat、hucre;要可讀格式請用 kpCellFormat |
| 3 | 上傳讀回之值一律為字串;日期儲存格為 'YYYY-MM-DDTHH:mm:ss.SSS'(wsemi 1.9.10 起,1.9.9 為 '') | R_dateCell | wsemi |
| 4 | 下載後再上傳:格式化後之字串不可逆;以 useHead 下載之表頭須設 kpConvertKeysWhenUploadData 反向對照 | downloadData 之 JSDoc | 呼叫端 |
| 5 | 置頂、置底列不輸出(與 ag-grid 匯出不同) | Q_pinnedRows_disp、Q_pinnedRows_raw | 刻意 |
| 6 | 同一 tick 內改 opt 後立即下載會取得舊數據,須待 $nextTick | downloadData 之 JSDoc | 呼叫端 |
| 7 | uploadData 須於使用者操作之事件處理函數內呼叫,否則不開窗、Promise 不結束;並發呼叫依完成先後寫入;parseSheetInd 依活頁簿順序且含隱藏分頁;reject 不回復 beforeUpload 自身對外之改動 | uploadData 之 JSDoc;2026-10-06 複審實測 | 呼叫端 |
| 8 | cell-tooltip、head-tooltip slot 取掛載時之靜態 HTML 快照,不支援事件、子組件狀態與響應式更新 | prop opt 之 JSDoc(@vue-slot) | 設計限制 |
| 9 | slot 內固定高控制項之垂直置中由呼叫端以 flex wrapper 處理(ag-grid 31 無垂直對齊選項;儲存格為 inline-block) | 範例 slotCellRenderAlign;2026-09-16 終審 | 呼叫端 |
| 10 | mat 掛鉤之儲存格值原樣交給寫檔器:物件、陣列、函數、Symbol、BigInt、NaN、Infinity、undefined 寫成空白格;帶 value 鍵之物件被當成儲存格設定(寫入 value;帶 formula 者寫成公式,讀回為空白;style、richText 等格式不符時寫檔失敗,只有 #1 之記錄);Invalid Date 寫成 'NaN';useHead 時 kpHead 之值亦原樣寫入表頭 | unit-hucre-limits 之儲存格值 18 格;M_cellObject、M_cellStyleBad;hucre `_inline-cells.mjs`、`xlsx/worksheet-writer.mjs` 之 serializeCell | 呼叫端(R15:回傳值原樣使用) |
| 11 | 表格建立時沒有數據列(rows 為 [])且未設 cellDataType 時,setHeadFilter、clearHeadFilter 之 Promise 要到首批數據列載入後才結束,並於那時套用過濾與發出事件;clearHeadFilterAll、getFilters 照常結束 | ag-grid `setColumnFilterModel` 於型別推斷期間排隊(main.esm.mjs 之 isPendingInference);FL14 | ag-grid;呼叫端宜先載入數據再 await 過濾 |
| 12 | '#N/A'、'#DIV/0!' 等 Excel 錯誤值字串寫成錯誤型儲存格(Excel 顯示為錯誤值;讀回仍為原字串),同 Excel 自身之輸入行為 | hucre `worksheet-writer.mjs` 之 EXCEL_ERRORS;unit-hucre-limits | hucre |
| 13 | 分頁名之控制字元不被拒絕,寫成 `_xHHHH_`,讀回為該字面(名稱被改) | 2026-10-07 複審實測 | hucre |
| 14 | opt.keys 有重複時,ag-grid 以 `<key>_1` 為第二欄之 colId;getFilters 依 opt.keys 取模型,第二欄之過濾不列入 flts,第一欄之模型重複列入 | 2026-10-07 複審實測(改寫前後相同) | 呼叫端(keys 應唯一) |
| 15 | kpHeadFilterType 之 'set' 須 enterprise 版;community 版由 ag-grid 印警告後退回依資料型別之預設過濾器 | ag-grid;2026-10-07 複審實測 | ag-grid |
| 16 | getApi 為存取器:元件銷毀後回 null;呼叫端經 getApi 銷毀 ag-grid 後回傳已銷毀之 api(isDestroyed 為 true,其方法只印警告) | R19;X12 | 呼叫端 |
| 17 | 元件或 ag-grid 銷毀後,uploadData 仍開窗並寫入呼叫端之 opt.rows;downloadData 仍產檔 | R17 第 8 步;E15、E17、X14 | 刻意(不需表格) |
| 18 | (已修正,2026-10-28 agv-run03,見 R23;原載:列拖曳排序後 `opt.rows` 只保留 `opt.keys` 之欄位,不在 keys 內之欄位如供 editable 函數判斷之旗標 `ro` 隨之消失)——判定為缺陷(資料遺失),改為寫回保留全欄之原列物件 | 修前實測(探測:拖曳後 `{a,b,c,ro,note}` 變 `{a,b,c}`);e2e-rowDrag RD1–RD5 修前紅、修後綠 | 已解除,不再歸呼叫端 |
| 19 | 貼上時自編輯器開啟中之儲存格按 Ctrl+V:ag-grid 編輯器先提交瀏覽器原生貼入之文字,再由 pasteText 判斷與覆寫,故 editable 函數看到的是提交後之資料(實測:e9 之 b 於 a0 唯讀,單擊 a0 後 Ctrl+V `X\t2` 得 `X|2|c0`;Escape 離開編輯器後再貼得 `X|b0|c0`) | 2026-10-28 實測(PT13 驗編輯器未開之路徑,PT15 為編輯器開啟之路徑) | ag-grid 編輯器 + 元件鍵盤路徑;JSDoc 已載;主控 2026-10-28 裁示維持現行 |
| 20 | 貼上之既有邊界(外審 terra 2026-10-28 讀碼指出,本輪未實測、未改):①自置頂/置底列之儲存格按 Ctrl+V,keydown 之 `rowIndex` 為釘選列索引,pasteText 以之當主列畫面索引,貼入同索引之普通列;②左右固定欄同時存在時,固定欄分區以單一旗標處理,從某固定欄貼多欄可能跳到另一側固定欄;③未傳起點欄且畫面首欄為隱藏或固定欄時,預設起點在隱藏/固定判斷之後才指定,整批不貼;④field 含點(巢狀路徑)時 ag-grid 讀巢狀值而貼上寫入字面鍵;⑤貼上資料不等長時,短列缺欄寫成 undefined,首列較短時後續列多餘欄被截;⑥`rows` 內多列為同一物件時 transaction 重複命中第一個節點;⑦kpColSpan 逐列跨欄時,被跨度蓋住之欄(畫面無該列之儲存格)仍會被寫入(未實測) | 外審 terra;①②③⑤為讀碼確認 | 既有行為,與 editable 無涉(①之判斷對象與寫入對象同為普通列,無回歸) |
| 21 | filterall 生效時列拖曳,`opt.rows` 被寫成顯示中之子集(被 filterall 隱藏之列從 `opt.rows` 消失):`rowData` 為過濾後之子集,`triggerRowDragChange` 寫回的是子集之新列序(修前修後相同,與欄位保留無涉) | 2026-10-28 agv-run03 實測(探測腳本 `probeDrag2.mjs`/`probeFilterall.html`,留存於 `dnow/20261028054319/agent-out/agv-run03-evidence/scripts/`:4 列、filterall 顯示 2 列,拖曳後 `opt.rows` 剩 2 列);R23 | **待裁示**(範圍外未修):修法須定隱藏列之放置規則(例如維持在原相對位置),屬行為決定 |
| 22 | 在 `rowDragChange` 回呼內**同步**呼叫 `pasteText`:`opt.rows` 已寫成新列序,但 `vo.rows` 要待 Vue 下一次更新才同步(`changeOpt` 之 `vo.rows = vo.opt.rows`),pasteText 取到舊 `vo.rows` 並以之 `set(vo, 'opt.rows', rows)`,把拖曳後之列序覆寫回舊序(畫面為新序,宿主 `opt.rows` 為舊序;貼入之值仍落在畫面被判斷之列) | 2026-10-28 agv-run03 實測(探測腳本 `probeEdge.mjs` s2,留存處同 #21:拖曳後 `getNowData` 為 a1、a2、a0,宿主 `opt.rows` 為 a0、a1、a2);外審 terra 讀碼提出;修前修後相同 | 呼叫端:回呼內改於下一個 tick(`$nextTick`)再呼叫 pasteText;範圍外未修 |
| 23 | 置頂/置底列(`genRowsPinnTop`、`genRowsPinnBottom`)只於表格就緒(`agReady`:F:1318、1321)與儲存格值變更(`agCellChange`:置底,F:1283)時重算,列拖曳後不重算;產生器若依列序取值(如取第一列),拖曳後置頂/置底列過時(依總和等與列序無關者不受影響) | 讀碼確認(外審 terra 提出;未實測);修前修後相同 | 呼叫端或待裁示;範圍外未修 |

## 7. 測試帳本

### 7.1 執行

- `npm test`(package.json 既有之 `mocha --parallel "test/*.test.mjs" --timeout 180000`,不改).單檔 `npx mocha test/<檔>.test.mjs --reporter spec --timeout 180000`,單格另加 `--grep "<代號>"`.
- 測試對象為本地 `dist/w-aggrid-vue.umd.js`(宿主頁以 file:// 載入 `../../dist/` 與 `../../node_modules/vue/dist/vue.min.js`;範例頁之 CDN 改路由至本機):**改 src 後須先 `node toolg/gDistRollupComps.mjs`**.
- 新增之格須先在修正前之 dist 跑一次:「修」之格紅、「保留」之格綠,才證明測得到缺陷(2026-10-07 之 74 格紅、153 格綠即如此驗過;其後補之 PB1 以 HEAD 之 dist 驗紅).
- CI(`.github/workflows/ci-test.yml`,ubuntu-latest,push 時 `npm install`、`npm test`)執行同一組測試;e2e 於 Linux 尚未實測(瀏覽器由 w-package-tools-e2e 於缺少時自動安裝;CJK 字型差異可能影響幾何量測之格,如 AL-*、S 系列),同組織之 w-component-vue、w-web-sso 亦於 CI 跑 e2e.

### 7.2 測試檔

| 檔 | 層 | 格數 | 宿主頁(test/pages)或對象 | 規則 |
|---|---|---|---|---|
| unit-hucre-limits | unit | 42 | wsemi 之寫檔與讀檔路徑(node) | R15、R16;第 6 節 #10、#12 |
| e2e-download-matrix | e2e | 27 | download-matrix.html | R02、R12–R15 |
| e2e-download-extended | e2e | 91 | download-extended.html | R01、R02、R04、R12–R16 |
| e2e-upload-matrix | e2e | 62 | upload-matrix.html | R01、R02、R04、R17 |
| e2e-kpCellFormat | e2e | 11 | kpCellFormat.html | R06、R07 |
| e2e-display-objcell | e2e | 1(16 格) | objcell.html | R06 |
| e2e-display-slots | e2e | 8 | slots.html | R06、R08、R10 |
| e2e-focus | e2e | 4 | focus.html | R09 |
| e2e-headerscroll | e2e | 31 | headerscroll.html | R21 |
| e2e-showKeys | e2e | 27 | showKeys.html | R01、R02、R11 |
| e2e-filters | e2e | 26 | filters.html | R19、R20 |
| e2e-lifecycle | e2e | 51 | lifecycle.html | R03、R04、R17、R19 |
| e2e-pasteText | e2e | 4 | pasteText.html(真滑鼠單擊 + 真鍵盤 Ctrl+V,頁內無貼上按鈕) | R13 |
| api-pasteText | api | 4 | pasteTextApi.html(宿主按鈕呼叫公開方法 pasteText) | R13 |
| e2e-pasteEditable | e2e | 14 | pasteEditable.html | R22 |
| e2e-rowDrag | e2e | 9 | rowDrag.html(真滑鼠拖曳列) | R23 |
| e2e-examples-display | e2e | 21 | docs/examples 之 slot、showKeys、對齊、filterChange 範例與 app.html | R06–R08、R11、R18、R20 |
| e2e-examples-download | e2e | 3 | docs/examples 之 ex-downloadData、ex-downloadDisplayData、ex-getDisplayData | R12、R13、R18 |
| e2e-examples-upload | e2e | 8 | docs/examples 之 ex-uploadData、ex-uploadDataWithConvertKeys | R17、R18 |

合計 444 格(2026-10-28 agv-run03 全套實測 444 passing).格之代號為 `it()` 標題開頭(以代號 Grep 即得輸入與應然);同一代號只出現在一個檔.

### 7.3 舊 tmp 驗收腳本之遷移(2026-10-06~07)

| 舊腳本(已不再使用) | 遷入 | 差異 |
|---|---|---|
| zz_dl、zz_dl_check(27) | e2e-download-matrix | 每格新瀏覽器;代號不變 |
| zz_dl2、zz_dl2_check(72) | e2e-download-extended | 同上;另加 19 格(分頁名之 UTF-16 長度與 boxed String、Excel 上限、mat 掛鉤之儲存格物件) |
| zz_ul、zz_ul_check(62)、zz_upload_cancel(6) | e2e-upload-matrix | 取消選檔併入 C_cancel(含隱藏 input 已移除) |
| zz_fmt(11) | e2e-kpCellFormat | 代號改為 F1–F11 |
| zz_objcell(16) | e2e-display-objcell 之 OC1 | |
| zz_sym(6) | e2e-display-slots 之 S1–S6 | 另加 S7、S8;已移除鍵改驗 4 個 |
| zz_focus(8,帶 --expect-fixed) | e2e-focus 之 FO1–FO4 | 以注入規則重驗之 4 格未遷移(驗 CSS 規則本身,結果與 FO2–FO4 相同) |
| zz_showkeys(32) | e2e-showKeys(元件 27 格)與 e2e-examples-display(範例) | |
| zz_accept(9) | e2e-examples-display 之 SL1–SL4、APP-* | 改讀 docs/examples(test-html 已 gitignore) |
| zz_ex(3) | e2e-examples-download 之 EXD1–EXD3 | 改為比對範例之應有輸出,不再與舊版 dist 逐字比對 |
| zz_ul_ex(8) | e2e-examples-upload 之 EXU-E1–E5、EXU-K1–K3 | 同上 |
| zz_rb、zz_rb_mount、zz_rb_hucre | e2e-filters、e2e-lifecycle、e2e-showKeys、e2e-download-extended、unit-hucre-limits | 2026-10-07 修正之全部格 |

### 7.4 未測、靜態審查與已知缺口

- **靜態審查(以盤點指令核對,無動態測試)**:R05(JSDoc 單一擁有者)、R06 與 R12 之單一擁有者、R08 之監聽成對移除、R19 與 R20 之站點全集.
- **未驗**:R13 pasteText 之固定欄貼上規則(鍵盤 Ctrl+V 路徑已由 e2e-pasteText、e2e-pasteEditable 驗,2026-10-28);R23 之 filterall 時列拖曳(#21)、置頂置底列、回呼內銷毀表格;R20 第 3 項「取得過濾狀態後、發事件前之銷毀」(時序無法由 UI 決定,以程式碼核對);R03 之 fitColumns、triggerFilterChange 兩個 catch(表格可用時不拋錯,無法以操作觸發);1048576 列之檔讀回(只驗產檔,讀回需數十秒).
- **標準圖(pixel 補強層)**:本套件未產製,渲染類之格(OC1、S 系列、FO 系列、AL-*)以 computed style 與幾何斷言;是否加標準圖待使用者裁示(第 9 節).

### 7.5 e2e 落地映射(對應全域技能 role-coder-for-test-e2e §3 契約)

#### 服務與 port

| 項目 | 值 |
|---|---|
| 後端、前端、seed | 無:宿主頁與範例頁皆以 file:// 開啟,不起伺服器、不用 port、無資料庫 |
| e2e 執行 | 見 7.1 |
| 共用實作 | `test/tools/e2eLib.mjs` 單一橋接 → `w-package-tools-e2e/src/`(1.0.6,devDependency 經 w-package-tools 帶入);`test/tools/e2e-setup.mjs` 只留組態與專案專屬原語 |

#### 契約映射

| 契約 | 本專案實名 / 模式 | 偏離與依據 |
|---|---|---|
| C1 launch wrapper | `openPage` 內 `launchBrowser()`(六旗標;Playwright 管理之 headless shell,revision 1243);下載類測試另給 `downloadsPath` 為該檔之 `test/_tmp/<檔名>/` | Playwright 之瀏覽器 profile 仍在系統暫存區(TEMP 之導向須改 npm script,依全域規範不改) |
| C2 server lifecycle | 不適用 | 無伺服器(file://) |
| C3 換設定重啟 | 不適用 | 無後端設定 |
| C4 DB 重置 | 不適用;每格新瀏覽器與新頁面即為初始狀態 | 無資料庫 |
| C5 進站與語系 | 不適用 | 無登入、無 i18n |
| C6 截圖、C7 紅框、C9 比對、C13 regen | 未使用 | 標準圖未產製(7.4,待裁示) |
| C8 遮罩 | 不適用 | 無不可固定之值 |
| C10 輸入 | `typeIntoFloatingFilter(page, gridSel, n, text)`:點擊 → Control+A → Backspace → `keyboard.type`(Pattern A);宿主頁搜尋框為 click 後 `keyboard.type` | |
| C11 偵測等待 | `waitUntilExist`(頁內條件)、`pollUntil`(下載事件數);事件數之斷言於達到筆數後再觀察一段靜止窗確認未多發 | |
| C12 settle 訊號 | `waitGridIdle`(開頁、前置狀態之後);自帶計時器之範例以 `openPage(..., { idle: false })` 只等首批儲存格 | |
| C14 端點 | 不適用 | file:// |

#### 專案特有機制

- **宿主頁協定**:`window.__cases`(案例 → 目標、方法、參數)、`window.__case`(setup 選定案例)、`#btnRun`(真點擊,其處理函數呼叫元件方法,同官方範例「按鈕呼叫元件方法」之用法)、`window.__out`(結果);共用層 `runHostCase(ctx, name, opt)`.此協定驗的是公開方法之程式契約,屬 `api-` 層(api-pasteText 與下載、上傳、lifecycle 各檔之方法呼叫案例);**驗使用者操作行為之 e2e 檔不得以此協定代替使用者動作**(pasteText 即因此拆為 e2e-pasteText 與 api-pasteText,2026-10-28 agv-run03).其他宿主按鈕:`#btnUpload`(上傳)、`#btnReloadKeys6`、`#btnLoad10`、`#btnReplaceOpt4`(宿主重新設定或載入數據).
- **範例頁之外部資源**:`openPage(..., { routeExternalResources: true })` 攔截全部 http(s):vue、w-jsonview-tree → node_modules;w-aggrid-vue → 本地 dist;w-demores 之 dataEasy、dataLikeNumber → `test/fixtures/w-demores/`(取自 w-demores 1.0.34);dataEduagency → 空陣列;@babel/polyfill(nomodule、非宣告之相依)→ 空腳本;其餘中止並記錄,測試端斷言未對照者為 0.
- **app.html** 載入 gDistApp 之產物 app.umd.js(內含建置當時之元件),APP- 之格只驗範例建置產物之選單與標題;要驗本次修改須依 script.txt 重產(gDistApp 會清空 docs/examples).
- **中介檔**:上傳用 xlsx 以 wsemi 產於 `test/_tmp/<檔名>/`、下載檔存檔讀回即刪;該檔 after 刪除目錄(`useTmpDir`).不得用 `./tmp/`.
- **下載判定**:`assertDownloadCase`(throw、noFile、檔案內容、回傳值與檔案相同、分頁名、檔名、console 提示、未處理之 rejection);百萬列之檔以 `runHostCase(..., { readFile: false })` 只核對已產檔與列數.

#### 偏離與 setup 例外

- **取消選檔**(C_cancel):Playwright 無法操作作業系統選檔視窗之取消鈕,改對 input 派發瀏覽器於取消時所派發之 `cancel` 事件(L5).
- **前置狀態以 grid API 建立(setup 例外,模擬使用者先前之操作)**:download-extended 之移欄、排序、表頭過濾;showKeys 之拖曳、調寬、排序;filters 之隱藏欄過濾(FL6)、複合過濾(FL12)、先後過濾兩欄(FL13);lifecycle 之過濾為空白(C10);api-pasteText 之排序(PA2,程式契約層,以 grid API 排序屬 setup);e2e-pasteEditable 與 e2e-pasteText 全檔之系統剪貼簿(headless 瀏覽器之剪貼簿與作業系統隔離,授權 clipboard-read/write 後以頁面剪貼簿 API 寫入;實測不改動作業系統剪貼簿;排序與過濾已改為真滑鼠點表頭、真鍵盤於過濾列輸入,不再用 grid API);lifecycle 之元件或 ag-grid 銷毀(宿主切換功能區、呼叫端經 getApi 銷毀).
- **pasteText**(2026-10-28 agv-run03 解除原偏離):使用者貼上行為 e2e-pasteText(PT1–PT4)與 e2e-pasteEditable 全部走真滑鼠單擊起點格 + 真鍵盤 Ctrl+V(L1;單擊起點格取得焦點後 `keyboard.press('Control+V')`,實測第一次 Ctrl+V 即貼上,未見「keydown 先於 paste 事件而取到舊文字」之現象);公開方法 pasteText 之程式契約(位置參數:畫面列索引、欄 key)正名為 api-pasteText(PA1–PA4),以宿主按鈕呼叫元件方法(L3 點宿主按鈕,同官方範例 ex-pasteText 之用法),不掛 `e2e-` 前綴.鍵盤路徑與程式契約的偵測分工已以變異驗證:令 Ctrl+V 觸發條件失效 → PT1–PT4 紅而 PA1–PA4 綠;令隱藏欄不略過、唯讀欄照寫、忽略畫面排序 → 各令對應之 PT 與 PA 皆紅.貼上相關共用 helper(`cell`、`waitCellFocused`、`focusCell`、`pasteByKeyboard`、`hostRows`、`nowRows`、`waitRows`)在 `test/tools/e2e-setup.mjs`,e2e-pasteEditable、e2e-pasteText、e2e-rowDrag 共用,宿主頁須提供 `window.__vm.opt[表格 id]` 與 `window.__vm.$refs[表格 id]`.
- **api- 層之落地**:本套件為元件庫,ag-grid 需真瀏覽器之 DOM,故 `api-` 測試仍於 Playwright 頁面內執行(不經使用者動作、以程式呼叫公開方法);launch 等契約同 e2e 檔.
- **e2e-rowDrag**(2026-10-28):列拖曳全為真滑鼠(L2:`mouse.move/down/up`,按住 a 欄把手 `.ag-row-drag`、先移開 8px 才算開始拖曳、分段移到目標列、需要時續移出表格);頁內標記沿用 `window.__rd`(宿主回呼記錄)、`window.__vm.opt`;拖曳完成之訊號為 `rowDragChange` 回呼已觸發(寫回 `opt.rows` 之同一時點),再等表格靜止;「原位放開」(RD7)以 `rowDragEnd` 觸發後 500ms 觀察窗確認未多發 `rowDragChange`(負向斷言).
- **headerscroll**(R21):宿主頁以查詢字串切換標頭範本、釘選、寬度、欄數、列數(`head=default|slot|focusable&pin=1&w=&cw=&n=&rows=`);頁首以 `EventTarget.prototype.addEventListener/removeEventListener` 包裝記錄 `.ag-header-viewport` 上 scroll 監聽之註冊與移除(HS17 驗成對).HS9(`focus()`)、HS10、HS18(`scrollIntoView()`)之 act 為呼叫端程式觸發(L5),因其模擬的是呼叫端程式或瀏覽器自身之捲入可見,不是使用者操作;其餘 act 為 L2 真滑鼠(`mouse.click`、`mouse.wheel`)、L1 真鍵盤、L3 `locator.click`(HS1–HS8、HS11 之主觸發,即 issue #9 之重現路徑).`locator.click` 會先把目標捲入可見,故「真滑鼠點擊」格(HS12)改以座標點擊露出之部分,對照組(HS13)先以滾輪捲到完整可見.一致性判準 `alignedProblem`:標頭與資料區 scrollLeft 差 <1px、已渲染各欄標頭格與第 0 列儲存格左緣差 ≤0.5px(至少 3 欄含目標欄);補償於下一個畫面幀後才生效,以偵測等待(`pollUntil`,上限 3 秒)判定;「不得捲動」之負向斷言以 400ms 觀察窗.

#### 已知缺口

- 標準圖未產製(C6、C7、C9、C13),待裁示.
- Playwright 之 profile 仍落於系統暫存區(C1 之偏離).
- e2e 於 Linux(CI)未實測.

## 8. 破壞性與可見行為變更紀錄

npm 最新為 2.1.5(2026-10-06 查).版本欄為該提交時 package.json 之值.

| 時點 | 變更 | 類別 | 相關規則 |
|---|---|---|---|
| 2.0.56 | 移除 opt.kpCellRender、kpCellTooltip、kpHeadRender、kpHeadTooltip,改用 scoped slot | 破壞性 | R10 |
| 626fbda(2026-09-04,2.0.79) | 範例 ex-kpCellRender 等 4 頁改名為 ex-slotCellRender 等,舊網址失效 | 破壞性(文件網址) | R18 |
| d5a8d81(2026-09-04,2.0.80) | 預設 renderer 對物件、陣列顯示 JSON 字串(原拋 appendChild 例外,整表停止渲染);head slot 補齊選單常駐、filter 圖示、排序序號;已移除鍵改為警告 | 修正 | R06、R08、R10 |
| 58b2d36(2026-09-04,2.0.81) | HeaderSlotRenderer 銷毀時移除監聽 | 修正 | R08 |
| 9ce2e47(2026-09-05,2.0.83) | 新增 opt.kpCellFormat;slot props 增加 valueFormatted | 新增 | R06、R07 |
| d91f842(2026-09-16,2.0.87) | no-border 欄之子控制項取得焦點時不再顯示焦點框 | 修正 | R09 |
| 673d2b3(2026-09-16,2.0.88) | showKeys 新增 opt.applyOrder(預設 true,行為不變);改為只傳最小欄位狀態 | 新增、修正 | R11 |
| 940696a(2026-09-24,2.1.4) | uploadData 取消選檔改為 reject { msg: 'no file' }(原拋 TypeError) | 修正 | R17 |
| ef9df5a(2026-10-06,未發布) | 下載:表頭與數據同源(原過濾下載會錯位);disp 欄序依畫面含固定欄,getDisplayDataKeys、getDisplayData 隨之改變;keys 掛鉤回 [] 或非陣列由還原全部欄位改為拋錯;無可下載欄位、掛鉤回 Promise 或形狀不符改為同步拋錯且不產檔(原只出表頭、產空白檔或不產檔而無訊號);null 由字串 'null' 改為空白;掛鉤加回之隱藏欄有值;格式化函數之 row 改為完整來源列;取出值深複製;useHead 無對應之鍵退回 key;fileName 無副檔名補 .xlsx;銷毀後 disp 拋 grid is not available(原為 TypeError);移除未載於文件之 methods.formatDataByKpCellFormat | 破壞性 | R02、R12–R16 |
| 工作樹(未提交,2026-10-06) | 上傳:beforeUpload 回傳不合約定、無可寫入之列、欄名全不吻合、全部空白,由清空表格或寫入空白列並 resolve 改為 reject 且不寫入;thenable 可用;選檔失敗包成 { msg: 'can not read file' };分頁不存在之 err 改為說明字串(原為 TypeError);新 err 加前綴 | 破壞性 | R02、R17 |
| 工作樹(未提交,2026-10-06) | 選項無效改為預設並於 console 提示:下載之掛鉤非函數、sheetName 不合法原為拋錯(ef9df5a);上傳之 opt 為 null 原 reject TypeError、opt 為字串原靜默取代;uploadMode、parseSheetInd、beforeUpload 無效原為靜默退回 | 可見行為 | R01 |
| 工作樹(未提交,2026-10-06) | 相依 wsemi 升為 ^1.9.10(hucre 1.2.0):上傳之日期儲存格讀為 'YYYY-MM-DDTHH:mm:ss.SSS'(1.9.9 為 '') | 可見行為(相依) | 第 6 節 #3 |
| 工作樹(未提交,2026-10-07) | 過濾:有關閉過濾之欄(kpHeadFilter、defHeadFilter)之表,getFilters 由永不結束改為結束,opt.filterChange 由完全不觸發改為於掛載、filterall 與表頭過濾變更時觸發(w-table-vue 之「下載過濾後數據」鈕因此可出現);clearHeadFilterAll 於有生效過濾時由觸發 2 次改為 1 次;opt 換成 keys 內容相同之新陣列時不再多發 1 次 from filterall 之事件;掛載之事件改於 gridReady 之前發出(回呼內可取得數據);flts 為觸發後下一個更新週期之狀態、依觸發順序發出 | 破壞性、可見行為 | R20 |
| 工作樹(未提交,2026-10-07) | 表格不可用(元件銷毀後,或呼叫端經 getApi 銷毀 ag-grid):showKeys、getDisplayDataKeys、getDisplayData、getNowData、pasteText 由原生 TypeError 或空結果改為拋 `grid is not available`;setHeadFilter、clearHeadFilter、clearHeadFilterAll、getFilters 由 reject TypeError、靜默或回 [] 改為 reject 同訊息(await 期間銷毀亦然);downloadDisplayData 於 ag-grid 已銷毀時由 `no downloadable keys` 改為 `grid is not available`;refresh、fitColumns、固定列不再印 TypeError 或 ag-grid 警告;銷毀後不再發 filterChange | 破壞性、可見行為 | R19 |
| 工作樹(未提交,2026-10-07) | showKeys:keys 非陣列或含非字串、空字串之元素時拋錯且不改欄位(原為全部隱藏、略過或 ag-grid 原生 TypeError);opt、applyOrder 無效時於 console 提示 | 破壞性、可見行為 | R01、R02、R11 |
| 工作樹(未提交,2026-10-07) | getDisplayData、getNowData 對恰 1 列 {}(含過濾後恰剩 1 列)由 [] 改為 1 列空白列;opt.rowDragEnd、rowDragLeave 收到之 rows 隨之改變 | 可見行為 | R04 |
| 工作樹(未提交,2026-10-07) | 下載:分頁名改以 UTF-16 碼元計長度並須為字串原始值(16 個表情符號、new String() 由不產檔而無訊號改為 'data' 並提示);最終二維陣列含表頭超過 1048576 列或任一列超過 16384 欄改為同步拋錯(原為產出讀不回之檔,或不產檔而無訊號);寫檔失敗改以 `can not write excel file` 前綴記錄 | 破壞性、可見行為 | R03、R15、R16 |
| 工作樹(未提交,2026-10-07) | 元件 prop opt:有給予而非非空物件時提示表格不更新(原靜默);opt.keys、opt.rows 無效之訊息改為 `[w-aggrid-vue] opt.keys is invalid, ...`(原 'invalid opt.keys') | 可見行為 | R01、R03 |
| 工作樹(未提交,2026-10-20) | 標頭容器被程式或瀏覽器單獨捲動(Playwright locator.click 點只露出一部分之欄名、呼叫端對標頭內元素 scrollIntoView 或 focus())後,資料區跟上標頭之位置,欄名不再對到相鄰欄之資料(原標頭單獨位移直到使用者再捲動);真滑鼠點擊、鍵盤導覽、滾輪捲動之行為不變 | 修正 | R21 |
| 工作樹(未提交,2026-10-28) | 貼上(Ctrl+V、pasteText)對 `opt.kpCellEditable` 之函數型值逐儲存格求值(原以真值判斷,函數恆為真,唯讀列仍被寫入);非布林非函數之真值(如 `1`)原會寫入,改為同 ag-grid 視為不可編輯;函數拋錯時該儲存格略過並於 console 說明一次(原無此情形);判斷於寫入前全部完成;filterall 生效時貼上寫入畫面上被判斷之那一列(原寫入 `vo.rows[node.id]`,即畫面以外之列).布林值行為不變 | 修正、可見行為 | R22 |
| 工作樹(未提交,2026-10-28 agv-run03) | 列拖曳排序(kpRowDrag)後寫回 `opt.rows` 保留各列全部欄位(原只留 `opt.keys` 之欄位,不在 keys 內之欄位如供 editable 函數判斷之旗標隨之消失,使唯讀列變可編輯);`opt.rows` 內之列物件為 ag-grid 之原列物件(依新列序),不再是提取後之新物件(缺少某 key 之列不再被補成 `''`,物件身分與原列相同);回呼 `rowDragEnd/Leave/Change` 之 `rows` 引數仍為依 keys 提取者(不變,但為副本:在回呼內就地修改 `rows` 不再影響寫回之 `opt.rows`;修改 `row` 現會改到 `opt.rows` 內之同一列物件) | 修正、可見行為(資料遺失) | R23 |

## 9. 候選規則與待裁示(未裁示,僅記錄)

- (已定案移出:e2e-pasteText(PT1–PT4)之 act 為宿主按鈕呼叫公開方法 → 2026-10-28 agv-run03 兩者皆做:PT1–PT4 改真滑鼠單擊 + 真鍵盤 Ctrl+V,程式契約正名 api-pasteText PA1–PA4,7.5 之偏離已解除.)
- **filterall 時列拖曳之 `opt.rows` 僅剩顯示子集**(第 6 節 #21,2026-10-28 agv-run03 實測發現,範圍外未修):修法須決定被 filterall 隱藏之列在新列序中的位置(例如維持原相對位置、附在其前一個顯示列之後),屬行為決定,待主控裁示.
- **evPaste 取 `event.clipboardData` 而非參數 `e`**(既有,2026-10-28 提出):mounted 內 `vo.evPaste = (e) => { let clipboardData = event.clipboardData || ... }` 讀的是全域 `event`(window.event),瀏覽器皆可用,但寫法易誤讀;不影響行為,本輪不改.
- **位置參數是否比照 R01**:setHeadFilter 之 type 誤植(如 'containz')時 ag-grid 靜默改用預設並套用;setHeadFilter、clearHeadFilter 之 key 為物件或 null 時靜默結束;皆不拋原生錯誤.type 之有效值依該欄過濾器類型(文字、數值、日期)而異,若比照須逐類型列出有效值.(2026-10-07 複審提出,本次維持現況)
- **標準圖**:渲染類之格是否加 pixel 補強層(第 7.4 節),須使用者逐張審圖.
- **帳本盤點之自動化**:以 unit 測試重跑各條盤點指令並斷言命中數與帳本相同(2026-10-07 複審提出);須先把命中數改為機器可讀,暫不採.
- (已定案移出:元件銷毀後呼叫需 grid API 之方法 → R19,2026-10-07.)
- (已定案移出:uploadData 是否需「略過不可編輯欄」之選項 → 維持不受 `kpCellEditable` 約束,JSDoc 已載,主控 2026-10-28 裁示.)
