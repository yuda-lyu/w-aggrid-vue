# 累積經驗

本檔為執行工作時特有之累積經驗,留給後續之嘗試、執行與判斷,由agent自行編列、擴充與維護.

各條為實際踩過或實測確認者,附日期.行號會隨改版漂移,引用時以函式名或檔名定位.

## 1. 建置、lint 與文件

- **建置 dist**:`node toolg/gDistRollupComps.mjs`(以 cwd 相對路徑讀 `./src/components/`、寫 `./dist`,約 15~60 秒).dist 會把 wsemi、hucre 一併打包,**相依套件升版後必須重建**,否則測到的是舊行為.
- **lint**:`node_modules/.bin/eslint --no-fix --ext .vue src/components/WAggridVue.vue`.既有 2 個錯誤(`vue/no-unused-components` 之 CellSlotRenderer、HeaderSlotRenderer)為原本就有,只允許這 2 個.
- **拋錯形狀**:`.eslintrc.js` 繼承 `standard`,`no-throw-literal` 為 error(定義在 `node_modules/eslint-config-standard/.eslintrc.json`,不在 `.eslintrc.js` 本身),同步拋錯須 `new Error(...)`;`prefer-promise-reject-errors` 已關閉,所以 `uploadData` 可 reject `{ msg, err }`.
- **重產範例**:`gDistApp` 會清空 `docs/examples`,必須依 `script.txt` 順序執行 `gDistApp → gExtractHtml → gDocExams`.
- **對外文件與 JSDoc 之規則**:見 `sgud/rule/rulebook.md` 之 R05(共用契約只寫一處)、R18(範例即對外文件、README 不改).

## 2. 實測方法(Playwright)

### 2.1 正式測試(`./test`,2026-10-06 起)

- 結構與規則依全域技能 role-coder-for-test-e2e,落地映射(共用層函式、偏離與依據)見規則帳本之 e2e 映射節;執行 `npm test`,單檔 `npx mocha test/<檔> --reporter spec --timeout 180000`,單格加 `--grep "<代號>"`.
- **新測試要先在修正前之 dist 上跑一次**:「修」之格必須紅、「保留」之格必須綠,才證明測得到缺陷(2026-10-06 之 e2e-filters、e2e-lifecycle、下載上限、showKeys 輸入皆如此驗過).
- **以 `vm.runInNewContext` 讀入之 fixture**,其物件原型屬另一個 realm,`assert.deepStrictEqual` 會因原型不同判為不等;以 `JSON.parse(JSON.stringify(...))` 轉回本 realm(`loadFixtureData`).
- **範例頁於掛載時就可能下載**:download 事件之收集要在 `page.goto` 之前掛上(`openPage` 之 `ctx.downloads`),在點擊時才掛會漏掉.
- **自帶計時器之範例**(數秒後才改數據):`waitGridIdle` 會一路等到最終狀態而錯過中間狀態;要觀察中間狀態時開頁只等首批儲存格(`openPage` 之 `idle: false`),再以偵測等待各狀態.
- **範例頁之標題**:`.bkh` 之 innerText 含「example code」等按鈕文字,取第一行才是標題.
- **元件銷毀後之情境**:掛載後隨即 `$parent.$destroy()`,掛載時排定之非同步工作(過濾事件)會在銷毀後才執行,其 console 訊息落在呼叫之後;宿主頁之處理函數於呼叫後再等約 300ms 才寫結果,訊息才收得到.

### 2.2 tmp 驗收腳本(舊法,可能已清除)

- **啟動**:`chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true })`,測試頁以 `file:///` 載入 `../dist/w-aggrid-vue.umd.js` 與 `../node_modules/vue/dist/vue.min.js`.
- **下載**:`page.waitForEvent('download')`＋`saveAs`,再以 wsemi `getDataFromExcelFileU8Arr(u8a, { fmt: 'array' })` 讀回比對.**分頁名欄位是 `sheetname`,不是 `name`**(2026-10-06 曾因此誤判 2 格).
- **上傳**:先 `page.waitForEvent('filechooser')`,再以 `page.click` 真滑鼠點擊(瀏覽器須使用者啟動才開窗),然後 `chooser.setFiles(檔)`;模擬取消選檔為對 input 派發 `cancel` 事件.測試用 xlsx 以 wsemi `getExcelWorkbookFromData`＋`getExcelU8ArrFromWorkbook` 產生;矩陣中之 `null` 會寫成「沒有儲存格」,可用來造出讀回為 `{}` 之列(表格旁之備註欄).
- **讀畫面欄序**:ag-grid 移動欄位時只改表頭格定位、不重排 DOM 節點,**須依 `getBoundingClientRect().left` 排序**,不可依 DOM 順序(2026-10-06 曾因此誤判 1 格).固定欄(pinned)在獨立容器,DOM 順序剛好正確,容易誤以為 DOM 順序可靠.
- **官方範例回歸**:`docs/examples/ex-*.html` 自 CDN 載入固定版號之 w-aggrid-vue,直接開啟只測到 npm 版;須以 `page.route('**/w-aggrid-vue@*/dist/w-aggrid-vue.umd.js', ...)` 導向本地 dist,並與修改前之 dist(`git show <commit>:dist/w-aggrid-vue.umd.js`)逐字比對下載檔與 `#ckmsg`.
- **無使用者啟動**:Playwright 之 `page.evaluate` 本身帶有使用者啟動,不能用來測「不開窗」;須在頁內以計時器延遲 5 秒以上呼叫.
- **時區**:Windows 上之 Node 以 `TZ=UTC` 可切換時區;`TZ=America/New_York` 等 IANA 名稱在本機未生效(偏移仍為 -480),時區比對以 +08:00 與 UTC 兩組為準.
- **比對腳本須先自我驗證**:以修改前之輸出跑比對腳本,FAIL 之格必須恰好等於分析表上「修」之格、PASS 恰好等於「保留」之格,再拿來驗修改後.
- **期望值由規格推導,不由輸出回填**;實測與程式碼結論衝突時先懷疑量測方法(2026-10-06 首輪 3 格失敗全是量測錯誤).
- **舊驗收腳本有修正前/後兩種期望**:zz_focus、zz_upload_cancel 以 `--expect-fixed` 切換,不帶參數時驗的是修正前之症狀,對現行 dist 會報 FAIL(2026-10-06 重跑 zz_focus 時出現 2 項 FAIL,帶參數後 8/8).重跑前先讀腳本開頭之參數說明.
- **計數前先看輸出格式**:各腳本 PASS 之寫法不一(`PASS <名>`、`== <名>: PASS`、JSON 之 `"ok": true`),套單一 grep 樣式會算錯(2026-10-06 zz_accept 曾被算成 0/0,實為 9 段皆 PASS).各腳本之指令與判定見規則帳本第 7 節.

