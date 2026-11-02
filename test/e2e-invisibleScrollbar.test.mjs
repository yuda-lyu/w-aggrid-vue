//隱形捲軸(瀏覽器捲軸寬為 0)時橫向捲軸不得蓋住資料列 15 項(規則帳本 R27)
//需求(來源: Gitea #54 與派工 ag284):
//  N1 橫向隱形捲軸改占位排列: 資料區讓出捲軸之高度, 不疊在資料列之上(IS1)
//  N2 呼叫端以 ensureIndexVisible 捲到最後一列, 最後一列之按鈕未被橫向捲軸蓋住, 真滑鼠點中央生效(IS2、IS8)
//  N3 使用者以滾輪捲到底, 同 N2(IS3)
//  N4 列少而無垂直捲動, 同 N2(IS4、IS5)
//  N5 橫向捲軸仍可捲動且與資料區同步, 保留(IS6、IS7)
//  N6 無橫向捲動時不占位、資料區延伸到底, 保留(IS9、IS10)
//  N7 固定欄(pinned)之表格版面不變, 保留(IS11); 固定欄時最後一列可點(IS12)
//  N8 置底列: 占位排列後橫向捲軸在置底列之下, 不蓋住置底列(IS13; ag-grid 以行內 bottom 把隱形捲軸抬到置底列之上, 占位排列須蓋過它)
//  N9 直向隱形捲軸之實測行為(IS14、IS15: 疊在資料區右緣 16px, 本輪不改, 規則帳本 6 節 #26)
//使用者路徑: ①開宿主頁(30 列, 欄寬總和大於表格寬度而有橫向捲軸) ②捲到最下(呼叫端以 ensureIndexVisible 捲到最後一列, 或使用者以滾輪捲到底)
//③看到最後一列之按鈕 ④以真滑鼠點按鈕中央 ⑤按鈕之點擊生效(clicked 記錄恰一筆) ⑥無副作用(無 pageerror 與 console error)
//ag-grid 31.3.4 於隱形捲軸時把橫向捲軸以 position:absolute; bottom:0 疊在資料區底部(ag-grid.css 之 .ag-body-horizontal-scroll.ag-scrollbar-invisible),
//非 Apple 平台恆顯示並攔截點擊, 捲到最下時最後一列之下半(約 16px)點不到。本測試以 w-package-tools-e2e 之無頭瀏覽器(捲軸寬 0)重現
//未走 UI 之步驟(標明於各案): 隱形捲軸無可拖曳之捲軸桿, 「捲軸桿 → 資料區」之同步以程式設定捲軸之 scrollLeft 代之(IS7)
import assert from 'assert'
import { openPage, pageUrl, assertNoErrors } from './tools/e2e-setup.mjs'
import { pollUntil } from './tools/e2eLib.mjs'

//url, 宿主頁網址(查詢字串見 invisibleScrollbar.html)
const url = (q = '') => `${pageUrl('invisibleScrollbar.html')}?${q}`

//TOL, 次像素容許差(px)
const TOL = 1

//env, 瀏覽器捲軸寬與橫向捲軸之狀態
function env(page) {
    return page.evaluate(() => {
        let d = document.createElement('div')
        d.style.cssText = 'position:absolute;top:-999px;width:100px;height:100px;overflow:scroll'
        document.body.appendChild(d)
        let sbw = d.offsetWidth - d.clientWidth
        d.remove()
        let hs = document.querySelector('#g1 .ag-body-horizontal-scroll')
        let r = hs.getBoundingClientRect()
        return { sbw, invisible: hs.classList.contains('ag-scrollbar-invisible'), hsHeight: r.height, hsTop: r.top, hsBottom: r.bottom }
    })
}

