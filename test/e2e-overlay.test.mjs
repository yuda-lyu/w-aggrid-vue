//空表與過濾 0 筆之覆蓋層、opt.localeText、opt.showOverlayWhenFilteredEmpty(Gitea issue #26; 規則帳本 R24、R25)
//使用者路徑: ①開宿主頁(test/pages/overlay.html 以 ?g= 指定所需之表) ②於表頭浮動過濾列或宿主之全表搜尋框以真鍵盤輸入, 或點宿主按鈕(宿主端更換 opt、顯示載入中)
//③看到表格之覆蓋層文字(空表、過濾 0 筆、載入中)與列數 ④輸入 zzz、Toy 等 ⑤比對覆蓋層是否顯示與其文字、列數 ⑥無副作用
import assert from 'assert'
import { openPage, pageUrl, typeIntoFloatingFilter, assertNoErrors } from './tools/e2e-setup.mjs'
import { waitUntilExist } from './tools/e2eLib.mjs'

//內建文字(規格: 2.1.14 起之內建字典; 空表之 noRowsToShow 未改)
const T_EMPTY = { 'zh-tw': '無資料可顯示', 'en': 'No Rows To Show', 'zh-cn': '无数据可显示' }
const T_FILTERED = { 'zh-tw': '無符合過濾條件之資料', 'en': 'No Rows Match The Filter', 'zh-cn': '无符合过滤条件的数据' }

//url, 宿主頁之網址並指定要建立之表
function url(g) {
    return `${pageUrl('overlay.html')}?g=${g}`
}

//open, 開宿主頁; 數據為空之表無儲存格, minCells 為 0
function open(g, minCells = 1) {
    return openPage(url(g), { minCells })
}

//overlayInfo, 某表覆蓋層之使用者可見狀態: 是否顯示、種類、可見文字、位置(相對於表格外框)
function overlayInfo(page, sel) {
    return page.evaluate((s) => {
        let root = document.querySelector(`${s} .ag-root-wrapper`)
        //本表自己之覆蓋層(.ag-root 之直接子節點); 不取表頭或儲存格內之巢狀物
        let ov = document.querySelector(`${s} .ag-root > .ag-overlay`)
        let shown = !!ov && !ov.classList.contains('ag-hidden') && getComputedStyle(ov).display !== 'none'
        let wrap = ov ? ov.querySelector('.ag-overlay-wrapper') : null
        let type = ''
        if (shown && wrap) {
            type = wrap.classList.contains('ag-overlay-loading-wrapper') ? 'loading' : (wrap.classList.contains('ag-overlay-no-rows-wrapper') ? 'norows' : 'other')
        }
        let txt = shown && wrap ? wrap.querySelector('.ag-overlay-no-rows-center, .ag-overlay-loading-center') : null
        let r = root.getBoundingClientRect()
        let hd = document.querySelector(`${s} .ag-header`).getBoundingClientRect()
        let tr = txt ? txt.getBoundingClientRect() : null
        return {
            shown,
            type,
            text: shown && wrap ? wrap.innerText.trim() : '',
            textRect: tr ? { left: tr.left, top: tr.top, right: tr.right, bottom: tr.bottom } : null,
            rootRect: { left: r.left, top: r.top, right: r.right, bottom: r.bottom },
            headerBottom: hd.bottom,
        }
    }, sel)
}

//waitOverlay, 偵測等待某表之覆蓋層顯示且文字為預期(偵測式, 不用固定秒數); 逾時附當下狀態
async function waitOverlay(page, sel, text, type = 'norows', timeout = 8000) {
    try {
        await waitUntilExist(page, `${sel} 覆蓋層為 ${type}/${text}`, ({ s, t, ty }) => {
            let ov = document.querySelector(`${s} .ag-root > .ag-overlay`)
            if (!ov || ov.classList.contains('ag-hidden')) {
                return false
            }
            let wrap = ov.querySelector('.ag-overlay-wrapper')
            let cls = ty === 'loading' ? 'ag-overlay-loading-wrapper' : 'ag-overlay-no-rows-wrapper'
            return !!wrap && wrap.classList.contains(cls) && wrap.innerText.trim() === t
        }, { timeout, arg: { s: sel, t: text, ty: type } })
    }
    catch (err) {
        throw new Error(`${err.message}; 當下為 ${JSON.stringify(await overlayInfo(page, sel))}`)
    }
}