### 2.3 標頭與資料區水平錯位(issue #9,2026-10-20)

- **Playwright `locator.click()` 會把只露出一部分之元素捲入可見(置中),且連 `overflow:hidden` 之容器一併捲動**:標頭容器 `.ag-header-viewport` 被單獨捲動(hv>0),資料區 `.ag-center-cols-viewport` 不動(cv=0).ag-grid 只做資料區→標頭之單向同步(`horizontallyScrollHeaderCenterAndFloatingCenter`),故欄名對到相鄰欄資料.原生 ag-grid 同樣重現,與本套件標頭範本無關.規則見 R21.
- **真滑鼠點擊(`page.mouse.click` 於露出之部分)、鍵盤 Tab/方向鍵都不會單獨捲動標頭**:前者瀏覽器之滑鼠聚焦不捲入可見,後者 ag-grid 先 `ensureColumnVisible`.重現「半露欄名」一定要用 `locator.click()`(或程式 `scrollIntoView`/`focus()`),用座標點擊測不到.
- **標頭可捲範圍可能比資料區大 4px**(7 欄×150px、表寬 950 時 hv 最大 106、cv 最大 102):資料區已在最右時對末欄做 `scrollIntoView({ inline: 'center' })`,hv=106、cv=102 且資料區不再有 scroll 事件可觸發 ag-grid 同步,故補償須有第二階段(標頭還原為資料區位置).
- **ag-grid 水平捲動只認一個來源(`isControllingScroll`)**:使用者拖曳橫向捲軸(`.ag-body-horizontal-scroll-viewport`)後 500ms 內只認捲軸,其餘認資料區;被拒之寫入不更新捲軸位置、頂/底釘選列 translateX、欄虛擬化(實測 fake=300、cv=276、最右欄未渲染,但標頭與資料區 scrollLeft 相等,只比 hv/cv 或欄名/資料左緣量不出來).程式要移動水平位置時,資料區與捲軸元件兩處都寫,當下掌控者會走完整同步.
- **Playwright headless 以 `--hide-scrollbars` 啟動,無法用真滑鼠拖曳原生捲軸**(thumb 拖曳後 scrollLeft 不動);測捲軸路徑以程式捲動捲軸元件模擬(L5,登錄為偏離).
- **外審副本放在 repo 之 `./tmp/` 內時,審查者會沿父目錄找到 node_modules、dist、Playwright 而自行跑真瀏覽器**(2026-10-20 sol 與 minimax 皆如此,產出有實測價值但未持有 web 測試鎖);提示詞要明寫是否允許,或把副本放到無法上溯至 repo 之位置(不得放 `C:\opensrcOper` 下建立指向 node_modules 之連接點).
- **審查者之離線模型結論不等於真瀏覽器結論**:sol 以離線模型推演「拿掉 guard 仍綠」(F05),真瀏覽器變異則 M4→HS23、M5→HS24 皆轉紅;以變異實測為準.
- **src 與 `Edit` 之行尾**:`src/components/WAggridVue.vue` 為 CRLF;以腳本改 src 或比對字串時 `\n` 要換成 `\r\n`(變異腳本 `includes` 找不到變異點即此因).`grep -c $'\r'` 在 Git Bash 回 0 不可信,以 node 讀檔數 `\r\n` 為準.
- **變異測試作法**:腳本備份 src → 套用單點變異 → `node toolg/gDistRollupComps.mjs`(約 30 秒)→ 經 `quiet-run --lock` 跑單檔 → `finally` 還原 src 並重建 dist,結尾比對 src 與備份相同.變異執行期間不得改 src、dist、被測試檔.

### 2.4 貼上路徑與 kpCellEditable(Gitea issue #13,2026-10-28)

