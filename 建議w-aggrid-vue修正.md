# 建議 w-aggrid-vue 修正：下載路徑之表頭錯位、欄位還原與無訊號失敗

- 撰寫日期：2026-10-06
- 對象套件：`w-aggrid-vue` 2.1.5（本機 repo `開源-JS-404-7-w-aggrid-vue/w-aggrid-vue`；其 `src/components/WAggridVue.vue` 與 dist 經比對與 npm 2.1.5 相同）
- 範圍：`downloadDisplayData`（`WAggridVue.vue:2504-2593`）與 `downloadData`（`WAggridVue.vue:2595-2684`）兩條下載路徑；不含上傳
- 來源：w-table-vue「無數據列時仍可下載表頭」擴充之四方獨立審查（2 個 Opus 5.5、2 個 GPT-6.1 Sol）所提出（第 1 項四方皆有指出），並以 2.1.5 之 dist 於系統 Chrome 實測重現

下文行號未註明檔案者皆指 `src/components/WAggridVue.vue`。

## 摘要

| # | 問題 | 使用者看到的後果 | 建議 |
|---|---|---|---|
| 1 | 過濾下載以 funGetKeysHook 排除可見欄時，表頭與資料錯位 | Excel 中資料整列左移一欄，值寫在錯的欄名下 | 表頭改用排除後之 keys（一行） |
| 2 | funGetKeysHook 回傳空陣列時，兩條路徑都還原成全部欄位 | 刻意排除之欄位（如主鍵）被輸出 | 空陣列不還原，視為無可下載欄位 |
| 3 | 無可下載欄位、掛鉤回傳不合約定時，靜默返回、少資料或不產檔 | 呼叫端無從得知失敗，w-table-vue 仍顯示「下載成功」 | 能同步偵測者改為拋錯 |
| 4 | 兩個下載方法沒有 JSDoc | 掛鉤順序、同步限制、回傳值、失敗行為皆無契約 | 補 JSDoc |

## 1. 過濾下載之表頭與資料錯位

**成因**：`downloadDisplayData` 的資料用 funGetKeysHook 處理後的 `useKeys`（`:2568` `let mat = ltdtkeys2mat(data, useKeys)`），表頭卻用處理前的 `keys`（`:2571` `let heads = keys`；`useHead` 時 `:2573` 亦對 `keys` 取 kpHead）。`downloadData` 則兩者都用 `useKeys`（`:2662` `let heads = useKeys`、`:2664`），所以只有過濾下載出錯。

**實測**（2 列數據，keys 為 id、make、model、price，funGetKeysHook 排除 id）：

| 呼叫 | 下載檔內容 |
|---|---|
| `downloadDisplayData` | 表頭 `id, make, model, price`；數據 `Toyota, Celica, 35000, ""`——make 的值落在 id 欄下 |
| `downloadDisplayData`＋`useHead` | 表頭 `主鍵, 製造商, 型號, 價格`；數據同樣左移一欄 |
| `downloadData`（對照） | 表頭 `make, model, price`；數據 `Toyota, Celica, 35000`，正確 |

**建議修法**：`:2571` 改為 `let heads = useKeys`，`:2573` 的 `map(keys, …)` 改為 `map(useKeys, …)`，與 `downloadData` 一致。

**影響**：w-table-vue 的 `removeIdsWhenDownload` 就是經 funGetKeysHook 排除欄位（`w-table-vue/src/components/WTableEdit.vue:1183`），所以 w-table-vue 使用者只要設了 `removeIdsWhenDownload`、又用「下載過濾後數據」鈕，被排除的欄若在畫面上可見，就會拿到錯位的檔案。

## 2. 排除全部欄位會被還原成全部欄位

**成因**：兩條路徑在呼叫 funGetKeysHook 後都有 `if (!isearr(useKeys)) { useKeys = cloneDeep(keys) }`（`:2543-2545`、`:2634-2636`）。`isearr([])` 為 false，所以掛鉤刻意回傳空陣列時，會被當成「掛鉤無效」而還原。

**實測**：funGetKeysHook 回傳 `[]`，`downloadData` 與 `downloadDisplayData` 都輸出 id、make、model、price 全部四欄與全部數據。

**建議修法**：還原只保留給「掛鉤回傳非陣列」的情況（見第 3 節第 4 點之決定）；回傳空陣列時視為「無可下載欄位」，依第 3 節處理，不產生檔案。單欄表格以 `removeIdsWhenDownload` 排除唯一一欄時就會走到這裡。

## 3. 失敗無訊號