//rect, 元素矩形(選擇器相對於 #g1), 不存在或不占位(ag-hidden 之 display:none)回 null
function rect(page, sel) {
    return page.evaluate((s) => {
        let e = document.querySelector(`#g1 ${s}`)
        if (!e) {
            return null
        }
        let r = e.getBoundingClientRect()
        if (r.width === 0 && r.height === 0) {
            return null
        }
        return { left: r.left, top: r.top, right: r.right, bottom: r.bottom, width: r.width, height: r.height }
    }, sel)
}

//scrollX, 橫向捲動狀態: 資料區、表頭、橫向捲軸之 scrollLeft 與最大可捲量
function scrollX(page) {
    return page.evaluate(() => {
        let q = (s) => document.querySelector(`#g1 ${s}`)
        let cv = q('.ag-center-cols-viewport')
        let hv = q('.ag-header-viewport')
        let hs = q('.ag-body-horizontal-scroll-viewport')
        return {
            cv: cv.scrollLeft,
            cvMax: cv.scrollWidth - cv.clientWidth,
            hv: hv.scrollLeft,
            hs: hs.scrollLeft,
            hsMax: hs.scrollWidth - hs.clientWidth,
        }
    })
}

//vScrollable, 資料區是否有垂直捲動量(scrollHeight 大於 clientHeight)
function vScrollable(page) {
    return page.evaluate(() => {
        let v = document.querySelector('#g1 .ag-body-viewport')
        return v.scrollHeight - v.clientHeight > 1
    })
}

//buttonInfo, 按鈕之矩形與其中央、右內縮 2px 處之最上層元素描述(按鈕本身記為 button); 尚未渲染回 null
function buttonInfo(page, cls, row) {
    return page.evaluate(({ c, r }) => {
        let b = document.querySelector(`#g1 .${c}[data-row="${r}"]`)
        if (!b) {
            return null
        }
        let rc = b.getBoundingClientRect()
        let cx = rc.left + rc.width / 2
        let cy = rc.top + rc.height / 2
        let at = (x, y) => {
            let t = document.elementFromPoint(x, y)
            if (!t) {
                return 'null'
            }
            return t === b ? 'button' : `${t.tagName.toLowerCase()}.${String(t.className).split(' ')[0]}`
        }
        return { left: rc.left, top: rc.top, right: rc.right, bottom: rc.bottom, cx, cy, atCenter: at(cx, cy), atRight: at(rc.right - 2, cy) }
    }, { c: cls, r: row })
}

//clickedList, 宿主頁記錄之被點到的按鈕
const clickedList = (page) => page.evaluate(() => window.__vm.clicked.slice())

//waitButtonStable, 偵測等待按鈕已渲染且矩形連續 3 次(各 100ms)不變(捲動與重排結束), 回最後一次之 buttonInfo
async function waitButtonStable(page, label, cls, row) {
    let last = ''
    let n = 0
    let info = null
    await pollUntil(`${label}: 按鈕 ${cls}@${row} 已渲染且位置穩定`, async () => {
        info = await buttonInfo(page, cls, row)
        let s = info ? `${info.top}|${info.left}|${info.bottom}` : ''
        n = s !== '' && s === last ? n + 1 : 0
        last = s
        return n >= 3
    }, { timeout: 8000, interval: 100 })
    return info
}

//assertClickable, 按鈕之中央未被蓋住(最上層為按鈕本身)、下緣在橫向捲軸上緣之上(橫向捲軸占位時), 真滑鼠點中央即生效且只觸發一次
async function assertClickable(page, label, cls, row, tag) {
    let hs = await rect(page, '.ag-body-horizontal-scroll')
    let b = await waitButtonStable(page, label, cls, row)
    assert.ok(b.atCenter === 'button', `${label}: 按鈕中央之最上層元素應為按鈕, 實為 ${b.atCenter}(按鈕 ${b.top}~${b.bottom}, 橫向捲軸 ${hs ? `${hs.top}~${hs.bottom}` : '不顯示'})`)
    if (hs) {
        assert.ok(b.bottom <= hs.top + TOL, `${label}: 按鈕下緣(${b.bottom})應在橫向捲軸上緣(${hs.top})之上`)
    }
    await page.mouse.click(b.cx, b.cy)
    await pollUntil(`${label}: 點擊生效`, async () => (await clickedList(page)).length > 0, { timeout: 3000, interval: 100 })
    assert.deepStrictEqual(await clickedList(page), [`${tag}:${row}`], `${label}: 點擊應只觸發該按鈕一次`)
}