- **判斷 editable 一律委由 ag-grid 的 `column.isCellEditable(rowNode)`**(`Column.isColumnFunc`:布林直用、函數以 EditableCallbackParams 求值、其他型態為 false;非布林真值如 `1` 在 ag-grid 即不可編輯).不要讀 `colDef.editable` 後自行判斷真值——函數恆為真值是本案成因.`getAllGridColumns()` 回傳之 Column 物件即可呼叫,不需另讀 `getColumnDefs()`;colDef 以 `field` 為鍵,重複 keys 時 colId 為 `<key>_1`,與 field 對不上(修前以 field 查表之副作用).
- **filterall 生效時 `node.id` 不是 `vo.rows` 的索引**:`rowData` 綁 `filterRows`(過濾後子集),節點 id 為子集索引;修前 `rows[node.id]` 在 filterall 下寫到畫面以外之列(實測 filterall 顯示 r1、r2,貼 `P1\nP2` 寫入 r0、r1).寫入改用被判斷之 `node.data`(與 `vo.rows` 之列為同一物件,applyTransaction 依物件比對,故仍可更新).
- **headless 鍵盤 Ctrl+V 可測**:`page.context().grantPermissions(['clipboard-read','clipboard-write'])` 後 `navigator.clipboard.writeText(...)`,單擊儲存格(取得焦點)再 `keyboard.press('Control+V')`;headless 瀏覽器之剪貼簿與作業系統隔離,實測不動使用者剪貼簿(以 `Get-Clipboard` 核對為空).第一次 Ctrl+V 即貼上(未見 keydown 先於 paste 事件而取到舊文字).
- **單點變異驗證測試偵測力**:備份 src → Edit 變異 → 重建 dist → 單檔跑 → `cp` 備份還原 → 重建 dist 並 `cmp` 與修後 dist 逐位元相同.本輪三處變異各被不同格偵測(規則帳本 R22).
- **修前 dist 沙箱**:`git archive HEAD dist/w-aggrid-vue.umd.js | tar -x -C tmp/<名>/prefix`(archive 會把行尾轉 CRLF,內容等價);宿主頁複製一份指向它,測試檔複製後以 Edit 改 `pageUrl` 與 import 路徑,即可不動 repo 取得「修前紅」.
- **宿主頁記錄 editable 函數之呼叫要以旗標限定時段**(`window.__rec`):ag-grid 渲染時亦會呼叫 editable,不限定會混入渲染期之呼叫而無法斷言「貼上時每格恰 1 次」.
- **外審(terra)抓到首版兩個回歸,皆為「把舊行為的意外安全閥改掉」**:①修前以 `field` 為鍵建 editable 表,keys 重複時第二欄 colId 為 `<key>_1` 查不到而被略過;首版改為依 Column 物件判斷,卻仍以 colId 當資料鍵寫入,新增了 `a_1` 屬性。②首版通報訊息以模板字串轉型,拋出無原型物件時通報本身拋錯,整批失敗。改寫舊判斷時要先問「舊碼靠什麼意外條件才沒出事」,並為「判斷者可能拋錯」的每一層(含通報)加防護。
- **editable 函數在 Ctrl+V 自編輯器開啟中之儲存格時,看到的是編輯器已提交原生貼入文字後之資料**(ag-grid 編輯器處理原生 paste 後才輪到元件的 pasteText);要驗「判斷於寫入前」須讓編輯器未開(點擊後 Escape 保留焦點),見 PT13。
- **e2e 之 act 不以「宿主按鈕呼叫元件方法」代替使用者動作**(agv-run02,role-coder-for-test-e2e §4.1):貼上類格一律「寫剪貼簿(setup)→ 真滑鼠單擊起點格 → Escape(離開 singleClickEdit 開的編輯器)→ 真鍵盤 Control+V」;排序點表頭、過濾於過濾列輸入(`typeIntoFloatingFilter`),不用 grid API.完成訊號用「宿主 opt.rows 達預期終態」(預期含被貼入之格,故負向斷言也有正向訊號),不用固定等待;`waitUntilExist` 逾時時以 `deepStrictEqual` 呈現實際與預期之差異.
- **記錄 editable 函數呼叫之旗標在 Ctrl+V 前才開**:鍵盤版實測記錄窗內恰 3 次(b 欄 3 格各 1 次,貼上後 1.5 秒內 ag-grid 無額外求值);旗標要在單擊起點格之後、`keyboard.press` 之前開,單擊與渲染時 ag-grid 自身之呼叫才不混入.
- **新增測試檔也要過專案 eslint**(`node_modules/.bin/eslint --no-fix test/<檔>`;既有測試檔皆 0 錯):物件屬性需逐行(`object-property-newline`、`object-curly-newline`)、`brace-style`;案例表寫成多行物件,必要時 `eslint --fix` 只對自己的新檔.
- 掛有主控守門 hooks 的環境:PowerShell 字串內含 `>`(如 `'<null>'`)會被 `ps-redirect` 誤判為重導向寫檔,改寫不含 `>` 之字樣.
- **真滑鼠拖列(agv-run03,e2e-rowDrag)**:把手為 `.ag-row-drag`(列高 27px、把手 16×27);按住後先移開 8px 才算開始拖曳,再分段(steps 12)移到目標列把手中心 ±10px(越過其中線)才會換位;往下拖放開前續移到表格下方空白區(寫在宿主頁底部加 200px 空白區)才觸發 `rowDragLeave`(此時只有 leave、無 end 回呼);往上拖要離開表格須移到頁面頂端 y=4(表格上方為標題文字,從列往下續移會把列又拖回下方).完成訊號用 `rowDragChange` 回呼已記錄(與寫回 `opt.rows` 同一時點).
- **ag-grid 表頭排序狀態在 `aria-sort`(`ascending`/`descending`/`none`)**,不是 `.ag-header-cell` 的 class(`ag-header-cell-sorted-asc` 在內層 `.ag-cell-label-container`);選擇器用 `.ag-header-row-column .ag-header-cell[col-id=...]` 以免與浮動過濾列之格相混.升冪時列序與原序相同,等排序生效須用 `aria-sort` 而非列文字.
- **拖曳寫回的 `opt.rows` 要看新列序與欄位兩件事**:列序用畫面 `columnTexts` 驗、欄位用 `window.__vm.opt.<id>.rows` 的完整物件驗(`deepStrictEqual` 對 `{ro,note}` 這類不在 keys 內之欄位);只驗畫面或 `getNowData()`(依 keys 提取)會對「欄位消失」這個缺陷視而不見.
- **filterall 生效時拖曳會讓 `opt.rows` 只剩顯示子集**(rowData 為過濾後之子集,寫回的就是子集;與欄位保留無涉、修前修後相同),規則帳本第 6 節 #21.
- **變異驗證腳本化**(agv-run03,腳本 `mutate.mjs` 用完已自 repo 刪除,留存於 `dnow/20261028054319/agent-out/agv-run03-evidence/scripts/`):讀變異清單 json(`find` 須在 src 恰出現 1 次)→ 備份 src 與 dist 的雜湊 → 逐一套用、`node toolg/gDistRollupComps.mjs`、經 `quiet-run --lock` 跑指定測試檔 → `finally` 以備份位元組還原並比對雜湊.變異清單用單行字串(避免 CRLF 與縮排差異),例:令 Ctrl+V 條件失效 `param.event.code === 'KeyV'` → `'KeyW'`,令隱藏欄不略過 `continue //數據貼到隱藏欄位故跳過` → 註解.這樣可同時證明 e2e(真鍵盤)與 api(程式呼叫)兩層各自偵測不同缺陷.
- **e2e 共用 helper 放 `test/tools/e2e-setup.mjs`**:`cell`、`waitCellFocused`、`focusCell`、`pasteByKeyboard`、`hostRows`、`nowRows`、`waitRows`;宿主頁須提供 `window.__vm.opt[表格 id]` 與 `window.__vm.$refs[表格 id]`(表格 id 即選擇器 `#<id>` 去掉 `#`).

### 2.5 空表/過濾 0 筆覆蓋層與 localeText(Gitea issue #26,2026-10-30 agv-run01 修正輪)