//waitNoOverlay, 偵測等待某表之覆蓋層隱藏
async function waitNoOverlay(page, sel, timeout = 8000) {
    try {
        await waitUntilExist(page, `${sel} 覆蓋層隱藏`, (s) => {
            let ov = document.querySelector(`${s} .ag-root > .ag-overlay`)
            return !ov || ov.classList.contains('ag-hidden')
        }, { timeout, arg: sel })
    }
    catch (err) {
        throw new Error(`${err.message}; 當下為 ${JSON.stringify(await overlayInfo(page, sel))}`)
    }
}

//rowCount, 某表目前顯示之列數
function rowCount(page, sel) {
    return page.evaluate((s) => document.querySelectorAll(`${s} .ag-center-cols-container .ag-row`).length, sel)
}

//waitRowCount, 偵測等待某表顯示之列數為 n
async function waitRowCount(page, sel, n, timeout = 8000) {
    await waitUntilExist(page, `${sel} 列數為 ${n}`, ({ s, m }) => document.querySelectorAll(`${s} .ag-center-cols-container .ag-row`).length === m, { timeout, arg: { s: sel, m: n } })
}

//typeHostSearch, 於宿主之全表搜尋框以真鍵盤輸入(先全選刪除既有內容)
async function typeHostSearch(page, sel, text) {
    await page.click(sel)
    await page.keyboard.press('Control+A')
    await page.keyboard.press('Backspace')
    if (text !== '') {
        await page.keyboard.type(text)
    }
}

//assertNoOverlayWindow, 否定斷言: 條件已達(呼叫端先以偵測等待到達終態)後再觀察一段短暫窗, 確認覆蓋層未出現
async function assertNoOverlayWindow(page, sel, ms = 700) {
    await page.waitForTimeout(ms)
    let info = await overlayInfo(page, sel)
    assert.strictEqual(info.shown, false, `${sel} 不應顯示覆蓋層: ${JSON.stringify(info)}`)
}