//open, 開宿主頁, 並確認為隱形捲軸之情形(捲軸寬 0、橫向捲軸帶 ag-scrollbar-invisible); 否則本檔不在測隱形捲軸, 一律紅
async function open(q = '') {
    let ctx = await openPage(url(q))
    let e = await env(ctx.page)
    assert.strictEqual(e.sbw, 0, '前置: 瀏覽器捲軸寬應為 0(否則本檔不在測隱形捲軸)')
    assert.ok(e.invisible, '前置: 橫向捲軸應帶 ag-scrollbar-invisible')
    return ctx
}

//wheelOnBody, 滑鼠移到資料區中間再以真滾輪捲動(L2); 水平方向不落在資料區上緣, 避開表頭
async function wheelOnBody(page, dx, dy) {
    let vb = await rect(page, '.ag-body-viewport')
    await page.mouse.move(vb.left + vb.width / 2, vb.top + 40)
    await page.mouse.wheel(dx, dy)
}

//scrollToEnd, 以真滾輪捲到資料區最右, 並等橫向捲軸、表頭與資料區皆到最右
async function scrollToEnd(page, label) {
    await wheelOnBody(page, 5000, 0)
    try {
        await pollUntil(`${label}: 捲到最右`, async () => {
            let s = await scrollX(page)
            return s.cvMax > 0 && s.cv >= s.cvMax - TOL && s.hs >= s.hsMax - TOL
        }, { timeout: 5000, interval: 100 })
    }
    catch (err) {
        //逾時時附上捲動狀態: 資料區之最大可捲量與橫向捲軸不同(兩者範圍不一致)時, 滾輪會停在較小者而到不了資料區之最右
        throw new Error(`${err.message}; 捲動狀態 ${JSON.stringify(await scrollX(page))}`)
    }
}