現行兩個方法都是同步執行、同步回傳 `mat`，產檔則交給 wsemi 之 `downloadExcelFileFromData` 非同步進行，且只接 `.catch` 記錄（`:2587-2590`、`:2678-2681`）。下列情況呼叫端都拿不到失敗訊號：

| 情況 | 實測結果 | 成因 |
|---|---|---|
| 3a 無可下載欄位（例：全部欄位隱藏時之 `downloadDisplayData`） | 回傳 `undefined`、不產檔、不拋錯，主控台只印 `invalid useKeys` | `:2548-2551` 印出後直接 `return` |
| 3b funGetLtdtHook 為 async 函數 | 檔案只有表頭，數據全部消失，不拋錯 | `:2564`、`:2655` 不等待回傳值；`ltdtkeys2mat` 收到 Promise 時回 `[]`（`node_modules/wsemi/src/ltdtkeys2mat.mjs:54-56`） |
| 3c funGetLtdtHook 漏寫 return（回傳 undefined） | 同上，只有表頭 | 同上 |
| 3d funGetMatHook 回傳非陣列 | 回傳 `undefined`、不產檔、不拋錯，主控台只印 `data is not an array undefined` | wsemi 遇非陣列以 resolve 回傳 `{ error }`（`node_modules/wsemi/src/downloadExcelFileFromData.mjs:54-59`；其 JSDoc `:23` 明載失敗時 resolve），WAV 只接 `.catch` |

對照：上傳端 `uploadData` 有明確契約，失敗時 reject `{ msg, err }`（`:2693` JSDoc），beforeUpload 也支援 Promise（`:2780-2781`）。下載端兩者皆無，契約不對稱。

**下游後果**：w-table-vue 的 `WTableEdit.downloadData` 在呼叫後同步發出 success（`w-table-vue/src/components/WTableEdit.vue:1182-1209`），上表四種情況使用者都會看到「下載成功」，實際卻沒有檔案或檔案缺資料。

### 訊號機制：兩種做法

| 做法 | 內容 | 相容性 | 下游 |
|---|---|---|---|
| A（建議） | 維持同步回傳 `mat`；能同步偵測的失敗一律 `throw`：無可下載欄位、funGetLtdtHook／funGetMatHook 回傳 Promise 或非陣列 | 回傳值不變；只是原本靜默的失敗改為拋錯 | w-table-vue 已以 try/catch 包住呼叫（`WTableEdit.vue:1154-1212`），拋錯會自動改發 error 事件，w-table-vue 不必改碼 |
| B | 改為回傳 Promise，產檔完成 resolve `mat`、失敗 reject `{ msg, err }`，比照 `uploadData` | **破壞性**：官方範例 `src/AppDownloadData.vue:76-96`、`src/AppDownloadDisplayData.vue:99-119` 都直接使用同步回傳值 | w-table-vue 須改為等待 Promise 再發 success／error |

建議採 A：它涵蓋實測到的全部四種情況，又不改回傳型別。A 無法涵蓋的只剩 wsemi 內部轉換失敗（`downloadExcelFileFromData.mjs:75-87`，輸入已為合法陣列時才可能發生）；可於 `.then` 檢查回傳是否含 `error` 並記錄，但無法回報給呼叫端。若日後要完整回報，再另以 B 改版。

### 做法 A 之具體修改點

1. 兩條路徑的「`console.log('invalid useKeys')` 後 `return`」（`:2548-2551`、`:2639-2642`）改為拋錯，例如訊息 `no downloadable keys`。
2. funGetLtdtHook 呼叫後（`:2564`、`:2655`），回傳值為 Promise（可用已匯入之 `ispm`，`:76`）或非陣列時拋錯，訊息寫明「須同步回傳陣列」。
3. funGetMatHook 呼叫後（`:2583`、`:2674`），同樣檢查回傳值須為陣列。
4. funGetKeysHook 回傳非陣列時（例如漏寫 return），請決定：
   - (a) 維持現行，還原為全部欄位。
   - (b) 一併拋錯。

   建議 (b)：(a) 會把呼叫端想排除的欄位一起輸出，與第 2 節是同一類洩漏；但 (b) 會改變「漏寫 return 仍能下載」的現行寬鬆行為，請依既有呼叫端情況決定。w-table-vue 的 funGetKeysHook 一律回傳陣列（`WTableEdit.vue:1183-1192`），兩案皆不受影響。

拋錯物件可用 `new Error(訊息)`；若要與 `uploadData` 的 `{ msg, err }` 形狀一致亦可，w-table-vue 兩者皆能處理。