- **ag-grid 31.3.4 之覆蓋層只在 `rowDataUpdated` 判斷**(`OverlayService.showOrHideOverlay`),判準 `paginationProxy.isEmpty()` 在 clientSide 模型為 `rootNode.allLeafChildren` 為空(**未過濾之全部列**)或欄位未就緒;表頭過濾使顯示列為 0 時不觸發,表格只剩表頭與空白(修前 HEAD dist 實測 `.ag-overlay` 為 `ag-hidden`).filterall 則不同:它改的是給 ag-grid 之 `rowData`(`filterRows`),rowData 為空 → ag-grid 自行顯示 noRows 覆蓋層(文字 `noRowsToShow`,即「無資料」,與真的無資料無從區分).兩種「過濾使然」之 0 列要分開處理:header 由本元件補顯示,filterall 只需換文字.
- **覆蓋層狀態無公開查詢,靠 DOM**:`.ag-overlay`(隱藏時帶 `ag-hidden`)內 `.ag-overlay-wrapper` 帶種類 class(`ag-overlay-loading-wrapper`、`ag-overlay-no-rows-wrapper`);**隱藏後 class 仍保留**,判斷「是否顯示」要同時看 `ag-hidden`.載入中覆蓋層只在宿主呼叫 `getApi().showLoadingOverlay()`(或 rowData/columnDefs 為 falsy)時出現;本元件傳 `[]` 故開頁不會自動出現載入中.
- **NoRowsOverlay/LoadingOverlay 於 `setTimeout` 內才取文字**(`localeTextFunc('noRowsToShow')`),所以「依狀態換文字」要在取文字當下判斷(`agGetLocaleText` 內讀 `getDisplayedRowCount`、`getGridOption('rowData')`),不能在顯示前預先設定;`getGridOption('rowData')` 是 ag-grid 實際採用之 rowData,比讀 Vue 的 `vo.rows` 不會在 prop 尚未傳進 ag-grid 時誤判.
- **ag-grid-vue 把 grid 事件包成非同步送達**(`globalEventListener` 走 ag-grid 的 async 佇列,`setTimeout(0)` 批次):`@modelUpdated` 之處理函數必在 ag-grid 同一輪同步邏輯(含 OverlayService 的 hide)之後執行,所以「ag-grid 自己先隱藏、我們再補顯示」之順序是確定的;代價是 rowData 換新且仍過濾為 0 時,覆蓋層可能閃隱一個 macrotask.
- **`api.showNoRowsOverlay()` 在資料非空時可用**(`manuallyDisplayed` 為 true,之後 `onNewColumnsLoaded` 不會因欄位重載而隱藏它);隱藏要用 `api.hideOverlay()`,且只該隱藏自己顯示者(`bOwnOverlay`)——ag-grid 自己顯示的 noRows(數據為空/filterall)與宿主顯示的 loading 不可動(OV17 守護).
- **浮動過濾列之輸入框沒有 placeholder**:`filterOoo` 只用於過濾彈窗(SimpleFilter)之輸入框;測 `localeText` 對非覆蓋層鍵生效,別用浮動過濾框的 placeholder,改用畫面上看得到的鍵(如 `loadingOoo` 之載入中覆蓋層)或直接取文字掛鉤(`api.getGridOption('getLocaleText')`).
- **測空表之頁面**:`openPage` 的 `minCells` 要給 0(空表無 `.ag-cell`,預設 1 會一直等);宿主頁用 `?g=o1,o5` 只建立所需之表,每格只載入該格要用的表.
- **ag-grid 的載入中覆蓋層會攔截指標事件**(蓋住整個表含表頭,`locator.click` 逾時並回報 `.ag-overlay-wrapper ... intercepts pointer events`);載入中時過濾只能由宿主程式(`setHeadFilter`/`clearHeadFilter`)進行,真使用者在載入中點不到表頭.noRows 覆蓋層則 `pointer-events: none`(實測 `.ag-overlay` 與 `.ag-overlay-wrapper` 皆 none),過濾 0 筆之覆蓋層顯示中仍可用真鍵盤改過濾框.
- **宿主換 `opt`(新物件、同一 `rows` 陣列)不會丟失表頭過濾**:實測過濾模型保留、列數維持 0、覆蓋層於約 20ms 內換文字或隱藏,中間無列數閃動(`tmp` 探測以頁內 10ms 取樣);`filterall` 改的是給 ag-grid 之 `rowData` 故為另一路徑(OV10 之快速序列:表頭過濾之清除有 500ms 防抖,於防抖作用前 rowData 換新會使浮動過濾框回填舊模型,測試要以過濾模型為空作訊號).
- **ag-grid 以動畫移除列**:覆蓋層文字出現時 `.ag-row` DOM 可能尚未移除(實測 3 列),斷言列數前先偵測等待到 0;不是元件缺陷.
- **外審(sonnet 讀碼,2026-10-30)找出 2 項,皆為我自己的測試與實作共同之盲點**:①文字更新守衛 `st.text !== ''` 把空字串當「尚未寫入」,與「空字串為有效覆寫」衝突;②覆蓋層以文件順序第一個 `.ag-overlay` 取得,巢狀表格(slot 內)會取錯.兩項在 36 格集上皆未被偵測(M17a、M18 之回退當時為存活或無對應格),補 OV28–OV30 後才被偵測——**變異回退「審查後之修正」本身,是檢驗補測是否到位的方法**.測試端之 helper 亦須限定本表之覆蓋層(`.ag-root > .ag-overlay`),否則裝飾用之巢狀殼會讓測試誤判.
- **w-table-vue 的 `WTableEdit`** 以 `{...vo.opt, language, rows, keys,...}` 加 `cloneDeep(vo.opt)` 逐鍵覆蓋組 `useOpt` 後 `:opt="useOpt"` 原樣給本元件(`WTableEdit.vue` 約 967–1050、228–232),新增之 `opt.localeText`、`opt.showOverlayWhenFilteredEmpty` 因此直接可用;只有 `language` 由 WTableEdit 自己的 prop 覆寫.

### 2.6 範例頁新增與驗證(Gitea issue #26 續,2026-10-30 agv-run02 修正輪)