describe('e2e-invisibleScrollbar:隱形捲軸時橫向捲軸不得蓋住資料列', function() {
    let ctx = null

    afterEach(async function() {
        if (ctx) {
            await ctx.close()
        }
        ctx = null
    })

    it('IS1 前置: 測試瀏覽器之捲軸寬為 0, 表格帶隱形捲軸且顯示橫向捲軸並占位(橫向捲軸在資料區之下, 不疊在其上)', async function() {
        ctx = await open()
        let { page } = ctx
        let e = await env(page)
        assert.strictEqual(e.hsHeight, 16, '橫向捲軸高度(ag-grid 於隱形捲軸時固定 16px)')
        let bv = await rect(page, '.ag-body-viewport')
        //N1: 橫向捲軸占位排列, 資料區下緣即橫向捲軸上緣
        assert.ok(Math.abs(bv.bottom - e.hsTop) <= TOL, `資料區下緣(${bv.bottom})應為橫向捲軸上緣(${e.hsTop}), 即資料區讓出橫向捲軸之高度`)
        assertNoErrors(ctx)
    })

    it('IS2 呼叫端以 ensureIndexVisible 捲到最後一列(新增列後之常見作法): 最後一列之按鈕未被橫向捲軸蓋住, 點中央生效', async function() {
        ctx = await open()
        let { page } = ctx
        //setup: 呼叫端程式捲動(同 w-table-vue 新增列後之 ensureIndexVisible(最後一列, 'bottom')), 非使用者操作(未走 UI)
        await page.evaluate(() => document.querySelector('#g1').__vue__.getApi().ensureIndexVisible(29, 'bottom'))
        //N1
        await assertClickable(page, 'IS2', 'btn-act', 'r029', 'act')
        assertNoErrors(ctx)
    })

    it('IS3 使用者以滾輪捲到底: 最後一列之按鈕未被橫向捲軸蓋住, 點中央生效', async function() {
        ctx = await open()
        let { page } = ctx
        //act: 真滾輪
        await wheelOnBody(page, 0, 5000)
        await pollUntil('IS3: 捲到底', async () => (await page.evaluate(() => {
            let v = document.querySelector('#g1 .ag-body-viewport')
            return v.scrollTop > 0 && Math.abs(v.scrollTop + v.clientHeight - v.scrollHeight) < 1
        })), { timeout: 5000, interval: 100 })
        //N2
        await assertClickable(page, 'IS3', 'btn-act', 'r029', 'act')
        assertNoErrors(ctx)
    })

    it('IS4 列少而無垂直捲動(3 列)、有橫向捲軸: 最後一列之按鈕未被橫向捲軸蓋住, 點中央生效', async function() {
        ctx = await open('rows=3&h=300')
        let { page } = ctx
        assert.ok(!(await vScrollable(page)), '前置: 3 列不應有垂直捲動量')
        //N3
        await assertClickable(page, 'IS4', 'btn-act', 'r002', 'act')
        assertNoErrors(ctx)
    })

    it('IS5 列數恰填滿資料區(5 列, 表格高 207px, 修前無垂直捲動而最後一列之下半在橫向捲軸之下): 最後一列之按鈕未被橫向捲軸蓋住, 點中央生效', async function() {
        ctx = await open('rows=5&h=207')
        let { page } = ctx
        //前置: 5 列之總高度大於「資料區上緣至橫向捲軸上緣」之距離, 即不讓出橫向捲軸高度時最後一列之下緣落在橫向捲軸之下
        let m = await page.evaluate(() => {
            let rows = Array.from(document.querySelectorAll('#g1 .ag-center-cols-container .ag-row'))
            let hs = document.querySelector('#g1 .ag-body-horizontal-scroll').getBoundingClientRect()
            let bv = document.querySelector('#g1 .ag-body-viewport').getBoundingClientRect()
            return { rowsHeight: rows.reduce((a, r) => a + r.getBoundingClientRect().height, 0), rows: rows.length, hsTop: hs.top, bvTop: bv.top }
        })
        assert.strictEqual(m.rows, 5, '前置: 5 列皆渲染')
        assert.ok(m.rowsHeight > m.hsTop - m.bvTop + TOL, `前置: 列總高度(${m.rowsHeight})應大於資料區上緣至橫向捲軸上緣之距離(${m.hsTop - m.bvTop})`)
        //資料區讓出橫向捲軸高度後出現垂直捲動量時, 使用者以滾輪捲到底(修前無垂直捲動量, 不需捲動); 之後最後一列須可點
        if (await vScrollable(page)) {
            await wheelOnBody(page, 0, 5000)
            await pollUntil('IS5: 捲到底', async () => (await page.evaluate(() => {
                let v = document.querySelector('#g1 .ag-body-viewport')
                return Math.abs(v.scrollTop + v.clientHeight - v.scrollHeight) < 1
            })), { timeout: 5000, interval: 100 })
        }
        //N3
        await assertClickable(page, 'IS5', 'btn-act', 'r004', 'act')
        assertNoErrors(ctx)
    })

    it('IS6 使用者以橫向滾輪捲動: 資料區、表頭、橫向捲軸同步, 捲到最右時最後一欄完整可見(保留)', async function() {
        ctx = await open()
        let { page } = ctx
        await scrollToEnd(page, 'IS6')
        //N4: 三者之 scrollLeft 相同, 且皆到最大可捲量(最後一欄之右緣不被裁切)
        let s = await scrollX(page)
        assert.ok(Math.abs(s.hs - s.cv) <= TOL && Math.abs(s.hv - s.cv) <= TOL, `橫向捲軸(${s.hs})、表頭(${s.hv})、資料區(${s.cv})之 scrollLeft 應相同`)
        assert.ok(Math.abs(s.hsMax - s.cvMax) <= TOL, `橫向捲軸之最大可捲量(${s.hsMax})應等於資料區(${s.cvMax}), 否則最右端有一段內容無法捲到`)
        let m = await page.evaluate(() => {
            let q = (s) => document.querySelector(`#g1 ${s}`)
            return {
                cv: q('.ag-center-cols-viewport').getBoundingClientRect().right,
                head: q('.ag-header-cell[col-id="actR"]').getBoundingClientRect().right,
                cell: q('.ag-center-cols-container .ag-row[row-index="0"] .ag-cell[col-id="actR"]').getBoundingClientRect().right,
            }
        })
        assert.ok(Math.abs(m.head - m.cv) <= TOL && Math.abs(m.cell - m.cv) <= TOL, `最右欄之表頭右緣(${m.head})與儲存格右緣(${m.cell})應與資料區右緣(${m.cv})對齊`)
        assertNoErrors(ctx)
    })

    it('IS7 設定橫向捲軸之 scrollLeft(未走 UI: 隱形捲軸無可拖曳之捲軸桿): 資料區與表頭隨之同步(保留)', async function() {
        ctx = await open()
        let { page } = ctx
        await page.evaluate(() => {
            document.querySelector('#g1 .ag-body-horizontal-scroll-viewport').scrollLeft = 300
        })
        //N4
        await pollUntil('IS7: 資料區與表頭同步', async () => {
            let s = await scrollX(page)
            return Math.round(s.cv) === 300 && Math.round(s.hv) === 300
        }, { timeout: 3000, interval: 100 })
        assertNoErrors(ctx)
    })

    it('IS8 橫向捲動後再捲到最下: 橫向捲動位置不變, 最後一列下緣在橫向捲軸之上', async function() {
        ctx = await open()
        let { page } = ctx
        await wheelOnBody(page, 300, 0)
        await pollUntil('IS8: 橫向捲動 300', async () => Math.round((await scrollX(page)).cv) === 300, { timeout: 3000, interval: 100 })
        await wheelOnBody(page, 0, 5000)
        await pollUntil('IS8: 捲到底', async () => (await page.evaluate(() => {
            let v = document.querySelector('#g1 .ag-body-viewport')
            return v.scrollTop > 0 && Math.abs(v.scrollTop + v.clientHeight - v.scrollHeight) < 1
        })), { timeout: 5000, interval: 100 })
        //N2: 橫向位置不受垂直捲動影響; 此時 act 欄(原 x 約 180)已左移, 改量最後一列之下緣不被橫向捲軸蓋住
        let s = await scrollX(page)
        assert.ok(Math.abs(s.cv - 300) <= TOL && Math.abs(s.hs - 300) <= TOL && Math.abs(s.hv - 300) <= TOL, `橫向捲動位置應維持 300: ${JSON.stringify(s)}`)
        let m = await page.evaluate(() => {
            let row = document.querySelector('#g1 .ag-center-cols-container .ag-row[row-index="29"]')
            let hs = document.querySelector('#g1 .ag-body-horizontal-scroll').getBoundingClientRect()
            return { rowBottom: row.getBoundingClientRect().bottom, hsTop: hs.top }
        })
        assert.ok(m.rowBottom <= m.hsTop + TOL, `最後一列下緣(${m.rowBottom})應在橫向捲軸上緣(${m.hsTop})之上`)
        assertNoErrors(ctx)
    })

    it('IS9 欄寬總和小於表格寬度而無橫向捲動: 不顯示橫向捲軸、資料區延伸到表格底部、最後一列可點(保留)', async function() {
        ctx = await open('w=1500&n=2&rows=3&h=150')
        let { page } = ctx
        //前置(橫向捲軸帶隱形類別之檢查在 open; 此處無橫向捲動, 橫向捲軸元件不顯示)
        let hs = await rect(page, '.ag-body-horizontal-scroll')
        //N5
        assert.strictEqual(hs, null, '無橫向捲動時不應顯示或占位橫向捲軸')
        let root = await rect(page, '.ag-root')
        let body = await rect(page, '.ag-body')
        assert.ok(Math.abs(root.bottom - body.bottom) <= TOL, `資料區下緣(${body.bottom})應延伸到表格底部(${root.bottom}), 不多出空白`)
        await assertClickable(page, 'IS9', 'btn-act', 'r002', 'act')
        assertNoErrors(ctx)
    })

    it('IS10 容器寬度改變使橫向捲動出現與消失: 橫向捲軸隨之占位與釋放(保留)', async function() {
        ctx = await open('rows=3&h=150')
        let { page } = ctx
        let hsRect = () => rect(page, '.ag-body-horizontal-scroll')
        //前置: 寬 800 有橫向捲動
        assert.ok(await hsRect(), '前置: 寬 800 時應顯示橫向捲軸')
        //setup: 宿主改變容器寬度(非 act; 觸發 ag-grid 重算捲軸顯示)
        await page.evaluate(() => {
            window.__vm.w = 1600
        })
        //N5: 欄寬總和 1520 小於 1600 → 無橫向捲動, 不占位
        await pollUntil('IS10: 橫向捲軸隱藏', async () => (await hsRect()) === null, { timeout: 8000, interval: 100 })
        let root = await rect(page, '.ag-root')
        let body = await rect(page, '.ag-body')
        assert.ok(Math.abs(root.bottom - body.bottom) <= TOL, `無橫向捲動時資料區下緣(${body.bottom})應延伸到表格底部(${root.bottom})`)
        await page.evaluate(() => {
            window.__vm.w = 800
        })
        await pollUntil('IS10: 橫向捲軸再出現', async () => (await hsRect()) !== null, { timeout: 8000, interval: 100 })
        assertNoErrors(ctx)
    })

    it('IS11 固定欄(k 欄釘選左側): 固定欄區與中間欄區並排、表頭與資料欄對齊、橫向捲動同步(保留)', async function() {
        ctx = await open('pin=1')
        let { page } = ctx
        //N7: 固定欄區與中間欄區並排, 表頭格與資料格左緣對齊
        let m = await page.evaluate(() => {
            let q = (s) => document.querySelector(`#g1 ${s}`)
            let r = (e) => e.getBoundingClientRect()
            let pinned = r(q('.ag-pinned-left-cols-container'))
            let center = r(q('.ag-center-cols-viewport'))
            let delta = {}
            document.querySelectorAll('#g1 .ag-header-row-column .ag-header-cell[col-id]').forEach((h) => {
                let id = h.getAttribute('col-id')
                let c = q(`.ag-row[row-index="0"] .ag-cell[col-id="${id}"]`)
                if (c) {
                    delta[id] = h.getBoundingClientRect().left - c.getBoundingClientRect().left
                }
            })
            return { pinnedRight: pinned.right, centerLeft: center.left, delta }
        })
        assert.ok(Math.abs(m.pinnedRight - m.centerLeft) <= TOL, `固定欄區右緣(${m.pinnedRight})應緊鄰中間欄區左緣(${m.centerLeft})`)
        assert.ok(Object.keys(m.delta).length >= 3 && Object.values(m.delta).every((d) => Math.abs(d) <= TOL), `表頭格與資料格左緣應對齊: ${JSON.stringify(m.delta)}`)
        await scrollToEnd(page, 'IS11')
        let s = await scrollX(page)
        assert.ok(Math.abs(s.hs - s.cv) <= TOL && Math.abs(s.hv - s.cv) <= TOL && Math.abs(s.hsMax - s.cvMax) <= TOL, `固定欄時橫向捲軸、表頭、資料區應同步: ${JSON.stringify(s)}`)
        assertNoErrors(ctx)
    })

    it('IS12 固定欄(k 欄釘選左側)、呼叫端捲到最後一列: 最後一列之按鈕未被橫向捲軸蓋住, 點中央生效', async function() {
        ctx = await open('pin=1')
        let { page } = ctx
        //setup: 呼叫端程式捲動(未走 UI)
        await page.evaluate(() => document.querySelector('#g1').__vue__.getApi().ensureIndexVisible(29, 'bottom'))
        //N7
        await assertClickable(page, 'IS12', 'btn-act', 'r029', 'act')
        assertNoErrors(ctx)
    })

    it('IS13 置底列(pinb): 置底列之按鈕未被蓋住, 點中央生效, 橫向捲軸在置底列之下', async function() {
        ctx = await open('pinb=1')
        let { page } = ctx
        //N8: 置底列之按鈕不被橫向捲軸蓋住
        let b = await waitButtonStable(page, 'IS13', 'btn-act', 'rBOT')
        assert.strictEqual(b.atCenter, 'button', `置底列之按鈕中央之最上層元素應為按鈕, 實為 ${b.atCenter}`)
        await page.mouse.click(b.cx, b.cy)
        await pollUntil('IS13: 點擊生效', async () => (await clickedList(page)).length > 0, { timeout: 3000, interval: 100 })
        assert.deepStrictEqual(await clickedList(page), ['act:rBOT'], '點擊應只觸發置底列之按鈕一次')
        //N8: ag-grid 對隱形橫向捲軸設行內 bottom(= 置底列總高度)把它抬到置底列之上; 占位排列後須取消該位移(bottom:auto !important), 橫向捲軸才排在置底列區之下
        let hs = await rect(page, '.ag-body-horizontal-scroll')
        let fb = await rect(page, '.ag-floating-bottom')
        assert.ok(hs && fb, '前置: 橫向捲軸與置底列區皆顯示')
        assert.ok(hs.top >= fb.bottom - TOL, `橫向捲軸上緣(${hs.top})應在置底列區下緣(${fb.bottom})之下`)
        assertNoErrors(ctx)
    })

    it('IS14 直向隱形捲軸(實測記錄, 本輪不改; 規則帳本 6 節 #26): 仍疊在資料區右緣 16px 而不占位, 最右欄按鈕之中央可點、右緣 2px 處被直向捲軸攔截', async function() {
        ctx = await open()
        let { page } = ctx
        await scrollToEnd(page, 'IS14')
        //N9: 直向隱形捲軸為 position:absolute 疊在資料區右緣, 資料區寬度未讓出
        let m = await page.evaluate(() => {
            let vs = document.querySelector('#g1 .ag-body-vertical-scroll')
            let cv = document.querySelector('#g1 .ag-center-cols-viewport')
            let vr = vs.getBoundingClientRect()
            let cr = cv.getBoundingClientRect()
            return { pos: getComputedStyle(vs).position, hidden: vs.classList.contains('ag-hidden'), invisible: vs.classList.contains('ag-scrollbar-invisible'), vsLeft: vr.left, vsRight: vr.right, vsWidth: vr.width, cvRight: cr.right }
        })
        assert.ok(!m.hidden && m.invisible, '前置: 30 列有垂直捲動量, 直向捲軸應顯示且帶 ag-scrollbar-invisible')
        assert.strictEqual(m.pos, 'absolute', '直向隱形捲軸現況為 position:absolute(疊在資料區上)')
        assert.ok(Math.abs(m.vsWidth - 16) <= TOL && Math.abs(m.vsRight - m.cvRight) <= TOL, `直向捲軸(寬 ${m.vsWidth}, 右緣 ${m.vsRight})應疊在資料區(右緣 ${m.cvRight})之右緣 16px`)
        let b = await waitButtonStable(page, 'IS14', 'btn-actR', 'r000')
        //最右欄之按鈕填滿儲存格內容區: 儲存格右內距 12px, 故按鈕右緣距資料區右緣 12px, 其右側 4px 在直向捲軸之下
        assert.strictEqual(b.atCenter, 'button', `最右欄按鈕之中央應可點, 最上層為 ${b.atCenter}`)
        assert.ok(b.right > m.vsLeft + TOL, `前置: 按鈕之右緣(${b.right})應落在直向捲軸(左緣 ${m.vsLeft})之內`)
        assert.strictEqual(b.atRight, 'div.ag-body-vertical-scroll-container', `按鈕右緣 2px 處之最上層元素: 現況為直向捲軸(限制 #26), 實為 ${b.atRight}`)
        await page.mouse.click(b.right - 2, b.cy)
        //否定斷言: 以短暫觀察窗確認按鈕未被觸發(click 事件為同步派發, 300ms 內未到即未發生)
        await page.waitForTimeout(300)
        assert.deepStrictEqual(await clickedList(page), [], '現況: 點在按鈕被直向捲軸蓋住之部分不觸發按鈕')
        await page.mouse.click(b.cx, b.cy)
        await pollUntil('IS14: 中央點擊生效', async () => (await clickedList(page)).length > 0, { timeout: 3000, interval: 100 })
        assert.deepStrictEqual(await clickedList(page), ['actR:r000'])
        assertNoErrors(ctx)
    })

    it('IS15 直向隱形捲軸若也改占位排列(對照, 說明本輪不採用之原因): 橫向捲軸之範圍會比資料區短, 捲到最右時最後一欄右緣被裁切', async function() {
        ctx = await open()
        let { page } = ctx
        //setup: 注入「直向隱形捲軸改占位」之樣式(對照組, 非本套件之樣式)
        await page.addStyleTag({ content: '.CompCssWAggridVue .ag-body-vertical-scroll.ag-scrollbar-invisible{position:relative;top:auto;right:auto;}' })
        await pollUntil('IS15: 資料區讓出直向捲軸', async () => {
            let cv = await rect(page, '.ag-center-cols-viewport')
            let hs = await rect(page, '.ag-body-horizontal-scroll-viewport')
            return !!cv && !!hs && cv.width < hs.width - 8
        }, { timeout: 5000, interval: 100 })
        //setup: 把橫向捲軸捲到最右(未走 UI: 隱形捲軸無可拖曳之捲軸桿), 等資料區同步到同一位置
        await page.evaluate(() => {
            document.querySelector('#g1 .ag-body-horizontal-scroll-viewport').scrollLeft = 99999
        })
        await pollUntil('IS15: 資料區同步至橫向捲軸之最右', async () => {
            let s = await scrollX(page)
            return s.hs > 0 && Math.abs(s.cv - s.hs) <= TOL
        }, { timeout: 5000, interval: 100 })
        let r = await page.evaluate(() => {
            let q = (s) => document.querySelector(`#g1 ${s}`)
            let hs = q('.ag-body-horizontal-scroll-viewport')
            let cv = q('.ag-center-cols-viewport')
            return {
                hsMax: hs.scrollWidth - hs.clientWidth,
                cvMax: cv.scrollWidth - cv.clientWidth,
                cellRight: q('.ag-center-cols-container .ag-row[row-index="0"] .ag-cell[col-id="actR"]').getBoundingClientRect().right,
                cvRight: cv.getBoundingClientRect().right,
            }
        })
        //N8: 橫向捲軸(全寬)之最大可捲量比資料區(讓出 16px 後較窄)少 16px, 捲到橫向捲軸之最右時最後一欄之右側 16px 在資料區之外
        assert.ok(r.cvMax - r.hsMax >= 15, `對照: 資料區之最大可捲量(${r.cvMax})應比橫向捲軸(${r.hsMax})多約 16px`)
        assert.ok(r.cellRight - r.cvRight >= 15, `對照: 橫向捲軸捲到最右時, 最後一欄右緣(${r.cellRight})應超出資料區右緣(${r.cvRight}) 16px 左右(被裁切)`)
        assertNoErrors(ctx)
    })

})