## 4. 補 JSDoc

`downloadData` 與 `downloadDisplayData` 目前沒有 JSDoc；同檔 `uploadData` 則有完整說明（`:2686-2694`）。建議比照補上：

- 各選項：`funGetKeysHook`、`funGetLtdtHook`、`funGetMatHook`、`useHead`、`useFormat`、`fileName`、`sheetName` 之預設值。
- 掛鉤執行順序：keys → ltdt → mat。mat 掛鉤收到的是 ltdt 掛鉤處理後、已加上表頭列之二維陣列。
- 掛鉤一律同步，須回傳陣列；不支援 Promise。
- 回傳值為下載內容之二維陣列（首列為表頭）。
- 失敗行為（依第 3 節採用之做法）。
- 兩條路徑欄位來源之差異（見第 5 節第 2 點）。

## 5. 請維持之現況（修正時勿改變）

1. **無數據列時 `downloadData` 只輸出表頭 1 列**。實測 rows 為空陣列、`useHead` 時，下載檔為 `主鍵, 製造商, 型號, 價格` 一列。w-table-vue 的下載數據按鈕於無數據列時亦一律顯示，靠此行為讓使用者下載表頭範本填寫後上傳，請勿加入「無數據即返回」之檢查。
2. **兩條路徑欄位來源不同屬刻意設計**。
   - `downloadData` 依 `vo.keys`，即 opt.keys 的順序，且含隱藏欄（`:2627`）。
   - `downloadDisplayData` 依欄位狀態，即畫面欄序，只含可見欄（`:2380`）。
3. **表頭文字取自 `kpHead`，不取 head-render slot 的輸出**（`:2573`、`:2664`）。

## 6. 驗收方式

建一頁放三個 WAggridVue：

- **t1**：keys 為 id、make、model、price，kpHead 給中文名稱，rows 2 列。
- **t2**：同 t1，但以 `kpHeadHide` 隱藏全部欄位。
- **t3**：同 t1，但 rows 為空陣列。

依下表呼叫元件方法，攔截瀏覽器下載並讀回 xlsx 內容比對。

| 格 | 呼叫 | 修改前（2.1.5 實測） | 修改後應為 |
|---|---|---|---|
| D1 | t1 `downloadDisplayData`，funGetKeysHook 排除 id | 表頭 4 欄、數據 3 欄，錯位 | 表頭 make、model、price；數據 3 欄對齊 |
| D1b | 同 D1 加 `useHead: true` | 表頭 4 個中文名、數據錯位 | 表頭 製造商、型號、價格；對齊 |
| D1c | t1 `downloadData`，排除 id | 正確 | 不變 |
| D2 | t1 `downloadData`，funGetKeysHook 回傳 `[]` | 輸出全部 4 欄 | 拋錯、不產檔 |
| D2b | t1 `downloadDisplayData`，funGetKeysHook 回傳 `[]` | 輸出全部 4 欄 | 拋錯、不產檔 |
| D3 | t2 `downloadDisplayData` | 回傳 undefined、不產檔、不拋錯 | 拋錯、不產檔 |
| D4 | t1 `downloadData`，funGetLtdtHook 為 async 函數 | 只有表頭、不拋錯 | 拋錯、不產檔 |
| D5 | t1 `downloadData`，funGetLtdtHook 無 return | 只有表頭、不拋錯 | 拋錯、不產檔 |
| D6 | t1 `downloadData`，funGetMatHook 無 return | 回傳 undefined、不產檔、不拋錯 | 拋錯、不產檔 |
| D7 | t3 `downloadData`，`useHead: true` | 只有表頭 1 列 | 不變 |
| 回歸 | 官方範例 `AppDownloadData.vue`、`AppDownloadDisplayData.vue` | — | 頁面與下載內容不變 |

本次實測腳本暫存於 w-table-vue repo 的 `tmp/aggrid-dl/`，可能會被清除；以上步驟已足以重建。

## 7. 發布後之 w-table-vue 連動

w-aggrid-vue 發布新版後，w-table-vue 端要做：

1. 升級依賴並重建。第 1 節的修正會隨打包進入 w-table-vue 的 dist。
2. 若採做法 A，`WTableEdit.downloadData` 不必改碼；以上表各格實測確認原本的「下載成功」改為 error 事件。若採做法 B，WTableEdit 須改為等待 Promise。
3. WTableEdit 的掛鉤 JSDoc 已寫明「函數拋錯時觸發 error 事件且不產生檔案」（`WTableEdit.vue:305-306`），與做法 A 一致。