describe('e2e-overlay:空表與過濾 0 筆之覆蓋層、localeText', function() {
    let ctx = null

    afterEach(async function() {
        if (ctx) {
            await ctx.close()
        }
        ctx = null
    })

    describe('空表之提示文字(opt.localeText.noRowsToShow)', function() {

        it('OV1 空表未給 localeText:顯示內建「無資料可顯示」(未給時行為不變)', async function() {
            ctx = await open('o1', 0)
            //spec: opt.localeText 未給時行為不變
            await waitOverlay(ctx.page, '#o1', T_EMPTY['zh-tw'])
            assert.strictEqual(await rowCount(ctx.page, '#o1'), 0)
            assertNoErrors(ctx)
        })

        it('OV2 空表給 localeText={noRowsToShow:"無數據"}:顯示「無數據」(建議 3.1)', async function() {
            ctx = await open('o2', 0)
            //spec: 空表之覆蓋層文字為覆寫字典之值
            await waitOverlay(ctx.page, '#o2', '無數據')
            const info = await overlayInfo(ctx.page, '#o2')
            assert.notStrictEqual(info.text, T_EMPTY['zh-tw'])
            assertNoErrors(ctx)
        })

        it('OV3 空表 en 與 zh-cn:各自之內建文字', async function() {
            ctx = await open('o3,o4', 0)
            await waitOverlay(ctx.page, '#o3', T_EMPTY.en)
            await waitOverlay(ctx.page, '#o4', T_EMPTY['zh-cn'])
            assertNoErrors(ctx)
        })

        it('OV4 數據為空時在全表搜尋框輸入文字:仍為空表文字,不得換成過濾 0 筆之文字', async function() {
            ctx = await open('o1', 0)
            await waitOverlay(ctx.page, '#o1', T_EMPTY['zh-tw'])
            await typeHostSearch(ctx.page, '#fa1', 'zzz')
            //等 filterall 已作用於元件(輸入框已有值後讓 ag-grid 處理一輪); 否定斷言用短暫觀察窗
            await ctx.page.waitForTimeout(700)
            const info = await overlayInfo(ctx.page, '#o1')
            //spec: 資料本身為空時維持 noRowsToShow
            assert.strictEqual(info.text, T_EMPTY['zh-tw'], JSON.stringify(info))
            assert.strictEqual(info.type, 'norows')
            assertNoErrors(ctx)
        })

        it('OV31 數據為空時在表頭浮動過濾框輸入文字:仍為空表文字(資料本身為空與過濾源無關)', async function() {
            ctx = await open('o1', 0)
            const { page } = ctx
            await waitOverlay(page, '#o1', T_EMPTY['zh-tw'])
            await typeIntoFloatingFilter(page, '#o1', 1, 'zzz')
            //等表頭過濾已作用(防抖; 列數本來就是 0, 以過濾模型出現為訊號), 再看覆蓋層(否定斷言: 未換成過濾 0 筆文字)
            await waitUntilExist(page, 'o1 表頭過濾已作用', () => Object.keys(window.__vm.$refs.o1.getApi().getFilterModel()).length === 1, { timeout: 8000 })
            await page.waitForTimeout(700)
            const info = await overlayInfo(page, '#o1')
            assert.strictEqual(info.text, T_EMPTY['zh-tw'], JSON.stringify(info))
            assert.strictEqual(info.type, 'norows')
            assertNoErrors(ctx)
        })

        it('OV5 其他鍵(loadingOoo)亦可覆寫:宿主顯示載入中時文字為覆寫值,未覆寫者仍為內建「載入中...」', async function() {
            ctx = await open('o12,o16')
            const { page } = ctx
            //spec: 鍵同 ag-grid 之 locale 鍵, 覆寫字典對所有鍵生效(此處以畫面上看得到的載入中覆蓋層驗)
            await page.click('#btnShowLoading12')
            await page.click('#btnShowLoading16')
            await waitOverlay(page, '#o12', '載入中...', 'loading')
            await waitOverlay(page, '#o16', '讀取中，請稍候…', 'loading')
            assertNoErrors(ctx)
        })
    })

    describe('過濾成 0 筆之覆蓋層(預設開啟)', function() {

        it('OV6 表頭過濾成 0 筆:顯示「無符合過濾條件之資料」,位於表頭下方且不擋過濾框;清空過濾後消失、列恢復(建議 3.2)', async function() {
            ctx = await open('o5')
            const { page } = ctx
            assert.strictEqual(await rowCount(page, '#o5'), 3)
            assert.strictEqual((await overlayInfo(page, '#o5')).shown, false)

            await typeIntoFloatingFilter(page, '#o5', 1, 'zzz')
            await waitRowCount(page, '#o5', 0)
            //spec: 過濾使顯示列數為 0 且資料列數大於 0 時顯示覆蓋層與過濾 0 筆之文字
            await waitOverlay(page, '#o5', T_FILTERED['zh-tw'])
            const info = await overlayInfo(page, '#o5')
            assert.strictEqual(info.type, 'norows')
            //文字在表格外框內、表頭下方(使用者看得到, 不被表頭蓋住)
            assert.ok(info.textRect.top >= info.headerBottom - 0.5, `文字應在表頭下方: ${JSON.stringify(info)}`)
            assert.ok(info.textRect.bottom <= info.rootRect.bottom && info.textRect.left >= info.rootRect.left && info.textRect.right <= info.rootRect.right, JSON.stringify(info))

            //覆蓋層顯示中仍可用真鍵盤改過濾框(覆蓋層不擋輸入): 清空後覆蓋層消失、3 列恢復
            await typeIntoFloatingFilter(page, '#o5', 1, '')
            await waitRowCount(page, '#o5', 3)
            await waitNoOverlay(page, '#o5')
            assertNoErrors(ctx)
        })

        it('OV7 過濾 0 筆後改成有符合者:覆蓋層隱藏、列為符合者', async function() {
            ctx = await open('o5')
            const { page } = ctx
            await typeIntoFloatingFilter(page, '#o5', 1, 'zzz')
            await waitOverlay(page, '#o5', T_FILTERED['zh-tw'])
            await typeIntoFloatingFilter(page, '#o5', 1, 'Toy')
            await waitRowCount(page, '#o5', 1)
            await waitNoOverlay(page, '#o5')
            assertNoErrors(ctx)
        })

        it('OV8 數字欄過濾成 0 筆:同樣顯示過濾 0 筆文字(過濾器型別 num)', async function() {
            ctx = await open('o5')
            const { page } = ctx
            await typeIntoFloatingFilter(page, '#o5', 3, '999999')
            await waitRowCount(page, '#o5', 0)
            await waitOverlay(page, '#o5', T_FILTERED['zh-tw'])
            await typeIntoFloatingFilter(page, '#o5', 3, '')
            await waitRowCount(page, '#o5', 3)
            await waitNoOverlay(page, '#o5')
            assertNoErrors(ctx)
        })

        it('OV9 全表搜尋(filterall)使顯示 0 筆:顯示過濾 0 筆文字(非空表文字);清空後消失', async function() {
            ctx = await open('o5')
            const { page } = ctx
            await typeHostSearch(page, '#fa5', 'zzz')
            await waitRowCount(page, '#o5', 0)
            //spec: 資料列數 > 0 而顯示列數為 0 的成因包含 filterall; 此時資料並非空, 不得顯示 noRowsToShow
            await waitOverlay(page, '#o5', T_FILTERED['zh-tw'])
            await typeHostSearch(page, '#fa5', '')
            await waitRowCount(page, '#o5', 3)
            await waitNoOverlay(page, '#o5')
            assertNoErrors(ctx)
        })

        it('OV10 表頭過濾與 filterall 並存:清掉表頭過濾後 filterall 仍為 0 筆,覆蓋層仍在;全清後消失', async function() {
            ctx = await open('o5')
            const { page } = ctx
            await typeIntoFloatingFilter(page, '#o5', 1, 'zzz')
            await waitOverlay(page, '#o5', T_FILTERED['zh-tw'])
            await typeHostSearch(page, '#fa5', 'qqq')
            await typeIntoFloatingFilter(page, '#o5', 1, '')
            //等表頭過濾清除已作用(浮動過濾框有防抖; 此時列數本來就是 0, 無法以列數判斷, 改偵測過濾模型為空)
            await waitUntilExist(page, 'o5 表頭過濾已清除', () => Object.keys(window.__vm.$refs.o5.getApi().getFilterModel()).length === 0, { timeout: 8000 })
            //表頭過濾已清, filterall 'qqq' 仍使顯示 0 筆
            await waitRowCount(page, '#o5', 0)
            await waitOverlay(page, '#o5', T_FILTERED['zh-tw'])
            await typeHostSearch(page, '#fa5', '')
            await waitRowCount(page, '#o5', 3)
            await waitNoOverlay(page, '#o5')
            assertNoErrors(ctx)
        })

        it('OV11 內建過濾 0 筆文字:en 與 zh-cn', async function() {
            ctx = await open('o8,o9')
            const { page } = ctx
            await typeIntoFloatingFilter(page, '#o8', 1, 'zzz')
            await typeIntoFloatingFilter(page, '#o9', 1, 'zzz')
            await waitOverlay(page, '#o8', T_FILTERED.en)
            await waitOverlay(page, '#o9', T_FILTERED['zh-cn'])
            assertNoErrors(ctx)
        })

        it('OV12 localeText.noRowsToShowFiltered 覆寫:過濾 0 筆顯示覆寫值(表頭過濾與 filterall 皆是)', async function() {
            ctx = await open('o7')
            const { page } = ctx
            const TXT = '無查詢結果，請更換關鍵字或查詢條件。'
            await typeIntoFloatingFilter(page, '#o7', 1, 'zzz')
            await waitOverlay(page, '#o7', TXT)
            await typeIntoFloatingFilter(page, '#o7', 1, '')
            await waitNoOverlay(page, '#o7')
            await typeHostSearch(page, '#fa7', 'zzz')
            await waitOverlay(page, '#o7', TXT)
            assertNoErrors(ctx)
        })

        it('OV13 同一份 localeText 同時覆寫兩鍵:資料為空用 noRowsToShow、過濾 0 筆用 noRowsToShowFiltered,各用各的', async function() {
            //o7 有數據(過濾 0 筆, 用 Filtered 鍵); o2 為空表(用 noRowsToShow 鍵)
            ctx = await open('o2,o7')
            const { page } = ctx
            await waitOverlay(page, '#o2', '無數據')
            await typeIntoFloatingFilter(page, '#o7', 1, 'zzz')
            await waitOverlay(page, '#o7', '無查詢結果，請更換關鍵字或查詢條件。')
            const info = await overlayInfo(page, '#o7')
            assert.notStrictEqual(info.text, '無數據', '過濾 0 筆不得用空表文字')
            assertNoErrors(ctx)
        })
    })

    describe('關閉選項 opt.showOverlayWhenFilteredEmpty=false', function() {

        it('OV14 關閉時表頭過濾成 0 筆:不顯示覆蓋層(舊行為);清空後列恢復', async function() {
            ctx = await open('o6')
            const { page } = ctx
            await typeIntoFloatingFilter(page, '#o6', 1, 'zzz')
            await waitRowCount(page, '#o6', 0)
            //否定斷言: 列數已達 0(終態)後再觀察短暫窗
            await assertNoOverlayWindow(page, '#o6')
            await typeIntoFloatingFilter(page, '#o6', 1, '')
            await waitRowCount(page, '#o6', 3)
            await assertNoOverlayWindow(page, '#o6', 300)
            assertNoErrors(ctx)
        })

        it('OV15 關閉時 filterall 使顯示 0 筆:維持舊行為(ag-grid 自行顯示「無資料可顯示」)', async function() {
            ctx = await open('o6')
            const { page } = ctx
            await typeHostSearch(page, '#fa6', 'zzz')
            await waitRowCount(page, '#o6', 0)
            //關閉選項 = 完全回到修前行為: filterall 使 rowData 為空, ag-grid 顯示 noRowsToShow
            await waitOverlay(page, '#o6', T_EMPTY['zh-tw'])
            await typeHostSearch(page, '#fa6', '')
            await waitRowCount(page, '#o6', 3)
            await waitNoOverlay(page, '#o6')
            assertNoErrors(ctx)
        })
    })

    describe('與 ag-grid 原生覆蓋層(loading)之互動', function() {

        it('OV16 宿主顯示載入中(此時使用者點不到表頭, ag-grid 載入中覆蓋層會攔截指標事件)後由宿主過濾成 0 筆:載入中不被蓋掉;宿主隱藏後再過濾才顯示過濾 0 筆', async function() {
            ctx = await open('o12')
            const { page } = ctx
            await page.click('#btnShowLoading12')
            await waitOverlay(page, '#o12', '載入中...', 'loading')

            //宿主在載入中過濾(宿主按鈕呼叫 setHeadFilter)使顯示列為 0
            await page.click('#btnFilter12')
            await waitRowCount(page, '#o12', 0)
            //否定斷言: 列數已達 0(終態)後觀察, 載入中仍在、未被換成過濾 0 筆文字
            await page.waitForTimeout(700)
            const info = await overlayInfo(page, '#o12')
            assert.strictEqual(info.type, 'loading', JSON.stringify(info))
            assert.strictEqual(info.text, '載入中...')

            //宿主隱藏覆蓋層後, 下一次過濾變更(列數仍為 0)才顯示過濾 0 筆文字(真鍵盤於表頭輸入)
            await page.click('#btnHideOverlay12')
            await waitNoOverlay(page, '#o12')
            await typeIntoFloatingFilter(page, '#o12', 1, 'zzy')
            await waitOverlay(page, '#o12', T_FILTERED['zh-tw'])
            assertNoErrors(ctx)
        })

        it('OV17 過濾 0 筆之覆蓋層顯示中宿主改顯示載入中,其後由宿主清除過濾:載入中不被本元件隱藏(不得誤隱藏),宿主隱藏後無殘留', async function() {
            ctx = await open('o12')
            const { page } = ctx
            await typeIntoFloatingFilter(page, '#o12', 1, 'zzz')
            await waitOverlay(page, '#o12', T_FILTERED['zh-tw'])
            await page.click('#btnShowLoading12')
            await waitOverlay(page, '#o12', '載入中...', 'loading')

            //宿主清除過濾: 列恢復, 但載入中屬宿主管理, 仍在
            await page.click('#btnClear12')
            await waitRowCount(page, '#o12', 3)
            await page.waitForTimeout(700)
            const info = await overlayInfo(page, '#o12')
            assert.strictEqual(info.type, 'loading', JSON.stringify(info))

            //宿主隱藏後無任何覆蓋層殘留
            await page.click('#btnHideOverlay12')
            await waitNoOverlay(page, '#o12')
            assertNoErrors(ctx)
        })
    })

    describe('數據更新與覆蓋層(不殘留、不錯文字)', function() {

        it('OV18 過濾 0 筆時宿主換數據:空陣列→空表文字;含 Zeta 之批(過濾 zzz 仍 0 筆)→過濾 0 筆文字;清空過濾→隱藏', async function() {
            ctx = await open('o13')
            const { page } = ctx
            await typeIntoFloatingFilter(page, '#o13', 1, 'zzz')
            await waitOverlay(page, '#o13', T_FILTERED['zh-tw'])

            //數據本身變空: 文字換成空表文字
            await page.click('#btnRows13Empty')
            await waitOverlay(page, '#o13', T_EMPTY['zh-tw'])

            //數據回來但過濾條件(zzz)仍使顯示 0 筆: 換成過濾 0 筆文字
            await page.click('#btnRows13Other')
            await waitOverlay(page, '#o13', T_FILTERED['zh-tw'])
            await waitRowCount(page, '#o13', 0)

            //過濾改為 Zet: 符合新批 2 列, 覆蓋層隱藏
            await typeIntoFloatingFilter(page, '#o13', 1, 'Zet')
            await waitRowCount(page, '#o13', 2)
            await waitNoOverlay(page, '#o13')
            assertNoErrors(ctx)
        })

        it('OV19 過濾 0 筆時宿主換成另一批仍有符合者:覆蓋層隨列出現而隱藏(不殘留)', async function() {
            ctx = await open('o13')
            const { page } = ctx
            await typeIntoFloatingFilter(page, '#o13', 1, 'Zet')
            await waitOverlay(page, '#o13', T_FILTERED['zh-tw'])
            await page.click('#btnRows13Other')
            await waitRowCount(page, '#o13', 2)
            await waitNoOverlay(page, '#o13')
            assertNoErrors(ctx)
        })
    })

    describe('執行中變更 opt', function() {

        it('OV20 覆蓋層顯示中變更 localeText:文字隨之更新(無須等數據更新)', async function() {
            ctx = await open('o14')
            const { page } = ctx
            await typeIntoFloatingFilter(page, '#o14', 1, 'zzz')
            await waitOverlay(page, '#o14', T_FILTERED['zh-tw'])
            await page.click('#btnLocale14')
            await waitOverlay(page, '#o14', '換新文字:查無符合者')
            assertNoErrors(ctx)
        })

        it('OV21 覆蓋層顯示中把 showOverlayWhenFilteredEmpty 改為 false 即隱藏、改回 true 即再顯示', async function() {
            ctx = await open('o14')
            const { page } = ctx
            await typeIntoFloatingFilter(page, '#o14', 1, 'zzz')
            await waitOverlay(page, '#o14', T_FILTERED['zh-tw'])
            await page.click('#btnFlag14Off')
            await waitNoOverlay(page, '#o14')
            //列仍為 0(過濾仍在, 只是不提示); 列的 DOM 隨 ag-grid 動畫移除, 以偵測等待到 0
            await waitRowCount(page, '#o14', 0)
            await assertNoOverlayWindow(page, '#o14', 400)
            await page.click('#btnFlag14On')
            await waitOverlay(page, '#o14', T_FILTERED['zh-tw'])
            assertNoErrors(ctx)
        })

        it('OV22 覆蓋層顯示中變更 language:改用新語系之內建文字', async function() {
            ctx = await open('o14')
            const { page } = ctx
            await typeIntoFloatingFilter(page, '#o14', 1, 'zzz')
            await waitOverlay(page, '#o14', T_FILTERED['zh-tw'])
            await page.click('#btnLang14')
            await waitOverlay(page, '#o14', T_FILTERED.en)
            assertNoErrors(ctx)
        })
    })

    describe('執行中變更 opt(ag-grid 自行顯示之空表覆蓋層)', function() {

        it('OV26 數據為空之表:執行中變更 localeText.noRowsToShow、language 時,顯示中之空表文字隨之更新', async function() {
            ctx = await open('o17', 0)
            const { page } = ctx
            await waitOverlay(page, '#o17', T_EMPTY['zh-tw'])
            await page.click('#btnLocale17')
            await waitOverlay(page, '#o17', '目前沒有任何數據')
            await page.click('#btnLang17')
            await waitOverlay(page, '#o17', T_EMPTY.en)
            assertNoErrors(ctx)
        })

        it('OV27 filterall 使顯示 0 筆(ag-grid 自行顯示之覆蓋層):執行中變更 localeText 時文字隨之更新', async function() {
            ctx = await open('o14')
            const { page } = ctx
            await typeHostSearch(page, '#fa14', 'zzz')
            await waitRowCount(page, '#o14', 0)
            await waitOverlay(page, '#o14', T_FILTERED['zh-tw'])
            await page.click('#btnLocale14')
            await waitOverlay(page, '#o14', '換新文字:查無符合者')
            assertNoErrors(ctx)
        })
    })

    describe('覆蓋層狀態之辨識(限定為本表自己之覆蓋層)', function() {

        it('OV28 localeText 之空字串為有效覆寫:空表文字可換成空字串,再換成非空字串時覆蓋層文字更新(不把空文字當成「尚未寫入」)', async function() {
            ctx = await open('o17', 0)
            const { page } = ctx
            await waitOverlay(page, '#o17', T_EMPTY['zh-tw'])
            await page.click('#btnEmpty17')
            await waitOverlay(page, '#o17', '')
            await page.click('#btnLocale17')
            await waitOverlay(page, '#o17', '目前沒有任何數據')
            assertNoErrors(ctx)
        })

        it('OV30 過濾 0 筆之覆蓋層(表頭過濾使然)顯示中:noRowsToShowFiltered 換成空字串再換成非空字串,文字依序更新(空字串為有效覆寫)', async function() {
            ctx = await open('o14')
            const { page } = ctx
            await typeIntoFloatingFilter(page, '#o14', 1, 'zzz')
            await waitOverlay(page, '#o14', T_FILTERED['zh-tw'])
            await page.click('#btnEmptyF14')
            await waitOverlay(page, '#o14', '')
            await page.click('#btnLocale14')
            await waitOverlay(page, '#o14', '換新文字:查無符合者')
            assertNoErrors(ctx)
        })

        it('OV29 表頭 slot 內有「巢狀表格之殼」(.ag-root-wrapper 內之 .ag-overlay.ag-hidden,文件順序早於本表之覆蓋層)時:過濾 0 筆之覆蓋層仍依本表自己之狀態隱藏(不殘留)', async function() {
            ctx = await open('o18')
            const { page } = ctx
            await typeIntoFloatingFilter(page, '#o18', 1, 'zzz')
            await waitOverlay(page, '#o18', T_FILTERED['zh-tw'])
            await typeIntoFloatingFilter(page, '#o18', 1, '')
            await waitRowCount(page, '#o18', 3)
            //本表自己之覆蓋層須隱藏(測試端 helper 已限定為 .ag-root 之直接子節點, 不會被殼騙到)
            await waitNoOverlay(page, '#o18')
            assertNoErrors(ctx)
        })
    })

    describe('無效選項(R01:使用預設並於 console 提示)', function() {

        it('OV23 localeText 非物件、showOverlayWhenFilteredEmpty 非布林值:提示並用預設(過濾 0 筆仍顯示內建過濾 0 筆文字)', async function() {
            ctx = await open('o10')
            const { page } = ctx
            const texts = ctx.logs.map((m) => m.text)
            assert.ok(texts.includes('[w-aggrid-vue] opt.localeText is invalid[abc], use default {}'), JSON.stringify(texts))
            assert.ok(texts.includes('[w-aggrid-vue] opt.showOverlayWhenFilteredEmpty is invalid[no], use default true'), JSON.stringify(texts))
            await typeIntoFloatingFilter(page, '#o10', 1, 'zzz')
            await waitOverlay(page, '#o10', T_FILTERED['zh-tw'])
            assertNoErrors(ctx)
        })

        it('OV24 localeText 內值非字串之鍵:略過並提示, 該鍵用內建; 有效鍵(含空字串)照用', async function() {
            ctx = await open('o11')
            const { page } = ctx
            const texts = ctx.logs.map((m) => m.text)
            assert.ok(texts.includes('[w-aggrid-vue] opt.localeText[noRowsToShow] is invalid[123], use default text'), JSON.stringify(texts))
            assert.ok(texts.includes('[w-aggrid-vue] opt.localeText[noRowsToShowFiltered] is invalid[[object Array]], use default text'), JSON.stringify(texts))
            assert.ok(!texts.some((t) => t.includes('localeText[filterOoo]') || t.includes('localeText[loadingOoo]')), '有效鍵不應提示')
            //無效之 noRowsToShowFiltered 被略過 → 內建過濾 0 筆文字
            await typeIntoFloatingFilter(page, '#o11', 1, 'zzz')
            await waitOverlay(page, '#o11', T_FILTERED['zh-tw'])
            assertNoErrors(ctx)
        })
    })

    describe('仿 w-table-vue WTableEdit 組 opt 之方式', function() {

        it('OV25 opt 經「展開後以 language/rows/keys 複寫、其餘鍵逐一覆蓋」組成(僅仿照所測):localeText 與選項皆生效', async function() {
            ctx = await open('o15')
            const { page } = ctx
            await typeIntoFloatingFilter(page, '#o15', 1, 'zzz')
            await waitOverlay(page, '#o15', '無符合條件之資料(WT)')
            await typeIntoFloatingFilter(page, '#o15', 1, '')
            await waitNoOverlay(page, '#o15')
            assertNoErrors(ctx)
        })
    })
})
