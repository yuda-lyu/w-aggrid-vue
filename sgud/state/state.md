# 套件現況(state)

本檔只記**現況**:各功能做到哪裡、對應之規則帳本條目與測試檔、已知缺口與待辦、最近一次驗證之版本.過程寫入 `sgud/exp/experience.md`,藍圖(規則、盤點指令、站點)在 `sgud/rule/rulebook.md`.接續工作先讀本檔.

- 套件:w-aggrid-vue(ag-grid-community 31.3.4 之 Vue2 封裝);`package.json` version 2.1.18(HEAD `18058b4`,2026-11-02;agg31、ag268、ag284 不改 version)
- 建置:`node toolg/gDistRollupComps.mjs`(改 src 後測試前必先建置);測試:`npm test`(單檔、單格見規則帳本 7.1;「改動範圍 → e2e 檔」對照表亦在 7.1)
- 最近一次驗證:2026-11-02 ag284(Gitea #54:捲軸寬 0 時橫向隱形捲軸疊在資料區底部蓋住最後一列;樣式區加占位排列規則並重建 dist,R27;直向同型問題實測後不改,限制 #26);全套 `npm test --lock` 532 綠(517 + 新增 e2e-invisibleScrollbar 15 格),結果見下「最近一次驗證」

## 功能現況

| 區 | 做到哪裡 | 規則 | 測試檔 |
|---|---|---|---|
| 選項無效即預設 | 全部公開方法與元件 prop opt 已套 | R01–R03 | e2e-upload-matrix、e2e-download-*、e2e-showKeys、e2e-lifecycle |
| 資料列投影 | 只經 pickRowsByKeys | R04 | e2e-download-extended、e2e-upload-matrix、e2e-lifecycle |
| 畫面呈現 | cvCellText、kpCellFormat、slot、自訂表頭、焦點框、showKeys、過濾事件、標頭與資料區捲動同步 | R06–R11、R19–R21 | e2e-kpCellFormat、e2e-display-*、e2e-focus、e2e-showKeys、e2e-filters、e2e-headerscroll、e2e-lifecycle |
| 下載 | downloadData、downloadDisplayData 共用 downloadCore | R12–R16 | e2e-download-*、unit-hucre-limits |
| 上傳 | uploadData(replace/append) | R17 | e2e-upload-matrix、e2e-examples-upload |
| 貼上 | pasteText 與鍵盤 Ctrl+V:列序依畫面、略過隱藏欄、固定欄分區;**逐儲存格 isCellEditable(函數型 kpCellEditable 逐列求值,2026-10-28)**;判斷於寫入前完成;函數拋錯略過並 console 說明一次;寫入落在畫面被判斷之 node.data(filterall 亦正確);keys 重複之第二欄(colId≠field)略過 | R13、R22 | e2e-pasteText(PT1–PT4,布林,真滑鼠單擊 + 真鍵盤 Ctrl+V)、e2e-pasteEditable(PT5–PT18,函數型,同)、api-pasteText(PA1–PA4,宿主呼叫公開方法 pasteText 之程式契約) |
| 列拖曳 | kpRowDrag 排序後依新列序寫回 `opt.rows`,**保留各列全部欄位**(含不在 keys 內者,2026-10-28);回呼 `rows` 引數仍依 keys 提取;原位放開不寫回;End 與 Leave 兩條終止路徑共用寫回 | R23 | e2e-rowDrag(RD1–RD9,真滑鼠拖曳) |
| 表格文字覆寫 | `opt.localeText`(鍵同 ag-grid locale 鍵,另有本套件新增之 `noRowsToShowFiltered`;先查覆寫字典、查無再走內建;值非字串略過並 console 提示;未給時行為不變;執行中變更即時生效) | R24 | unit-getLangText(UG1–UG3)、api-localeText(AL1–AL7)、e2e-overlay(OV2、OV3、OV5、OV12、OV13、OV20、OV22–OV24、OV26、OV28、OV30) |
| 空表/過濾 0 筆覆蓋層 | 數據為空→`noRowsToShow`;`opt.rows` 非空而表頭過濾或 filterall 使顯示列為 0→`noRowsToShowFiltered`(**預設開啟**,`opt.showOverlayWhenFilteredEmpty=false` 關閉並完全回到舊行為);顯示列回到 >0 即隱藏;不蓋掉宿主經 `getApi().showLoadingOverlay()` 顯示之載入中;opt 執行中變更(localeText、language、選項)即時更新或隱藏;經 w-table-vue `WTableEdit` 原樣轉交(讀碼確認,未改他套件) | R25 | e2e-overlay(OV1–OV31)、api-localeText(AL5) |
| 淡入與根節點 `state` | 根節點 `state` 屬性(`showing` → `shown`,單向):淡入(外層 div 0.5 秒 opacity)結束且外層 div 已無進行中之 CSS 過場後落定;淡入期間根節點尺寸(寬或高)與淡入開始時差 > 1px 者,於淡入結束且尺寸穩定(`dbcFade` 350ms)後 `api.refreshCells({ force: true })` 恰 1 次再落定(淡入結束時再量一次尺寸,免漏同幀之變化;尺寸持續變動時自淡入結束起至多再等 3 秒即強制補繪);淡入期間無尺寸變化者不補繪、立即落定;過場事件遺失由後備輪詢(就緒 0.8 秒起每 50ms,至多再等 3 秒)判定;元件或 ag-grid 銷毀後略過.JSDoc `@vue-data state`;範例頁 `state`(選單群組 `dom`) | R26;第 6 節 #25 | e2e-fadeState(FD1–FD17)、e2e-examples-state(EXS1–EXS2)、unit-appExamples(AX6) |
| 隱形捲軸(捲軸寬 0) | 橫向隱形捲軸改占位排列(樣式區 `position: relative; bottom: auto !important`,不限平台):資料區讓出 16px,捲到最下時最後一列按鈕不被蓋住;置底列時捲軸排在置底列區之下;捲動同步、固定欄、無橫向捲動之版面不變.**直向隱形捲軸仍疊在資料區右緣 16px(實測後不改:占位會使橫向捲動範圍短 16px,最後一欄右緣被裁切,限制 #26)** | R27;6 節 #26 | e2e-invisibleScrollbar(IS1–IS15) |
| 範例即文件 | src 80 個範例(docs/examples 80,已於 2026-11-02 發布重產;範例頁引用形:本套件 dist 為相對路徑 `../dist/`、w-jsonview-tree 為 gh-pages 網址、w-demores 與 vue 等第三方為 jsDelivr,測試之 `EXTERNAL` 對照表與產製器 `exampleBuild.mjs`〔直接呼叫 genDocsExams〕已與之同形,EXT1/EXT2 守護);新增 `localeText`、`showOverlayWhenFilteredEmpty`(選單群組 `text`,2026-10-30 agv-run02)、`state`(選單群組 `dom`,2026-11-01 agg31),破壞性變更(過濾 0 筆覆蓋層預設開啟)之說明寫在兩頁之說明文字與 `opt.showOverlayWhenFilteredEmpty` 之 JSDoc;**README 不改**(R18,run01 之新增已撤回);範例說明文字不可含字面 `WAggridVue`(產製管線會改寫) | R18、R24、R25、R26 | e2e-examples-*、unit-appExamples(AX1–AX6、BLD1、EXT1–EXT2)、e2e-examples-overlay(EXO1–EXO4)、e2e-examples-state(EXS1–EXS2) |

## 已知缺口與待辦

- **待裁示**:filterall 生效時列拖曳,`opt.rows` 被寫成顯示中之子集(隱藏列消失;第 6 節 #21,範圍外未修,修法須定隱藏列之放置規則);位置參數是否比照 R01;標準圖是否產製(第 7.4、9 節).
- **已裁示(主控 2026-10-28)**:uploadData 維持不受 `kpCellEditable` 約束(JSDoc 已載);編輯器開啟中 Ctrl+V(#19)維持現行;貼上六項既有邊界(#20)維持登錄.
- **已解除(2026-10-28 agv-run03)**:列拖曳寫回僅留 keys 欄位(原 #18)判定為缺陷並修正(R23);e2e-pasteText(PT1–PT4)改真實操作、程式契約正名 api-pasteText(7.5 偏離解除).
- **已裁示(主控 2026-10-30,agv-run02)**:標準圖層本輪不建,維持現狀(第 7.4 節;新情境只有語意斷言);README 不改(R18),agv-run01 新增之兩節撤回;依 R18 新增範例頁 `localeText`、`showOverlayWhenFilteredEmpty`;filterall 使數據為空時顯示過濾 0 筆文字(而非 `noRowsToShow`)接受維持;限制 #24 接受維持文件.
- **發布重產時**:`docs/`(JSDoc 網頁、範例)依 script.txt 重產(gDistApp → gExtractHtml → gDocExams;gDistApp 會清空 docs/examples),重產後 R18 盤點之 src 與 docs/examples 皆須為 80(2026-11-02 已為 80);若 `toolg/gExtractHtml.mjs` 之 head 或選項有改,須同步 `test/tools/exampleBuild.mjs`(BLD1 會提醒);**若 w-package-tools `genDocsExams` 之改寫規則或範例頁引用有變,須同步 `test/tools/e2e-setup.mjs` 之 `EXTERNAL`**(`unit-appExamples` EXT1 先紅並指名未對照之網址;R18).
- **已知限制(規則帳本第 6 節 #24)**:宿主 `hideOverlay()` 後不自動重現;覆蓋層種類以 DOM 類名判斷(ag-grid 升版須重驗 OV16、OV17、OV29).
- **已知限制(新,規則帳本第 6 節 #25)**:淡入補繪只涵蓋淡入期間(含等待尺寸穩定)內之尺寸改變,`shown` 之後才發生者不補繪;淡入期間尺寸有改變時自訂 cell-render slot 之儲存格被重建一次;`state` 只反映淡入與補繪,不代表數據已載入;淡入落定依 `getAnimations()`;補繪後畫面與 `tr=0` 相同僅在 Chromium(Playwright 1.63)逐 byte 驗證.
- **待裁示(agg31)**:①`state` 取名/值(showing/shown)是否需再加過渡態(如 `resizing`);②〔已解除:`docs/examples` 於 2026-11-02 發布重產,ex-state 頁已在〕;③w-component-vue ≥ 2.5.35 之 `createTransitionState` 日後若成為本套件相依,可否改引用(目前自寫,常數與作法已比照).
- **已知限制(新,規則帳本第 6 節 #26,2026-11-02 ag284)**:直向隱形捲軸(捲軸寬 0 之環境)仍疊在資料區右緣 16px,最右欄距右緣 16px 內之互動內容(如填滿儲存格之按鈕之右側)點不到;改占位會使橫向捲軸範圍短 16px 而裁切最後一欄,故不改(IS14 記錄現況、IS15 為對照);**待裁示**:是否接受維持,或由呼叫端於最右欄留 16px 以上右內距.
- **升版影響(R27)**:捲軸寬為 0 之環境下,有橫向捲動之表格資料區少 16px;使用端以無頭瀏覽器產製之 e2e 標準圖拍到有橫向捲軸之表格者須重產;本套件無 `test/pics`.
- **未驗**:pasteText 之固定欄(pinned)貼上規則;列拖曳於置頂置底列、回呼內銷毀表格;e2e 於 Linux CI 未實測;R20 第 3 項時序、R03 之兩個 catch 以程式碼核對.
- 既有限制見規則帳本第 6 節(25 項;#25 為淡入補繪與 state 之限制;#24 為過濾 0 筆覆蓋層之限制;#18 已修正、#19 編輯器開啟中 Ctrl+V 先提交原生文字、#20 貼上既有邊界六項、#21 filterall 時列拖曳僅寫回顯示子集、#22 rowDragChange 回呼內同步 pasteText 會把 opt.rows 覆寫回舊序、#23 置頂置底列不隨列拖曳重算)。
- 既有碼觀察(未改):mounted 之 evPaste 讀全域 `event.clipboardData`(規則帳本第 9 節).

## 最近一次驗證

- 2026-10-28 agv-run01:新增 e2e-pasteEditable;全套 432 綠(報告 `C:\opensrcOper\dnow\20261028024402\agent-out\agv-run01-修正報告.md`).
- 2026-10-28 agv-run02:依 role-coder-for-test-e2e 逐項比對後,e2e-pasteEditable 改寫為全走真滑鼠 + 真鍵盤 Ctrl+V(14 格);修前(HEAD dist)11 紅 3 綠,修後 14 綠,同檔連跑 5 次皆綠;六處同時變異恰被 6 格偵測;全套結果見 `…\agent-out\agv-run02-修正報告.md`.
- 2026-10-28 agv-run03:列拖曳寫回保留全欄(R23,缺陷修正)、e2e-pasteText 改真實操作並拆出 api-pasteText、新增 e2e-rowDrag(9 格);全套 444 綠;外審 terra 11 條(屬實 9、誤報 2);報告 `C:\opensrcOper\dnow\20261028054319\agent-out\agv-run03-修正報告.md`.
- 2026-10-30 agv-run01(Gitea issue #26):新增 `opt.localeText`(R24)與過濾 0 筆覆蓋層(R25,預設開啟,`opt.showOverlayWhenFilteredEmpty` 可關);新增 unit-getLangText 3、api-localeText 7、e2e-overlay 31 格;修前(HEAD dist)38 格中 31 紅 7 綠(綠者為保留行為);19 個單點變異全被偵測;全套 `npm test --lock` 485 綠(5m36s),新增三檔另連跑 3 次各 41 綠;外審:sonnet 讀碼 1 則(找出 2 項缺陷,已修並以 OV28、OV29 守護;未派第三方外審);報告 `C:\opensrcOper\dnow\20261030102424\agent-out\run01-修正報告.md`.
- 2026-10-30 agv-run02(Gitea issue #26 修正輪):依主控裁定撤回 README 兩節(`git diff README.md` 為空);新增範例頁 `AppLocaleText`、`AppShowOverlayWhenFilteredEmpty`(App.vue 四處一致,選單群組 `text`)與 `opt.showOverlayWhenFilteredEmpty` JSDoc 之破壞性變更說明(dist 隨之重建);新增 unit-appExamples 6、e2e-examples-overlay 4 格(範例頁自 src 以 `test/tools/exampleBuild.mjs` 產製,docs/examples 待發布重產);範例測試 18 個單點變異全被偵測(另以 HEAD dist 覆蓋〔修前〕EXO2、EXO4 紅);新增二檔連跑 5 次各 10 綠;全套 `npm test --lock` 495 綠(5m29s,凍結碼上最後一次;其前之同碼全套 5m28s 亦 495 綠);真實 App(rollupVueToHtml 建到 tmp,不動 docs/examples)以 `?cmp=` 與真實點擊選單驗新範例;報告 `C:\opensrcOper\dnow\20261030102424\agent-out\run02-修正報告.md`.
- 2026-11-01 agg31(Gitea issue #31):根節點 `state` 屬性與淡入期間改寬之補繪(R26);最小重現(建議檔 index.html、run.mjs)HEAD dist 16 輪:預設 2 種、e2e 旗標 3 種 → 修後各 1 種且雜湊等於 `tr=0`(對照組不變);新增 e2e-fadeState 17 格、e2e-examples-state 2 格、unit-appExamples AX6;**修前(HEAD dist)e2e-fadeState 17/17 紅**(因無 `state` 屬性);**14 個單點變異全被偵測**(dist 字串取代,見規則帳本 R26 變異節);全套 `npm test --lock` **515 passing、0 failing**(5m49s,凍結碼上最後一次);終版 e2e-fadeState 連續單檔重跑 5 次皆 17 passing(終版合計 7 次執行 0 失敗);終版 dist 之最小重現批次 16 輪 × 10 組與中間建置逐組相同;獨立外審(sonnet 讀碼)2 輪:首輪 8 項〔屬實 7、未證實 1〕、次輪實作無可佐證缺陷但測試鑑別力與穩定等待上限 6 項,皆已處置(見報告);報告 `C:\opensrcOper\dnow\20261031175415\agent-out\agg31-修正報告.md`.
- 2026-11-02 ag268(全庫連動跟跑測試 26 案紅之修正輪;只改 `test/` 與 `sgud/`,不改 `src/`、`docs/`、`dist/`、README、`package.json`、標準圖〔本套件無 `test/pics`〕):成因為排程第 257、268 項後發布流程的 `genDocsExams` 把範例頁內自有套件引用改為 gh-pages 網址,而 `e2e-setup.mjs` 之 `EXTERNAL` 只認舊 jsDelivr 形(w-jsonview-tree 被中止,頁內 `jv` 未定義),且 `exampleBuild.mjs` 仍產舊形;修正:`EXTERNAL` 補 w-jsonview-tree 之 gh-pages 網址並移除不再出現之舊形二項、新增 `routeLocalDist` 與共用之 `assertRouted`(本套件 dist 在範例頁改為相對路徑,以 file: 路由改由專案 `dist/` 供應並驗恰載入一次,不受 `docs/dist` 副本新舊影響)、`exampleBuild.mjs` 改為直接呼叫 `genDocsExams`(src 全部 80 個範例自產製器產出者與 docs/examples 逐字相同)、新增 `unit-appExamples` EXT1(全部 81 頁外部資源逐一核對、無過期項)與 EXT2(80 個 ex 頁恰一次以相對路徑載入 dist、docs/dist 檔存在);**修前**全套 515 格 489 綠 26 紅(範例頁 e2e 25 + BLD1 1,7m32s),**修後** `npm test --lock` **517 passing、0 failing**(6m00s,凍結碼上最後一次);受影響 6 檔(e2e-examples-* 五檔與 unit-appExamples)終版另連跑 3 次各 47 綠;變異(對照表壞掉、過期對照項、產製器保留舊形、產製器不置 dist 副本〔BLD1〕、關閉 dist 路由、`assertRouted` 之缺漏/重複/未對照)皆被偵測,另證路由供應之 dist 不受壞掉之 `docs/dist` 副本影響;報告 `C:\opensrcOper\dnow\20261102201333\agent-out\ag268-修正報告.md`.
- 2026-11-02 ag284(Gitea issue #54;與 ag268 之未提交改動同在工作樹,ag268 改動未動):樣式區新增 `.CompCssWAggridVue .ag-body-horizontal-scroll.ag-scrollbar-invisible { position: relative; bottom: auto !important; }`(src `WAggridVue.vue` 末段,含說明註解)並以 `node toolg/gDistRollupComps.mjs` 重建 dist(修前修後 dist 之差異只在內嵌之元件樣式字串);新增 `test/e2e-invisibleScrollbar.test.mjs`(IS1–IS15)與 `test/pages/invisibleScrollbar.html`;**修前(HEAD dist)15 格 7 紅 8 綠**(紅:IS1、IS2、IS3、IS5、IS8、IS12、IS13,中央最上層為 `ag-body-horizontal-scroll-container`);修後 15 綠;**6 個單點變異皆被偵測**(M2 即 issue 草案之去掉 `!important` 之形,只有 IS13〔置底列〕偵測得到);修後整檔連跑 6 次(前版)+ 終版單檔 3 次 + 全套內 1 次,共 10 次 0 失敗;全套 `npm test --lock` **532 passing、0 failing**(6m,凍結碼上最後一次;既有 517 格皆未改動);`docs/examples` 全部 81 頁以本機路由開啟:無 console 錯誤與警告、無 pageerror、無未對照之外部資源(一次性查核,不入測試);報告 `C:\opensrcOper\dnow\20261102201333\agent-out\ag284-修正報告.md`.
- 尚未發布:本輪(ag268 + ag284)改動在工作樹(src、dist、test、sgud),由主控複審後發布;`docs/`(含 `docs/dist` 副本)依發布流程重產.