- **README 不改(R18)**:agv-run01 曾依派工新增 README 兩節,主控裁定為派工之誤並撤回(agv-run02,以編輯還原內容,`git diff README.md` 為空).新選項與破壞性變更之對外說明寫在**範例頁之說明文字**與 `WAggridVue.vue` 之 JSDoc;發布時 script.txt 的 `modifyReadme.mjs` 會處理 README,不由本套件手改.
- **JSDoc 在 dist 內**:`dist/w-aggrid-vue.umd.js` 含 `@vue-prop` 說明字串,JSDoc 改一個字 dist 雜湊就變(行為不變);改 JSDoc 後要 `node toolg/gDistRollupComps.mjs` 重建,測試才與 src 同源.
- **docs/examples 隨發布才重產**(script.txt:gDistApp → gExtractHtml → gDocExams,gDistApp 會清空 docs/examples),所以新增範例後、發布前 `docs/examples` 沒有該頁,既有的 e2e-examples 系(以 `exampleUrl` 開 docs/examples)測不到.作法:`test/tools/exampleBuild.mjs` 自 `src/App<名稱>.vue` 當場產製同形頁(複製 gExtractHtml 之 head/選項與 gDocExams 之 CDN 換址)到 `test/_tmp/<案名>/`;**同形性以 BLD1 驗**(既有 5 個範例自 src 產製後與 docs/examples 逐字相同,僅 CDN 版號除外;實測 5/5 相同).gExtractHtml 之 head 或選項改動時須同步 `exampleBuild.mjs`.不要在測試中跑 gExtractHtml 本身:它清空並重寫 `test-html/`、重寫 `test-action/*.action.json`,其中入版控者(test-html 42 個、test-action 38 個)內容是否改變未驗,測試不應動入版控檔.
- **parseVueCode 的解析約束**(寫範例 .vue 時):`<template>` 取「第 3 行起、去掉最後 2 行」(根 `<div>` 與結尾 `</div>` 被丟棄,內容重新包進 `#app`),template 內不可再含 `<template>`;`data`、`mounted` 以「4 空格縮排之 `    data: function() {`」起、遇第一個「恰 4 空格後接 `}`」之行止,故區塊內縮排須 ≥ 8 空格;`import` 行不進產物,只能用頁面全域(`window.dataEasy`、`jv`);LF 檔會先被正規化為 CRLF.
- **自帶計時器之範例頁不以時間窗斷言中間態**:範例於 1–3 秒依序改過濾、清空數據,負載下計時器會延遲,「等 1 秒窗內的覆蓋層」會漏;改以 `openPage` 之 `initScript` 於載入前注入 MutationObserver,記錄各表(`.ag-root-wrapper` 依文件順序)「顯示列數＋本表覆蓋層可見文字」之歷程,事後依序比對各態出現(終態出現時前面各態必已記錄).表尚未建立之早期紀錄為空陣列,取欄位時要略過(首次執行即因 `ts[0]` 為 undefined 而紅,為測試端問題,與元件無關).
- **覆蓋層「顯示但文字尚空」是真實的中間態**:記錄器把它記為 `(blank)`,與「隱藏」(空字串)分開,否則「右表始終無覆蓋層」的斷言會把顯示中的空白覆蓋層當成隱藏;另斷言右表歷程非空,免得空洞通過.
- **範例頁之配色與寬度沿用既有**(role-coder-for-ui §4):警示/注記文字用範例既有之 `#f26`(AppUploadData、AppUploadDataWithConvertKeys 之注記色;勿另配新紅色);表格寬 620px(同其他範例,三欄預設各 200px 恰好放得下).曾把左右並排之兩表設成 480px,第三欄(price)被截掉,目視截圖才發現,現以 EXO1/EXO3 之 `colsVisible`(表頭各欄右緣皆在表格外框內)守護(變異 W1 被偵測).
- **eslint**:`no-regex-spaces` 不接受正則內連續空格,寫 `/ {4}/`.

### 2.7 淡入、state 與淡入期間改寬之補繪(Gitea issue #31,2026-11-01 agg31 修正輪)

