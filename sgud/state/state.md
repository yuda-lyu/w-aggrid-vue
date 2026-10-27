# 套件現況(state)

本檔只記**現況**:各功能做到哪裡、對應之規則帳本條目與測試檔、已知缺口與待辦、最近一次驗證之版本.過程寫入 `sgud/exp/experience.md`,藍圖(規則、盤點指令、站點)在 `sgud/rule/rulebook.md`.接續工作先讀本檔.

- 套件:w-aggrid-vue(ag-grid-community 31.3.4 之 Vue2 封裝);`package.json` version 2.1.11(HEAD `ecd0cd8`,2026-10-28)
- 建置:`node toolg/gDistRollupComps.mjs`(改 src 後測試前必先建置);測試:`npm test`(單檔、單格見規則帳本 7.1)
- 最近一次驗證:2026-10-28 agv-run01(issue #13 貼上對函數型 kpCellEditable);全套結果見下「最近一次驗證」

## 功能現況

| 區 | 做到哪裡 | 規則 | 測試檔 |
|---|---|---|---|
| 選項無效即預設 | 全部公開方法與元件 prop opt 已套 | R01–R03 | e2e-upload-matrix、e2e-download-*、e2e-showKeys、e2e-lifecycle |
| 資料列投影 | 只經 pickRowsByKeys | R04 | e2e-download-extended、e2e-upload-matrix、e2e-lifecycle |
| 畫面呈現 | cvCellText、kpCellFormat、slot、自訂表頭、焦點框、showKeys、過濾事件、標頭與資料區捲動同步 | R06–R11、R19–R21 | e2e-kpCellFormat、e2e-display-*、e2e-focus、e2e-showKeys、e2e-filters、e2e-headerscroll、e2e-lifecycle |
| 下載 | downloadData、downloadDisplayData 共用 downloadCore | R12–R16 | e2e-download-*、unit-hucre-limits |
| 上傳 | uploadData(replace/append) | R17 | e2e-upload-matrix、e2e-examples-upload |
| 貼上 | pasteText 與鍵盤 Ctrl+V:列序依畫面、略過隱藏欄、固定欄分區;**逐儲存格 isCellEditable(函數型 kpCellEditable 逐列求值,2026-10-28)**;判斷於寫入前完成;函數拋錯略過並 console 說明一次;寫入落在畫面被判斷之 node.data(filterall 亦正確);keys 重複之第二欄(colId≠field)略過 | R13、R22 | e2e-pasteText(PT1–PT4,布林)、e2e-pasteEditable(PT5–PT18,函數型,全走真滑鼠單擊 + 真鍵盤 Ctrl+V) |
| 範例即文件 | 77 個 docs/examples;README 不改 | R18 | e2e-examples-* |

## 已知缺口與待辦

- **待裁示**:e2e-pasteText(PT1–PT4)之 act 為宿主按鈕呼叫公開方法,是否改真鍵盤或正名 `api-`(規則帳本第 9 節);位置參數是否比照 R01;標準圖是否產製(第 7.4、9 節).
- **已裁示(主控 2026-10-28)**:uploadData 維持不受 `kpCellEditable` 約束(JSDoc 已載);列拖曳寫回僅留 keys 欄位(第 6 節 #18)不動,由主控登錄;編輯器開啟中 Ctrl+V(#19)維持現行;貼上六項既有邊界(#20)維持登錄.
- **未驗**:pasteText 之固定欄(pinned)貼上規則;e2e 於 Linux CI 未實測;R20 第 3 項時序、R03 之兩個 catch 以程式碼核對.
- 既有限制見規則帳本第 6 節(20 項;本輪新增 #18 列拖曳寫回僅留 keys 欄位、#19 編輯器開啟中 Ctrl+V 先提交原生文字、#20 貼上既有邊界六項)。
- 既有碼觀察(未改):mounted 之 evPaste 讀全域 `event.clipboardData`(規則帳本第 9 節).

## 最近一次驗證

- 2026-10-28 agv-run01:新增 e2e-pasteEditable;全套 432 綠(報告 `C:\opensrcOper\dnow\20261028024402\agent-out\agv-run01-修正報告.md`).
- 2026-10-28 agv-run02:依 role-coder-for-test-e2e 逐項比對後,e2e-pasteEditable 改寫為全走真滑鼠 + 真鍵盤 Ctrl+V(14 格);修前(HEAD dist)11 紅 3 綠,修後 14 綠,同檔連跑 5 次皆綠;六處同時變異恰被 6 格偵測;全套結果見 `…\agent-out\agv-run02-修正報告.md`.
- 尚未發布:本輪改動在工作樹(src、dist、test、sgud),由主控跑全套後發布.