- **現象屬實且與「就緒時間」無關**:最小重現(建議檔附 index.html、run.mjs;Vue 2.7.16、本套件 dist)HEAD 16 輪:預設旗標 2 種、e2e 確定性旗標 3 種;容器不帶過場、改寬後 `refreshCells({ force: true })`、`nofade=1`、`delay=1500` 各 1 種.修後預設與 e2e 旗標各 1 種,雜湊等於各自之 `tr=0`.像素種類以截圖 md5 計(次像素差異不會被容差比對看出,逐 byte 才是判準).
- **表格就緒約在掛載後 8ms**(宿主頁 `states[0].t` 對 `fadeStartAt` 實測 185ms → 192ms),所以「淡入期間」幾乎就是掛載後的前 0.5 秒;測試的時序前提(改寬落在淡入期間)不要用「掛載後 N ms」(隨表格就緒時間浮動),改相對淡入開始計時(`widenAtFade`),並在案例內先斷言前提.我一度以為 `hchg`(掛載後改高度)可造出「早於 opacity 結束之 height 過場」,實測 height 過場反而晚 16ms 結束(就緒只比改高度早 8ms,兩者起點差不到一幀),該前提不成立;改以 `bgAtFade`(淡入開始後 150ms 改外層 div 背景色,過場晚於 opacity 結束且不改尺寸)驗「他項過場進行中不算淡入結束」.
- **外層 div 為 `transition:all`**:width(`fitColumns` 改 `vo.width`)、height(prop 改變)、背景色等任一屬性之過場結束也會觸發 `transitionend`(冒泡到根),只認 `propertyName === 'opacity'` 或只認第一個事件都不夠;落定改以位準判斷(`getAnimations()` 無 pending/running 之 CSS 過場),事件為主訊號、0.8 秒後每 50ms 重查為後備,與 w-component-vue 2.5.35 `createTransitionState` 同法(已用 `npm pack` 取得原始碼閱讀,未引用).
- **補繪判準用尺寸比對,不用「有發過 resize」**:domDetect 於首次取得非 0 尺寸時必發一次 `resize`(`sold` 為 0),若見 resize 即補繪,則每個表格都會多重繪一次;以淡入開始時 `offsetWidth/offsetHeight` 為基準,差 > 1px 才記為改變,且記為改變後每次 resize 皆重新等穩定(尺寸可能變回原值).去抖動用獨立之 `debounce(200)`(wsemi `debounce` 只保留最後一個任務,與 `fitColumns` 之 `dbc` 共用會互相取代).
- **refresh 與 state 的先後在同一個 JS 工作內,屬性值由 Vue 於 microtask 更新**,所以測試端「補繪當下屬性仍為 showing」無法鑑別「先設 shown 再補繪」之錯誤順序(兩者等價可觀察);程式碼順序(補繪 → `unwatchFade` → `state = 'shown'`)靠讀碼,不靠測試.
- **「尺寸變化與淡入結束同幀」的事件順序要以實測為準,不要憑規範記憶**:以宿主程式「改寬後同步卡住主執行緒 700ms」造出該情境(`stallWidenAtFade`),實測 Chromium 同一幀內 ResizeObserver 回呼(988.8ms)比 `transitionend`(989.8ms)早約 1ms;但元件拿到的是 domDetect 以 `setTimeout(…,1)` 延後送出之 `resize`,仍晚於 `transitionend`,所以 `transitionend` 處理當下元件的 `resized` 旗標為 false(宿主頁以白箱讀 `hdFade.resized` 記錄,FD12 時序輸出)——「淡入結束時再量一次 `offsetWidth/Height`」因此必要(M13 被 FD12 偵測)。測試的前提不要寫成「宿主端 RO 記錄晚於 transitionend」(首次實跑即因此誤紅),要寫成元件端可觀察的狀態(旗標)或只斷言結果。
- **「冗餘防護」會讓單一變異存活,屬預期**:M8(停用 `checkFadeResize`)只被 FD5 偵測,FD4 與 FD12 仍綠,因淡入結束時再量尺寸補上了同一判斷;不為此放寬測試,但報告要註明存活的案例是哪幾個、為何。
- **補強測試的盲點來自「斷言在實作缺漏時仍恆真」**:銷毀後 `getApi()` 為 null 使補繪本來就不執行,只斷言「補繪 0 次」抓不到計時器未清除(M10);ag-grid 的 `api.destroy()` 以 `Object.defineProperties` 覆寫所有 api 方法,宿主包裝的 `refreshCells` 在銷毀後也被蓋掉,只認包裝次數同樣抓不到(M11),要看 ag-grid 的銷毀後呼叫警告或元件的 `state`/`hdFade`。
- **ag-grid 對本元件儲存格的重繪(`refreshCells({ force: true })`)是銷毀 renderer 再建新的 `span` 與文字節點**(函數型 cellRenderer 被包成 Adapter,`refresh()` 恆回 false);測「沒有被重繪」可為資料區每個元素與文字節點加標記,事後找無標記節點(FD6),並以手動 `refreshCells` 對照證明標記法偵測得到(FD7)。標記前須等各儲存格 renderer 已建立(`firstElementChild` 皆存在),ag-grid 以 animation frame 任務分批建立。
- **範例產製管線會改寫說明文字中的 `WAggridVue`**:extractHtml 把文字裡的 `WAggridVue` 換成 `w-aggrid-vue`(`CompCssWAggridVue` 變 `CompCssw-aggrid-vue`,範例中給使用端抄的選擇器就錯了).範例說明文字改以 HTML 實體 `W&#65;ggridVue` 書寫,EXS1 比對頁面渲染後之文字.JSDoc 不經此管線.
- **dist 內程式碼為壓縮後之單行**:變異檔以字串取代產生(每個取代字串須在 dist 內恰出現 1 次,`mkmut.mjs` 檢核),且 dist 內另有一份未壓縮之 SFC 原始碼字串(`\r\n` 跳脫),取代字串要取壓縮後那份(勿含 `\r\n`).
- **測試鎖排隊很長時(本輪 2 個槽被他套件佔住 1 小時以上;第一次排鎖 23:47 → 00:03 約 16 分鐘取得)的作法**:所有瀏覽器工作寫成一支 `session.mjs`(依序:修前重現、修後重現、新測試、換入 HEAD dist 之修前、換入各變異檔、範例相關、全套),以 `nohup node quiet-run.mjs --lock --lock-wait 10800 -- node session.mjs` 脫離工具逾時單次排鎖;腳本於取得鎖後才讀檔,故排隊期間仍可修改腳本與測試;換入 `dist/` 者於 `finally` 還原並以雜湊核對(開頭先核對 `dist` 等於備份,不等則中止).一個指令一取一放,逐項排隊每次都要重排到隊尾.排隊期間要改碼/測試時,於 `session.mjs` 開頭加「`hold` 旗標檔存在則等其消失(上限 25 分鐘)」,改完刪旗標,鎖提早到也不會用到改一半的檔案;編輯 `session.mjs` 本身可,已啟動之行程不受影響(Node 已載入),但其命令列與環境變數固定,新增行為用旗標檔(`want_p4`、`skip_p4`)而非環境變數.本輪因鎖被他套件長時間佔住(一槽自 00:08 起被占 2 小時以上),共取鎖 4 次、等鎖合計約 2 小時 10 分(16 + 38 + 48 + 29 分),每次取鎖前務必把該次要驗的全部放進同一支腳本.

## 3. 相依套件之非顯而易見行為

### wsemi

- **`isearr` 單元素特例**:長度為 1 且唯一元素為「空」(`{}`、`''`、`null`、`[]`)時回 false.所以 `ltdtmapping([{}], keys)` 回 `[]`(只有 1 列空物件時取代模式會清空整張表);`[[]]` 為 false 而 `[[],[]]` 為 true.不可拿 `isearr` 當「非空陣列」或二維判準.
- **`ltdtkeys2mat`**:任一列非有效物件即整批回 `[]`(不是只丟該列);非字串非數值之值走 `o2j`,null 成為字串 `'null'`、Date 成為含引號之 JSON 字串.`returnWithStateAndMsg` 對 `[]` 也回 error,不能用來區分「無數據」與「列無效」.
- **`cstr`**:非字串、非數值、非 Symbol、非 BigInt 一律回 `''`(Date 會變空字串).
- **`haskey`** 用 `key in obj`(含原型鏈、不解析路徑);`ltdtmapping` 取值用 lodash `get`(會解析 `a.b` 路徑).判斷「列有沒有這個鍵之值」要與取值一致,用 `get(row, key) !== undefined`.
- **`ispm`** 只認原生 Promise 與帶 then 之函數,不認一般 thenable 物件;非同步路徑一律用原生 `await`.
- **`isDate`** 預設會解析字串(`'2024-01-02'` 為 true);判斷 Date 實例要用 `isDate(v, { onlyCheckDateObject: true })`(1.9.10 起).
- **`isp0int`** 接受整數字串(`'1'`);`Infinity` 預設會通過,加 `{ useLimitSafe: true }` 才排除.
- **`downloadExcelFileFromData`** 寫檔器拒絕時以 resolve 回 `{ error }`;觸發下載(Blob、createObjectURL)或 Node 寫檔之例外則使 async 函數 reject,所以 `.then` 檢查 `{ error }` 與 `.catch` 兩者都要(2026-10-07 更正:原載「.catch 幾乎是死碼」不成立).分頁名不合法、欄數超限要到 hucre 寫檔時才失敗,所以要在呼叫前同步檢查.
- **`isstr`／`isestr` 以 `Object.prototype.toString` 判斷**,`new String('x')` 亦為 true;hucre 要求 `typeof === 'string'`,傳給它的字串要以 typeof 判斷.
- **`domShowInputAndGetFilesU8Arrs`**:取消選檔以空陣列 resolve;檔案超過 1000 MB 以「索引→訊息」物件 reject;每次呼叫先移除前一個隱藏 input.
- **讀檔器 `getDataFromExcelFileU8Arr`**:首列為表頭,空表頭之欄略過,重複表頭後者覆蓋前者,不 trim;整列皆 null 之列略過,含空字串儲存格之列保留;值預設讀成字串.**1.9.9 把日期讀成 `''`**(2026-08-17 改用 hucre 時之退化),**1.9.10 起讀為 `'YYYY-MM-DDTHH:mm:ss.SSS'`**(UTC 分量,與時區無關),日期表頭亦同.
- **寫檔器**以 Date 之 UTC 瞬間換算序號:在 +08:00 以本地午夜建立之 Date 會寫成前一天 16:00.

### hucre(wsemi 之 xlsx 讀寫器)

- 儲存格值型別只有 `string | number | boolean | Date | null`;套日期格式之數值讀為 Date,其 UTC 分量即 Excel 畫面上之日期時間.
- 分頁名規則在 `dist/_validate.mjs`(長度以 `name.length` 計 UTF-16 碼元至多 31、不含 `[ ] : * ? / \`、首尾非單引號、不可為 history).`downloadCore` 照抄此規則,**hucre 升版時要比對是否改變**(1.1.0→1.2.0 未變);逐項比對與現存之不一致見規則帳本 R16.
- lodash `size` 對字串計 Unicode 碼位(16 個 😀 為 16),與 `.length`(32)不同;要與 hucre 之長度判準一致須用 `.length`(2026-10-06 實測).
- **寫檔器逐格以 colToLetter 驗欄索引**(對象是最終二維陣列之每一列,不是 keys 數);**不檢查列數**,但讀檔器拒讀超過 1048576 列之檔(`MAX_ROW_INDEX` 只在讀檔器).百萬列之二維陣列可共用同一個列陣列,瀏覽器約 1 秒即產出,記憶體不是瓶頸(2026-10-07 複審實測推翻「無法實測」之推測).
- **一般物件會被當成 inline cell**(取 value、formula、style、richText…):`{ value: 'x' }` 寫成 'x'、帶 formula 者寫成公式(讀回空白)、style 非物件則寫檔拋 `Invalid value used as weak map key`;其餘物件、陣列、NaN 等寫成空白格;'#N/A' 等寫成 Excel 錯誤值、讀回仍為原字串.詳見規則帳本第 6 節 #10、#12.

### ag-grid community 31.3.4

- `getColumnState()` 之順序不反映固定欄位置;畫面欄序要用 `getAllDisplayedColumns()`(與 ag-grid 匯出相同).本套件 `kpHeadFixLeft` 會設 `pinned: 'left'`,w-table-vue 之 `fixIds` 即轉為 kpHeadFixLeft.
- valueFormatter 之 row 為 `params.data`(完整列),下載時格式化函數也必須拿完整來源列,否則讀其他欄之格式化結果會與畫面不同.
- `getApi()` 在元件銷毀後回 null;掛載後、gridReady 前 api 已存在.`downloadData` 不需要 grid api,可於表格就緒前呼叫.
- **`getColumnFilterInstance(key)` 對沒有過濾器之欄(`filter: false`)或不存在之 key 永不 resolve**(`getFilterInstanceImpl` 找不到 column 或 filterPromise 時不呼叫 callback);對有過濾器之欄以 `setTimeout(callback, 0)` 回呼.逐欄 await 它會整個卡住,讀過濾狀態改用同步之 `getFilterModel()`／`getColumnFilterModel(key)`(2026-10-06 實測 getFilters 因此不結束、filterChange 永不觸發).
- **資料型別推斷等待首批數據時**(表格建立時 rows 為 [] 且未指定 cellDataType),`setColumnFilterModel` 把請求排入佇列,回傳之 Promise 要到首次給予數據列才 resolve;`setFilterModel` 亦排隊但同步返回.
- **`setFilterModel` 於模型確實改變時自行呼叫 `onFilterChanged`**;`setColumnFilterModel` 不會,須自行呼叫.兩者都呼叫會使 filterChange 發 2 次(2026-10-07 之 clearHeadFilterAll).
- **`getFilterModel()` 之鍵序為過濾器之建立順序**,不是欄序;要依欄序輸出須自行依 keys 迭代,且以 `fm[key]` 取值(key 含 '.' 時 lodash get 會解析為路徑).
- **computed 內同步呼叫 async 方法時**,該方法在第一個 await 之前讀到的響應式資料都會成為 computed 之依賴(2026-10-07:changeFilterall 經 getFilters 之 `cloneDeep(vo.keys)` 依賴了 keys,opt 換新陣列即多發事件);不要的依賴要放到 await 之後讀.
- **`api.destroy()` 後**:`$refs.agv.api` 仍在,`isDestroyed()` 為 true,其餘方法被換成「console.warn 後回 undefined」;判斷表格可用要同時看 null 與 `isDestroyed()`.
- `uploadData` resolve 時表格已更新,`opt.rowsChange` 於其後觸發;resolve 之陣列即 `opt.rows` 本身.

## 4. 下載與上傳路徑之契約

已移至 `sgud/rule/rulebook.md`(R01–R04、R12–R17,含站點、盤點指令與測試格表),本檔不重複記載.當時之分析檔(`tmp/dl-修正-全盤.md`、`tmp/ul-修正-全盤.md`)可能已清除.

## 5. 下游 w-table-vue 之連動

- w-table-vue 與 w-component-vue 由其他 agent 負責,**本 repo 之 agent 不得修改**;需要連動時在本 repo 根寫 `建議w-table-vue調整.md` 這類文件(使用者可能改名),內容引用以函式名、prop 名定位,因該檔行號經常漂移.
- `WTableEdit.downloadData(mode)` 以 try/catch 包住呼叫、同步呼叫完即發 success,所以本套件同步拋錯就會變成 error 事件;其 catch 丟棄 err 內容.
- `WTableEdit.uploadData(uploadModeSelect)` 包裝 beforeUpload:未給呼叫端 hook 時去除「useKeys 各值皆空」之列,處理後無數據即 reject 哨兵 `errNoEffData` 並以參照比對;`uploadModePreset` 只放行 `'replace'`、`'append'`.
- 驗收時可在本 repo 之測試頁逐字仿照 WTableEdit 之呼叫形狀與包裝,但要在文件中註明「仿照所測,非在 w-table-vue 內執行」.

## 6. 使用者之裁示與偏好

- **選項處理之統一風格**:無效即預設＋console 說明(見規則帳本 R01).即使 uploadMode 誤植會以 `'replace'` 清掉表格,使用者知悉後仍採此風格.擬方案時直接遵循,不要再提「無效選項 reject」.
- **呼叫端責任**:kpCellFormat 之回傳值原樣使用,套件不偵測、不轉換(例如不檢查 Promise);空值交不交給格式化函數由呼叫端決定.
- **不問 commit**,使用者自行提交;使用者也可能自行改名或移動 agent 產出之文件,先 `ls`／`git status` 確認現況再動.
- 外部提報文件(`建議*.md`)會被使用者更新;收到「請確認」時先 diff 新舊版本,只回報實際改動與對方案之影響.

## 7. 派工複審(n 個 Opus＋m 個 Sol)

- **隔離**:每位審查者一個 `git worktree`(以 HEAD 建立,**不含未提交之改動**;使用者可能在派工前剛提交,先看 `git log -1`),`node_modules` 以 junction 指向主 repo.
- **複製檔案會保留修改時間**:`fs.copyFileSync` 保留 mtime,git 可能不顯示為已修改;要確認內容以 `git hash-object` 比對.
- **限制句要點名暫存資料夾**:只寫「worktree 以外」擋不住寫入 `%TEMP%`、scratchpad(2026-10-06 兩位 Opus 皆犯);須寫明下載、暫存一律放 worktree 之 `tmp/`.收回後核對主 repo `git status` 與 `ls -A node_modules | wc -l`.
- **探測**:以與正式派工逐字相同之限制句,驗讀檔 canary、寫檔落地、能跑 node 與 Playwright;Sol 之探測順便確認額度.
- **清理 junction**:本 repo 路徑含中文,自 Git Bash 執行 `cmd //c rmdir` 會失敗(找不到路徑);改用 node 以 `lstatSync(p).isSymbolicLink()` 確認後 `rmdirSync(p)`(非遞迴,只移除連結).**不可 `rm -rf`**,會沿 junction 刪掉主 repo 之 node_modules.之後 `git worktree remove --force`、`git worktree prune`.
- **採納**:每條發現都對照原始碼或實測核對後才採納;審查者意見分歧時,以有原型實測之一方為重(例:列判準 `isobj` 與 `iseobj`).
- **等待**:VS Code 外掛內 cron／ScheduleWakeup 不會觸發;派工以 `nohup` detached 執行,等待用背景 Bash 迴圈(`timeout` 7200000、單段 6900 秒).

## 8. 自有套件升版(wsemi 等)

- 使用者發布後 npm 可能延遲數分鐘才出現新版:以背景迴圈每 120 秒執行 `npm view <套件>@<版本> version --prefer-online`(`--prefer-online` 略過本機快取),出現即 `npm i <套件>@<版本>`;**以 `node_modules/<套件>/package.json` 之 version 判定安裝成功**,不看 npm 離開碼.
- 安裝後要確認:npm 上之內容與本機開發 repo(wsemi 在 `C:\opensrc\開源-JS-002-3-wsemi\wsemi`)之提交一致(比對改動之原始碼檔),以及**連帶升版之相依**(wsemi 1.9.10 把 hucre 升為 1.2.0),再重建 dist 跑完整回歸.

## 9. 踩過的錯

- **數字要從輸出重數,不要憑記憶**:曾把 kpCellFormat 驗收之 11 項回報成 13 項.
- **引用要核對 file:line**:曾把 lint 規則出處寫成 `.eslintrc.js:159`(實在 eslint-config-standard),把範例路徑寫成 `test-html/`(實在 `docs/examples/`),皆被審查者指出.
- **方案只沿投訴那一句走會漏格**:下載修正初版只修了表頭錯位、空陣列還原與無訊號失敗,審查者補出 disp 依可見欄取值、表頭陣列別名、固定欄序、null 寫成 `'null'`、格式化函數之 row 等漏格;動手前先依系統列舉輸入空間(入口 × 欄位狀態 × 掛鉤行為 × 選項 × 值型別),並以同類產品(ag-grid 匯出、SheetJS)對照.
- **issue 指出的站點只是入口之一**(2026-10-28 #13):建議書只列「函數被存成表、以真值判斷」,盤點整條貼上路徑後才發現另一個同族缺陷——寫入以 `node.id` 索引全集,filterall 時寫錯列,使逐列唯讀亦可被繞過;評估一條路徑時要確認「被判斷的那一格」與「被寫入的那一格」是同一格.
- **修一處要回看兄弟路徑**:表頭改用 `useKeys` 時,把原本只在 raw 之別名問題帶進了 disp;兩條路徑收斂成共用流程後,要逐條比對兩者原本之差異(取值來源、複製深度、格式化之 row)是否都該保留.
