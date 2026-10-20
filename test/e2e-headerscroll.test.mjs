//標頭容器被單獨捲動後之欄名與資料對齊 31 項(規則帳本 R21)
//使用者路徑: ①開宿主頁(橫向欄數多於表格寬度, 表格右緣之欄只露出一部分) ②不捲動表格, 直接點該欄名(Playwright locator.click 會先把目標捲入可見; 另有呼叫端對標頭內元素 focus()、scrollIntoView 之路徑)
//③看到欄名與其下資料是否同一欄(標頭與資料區之 scrollLeft、各欄標頭格與第 0 列儲存格之左緣) ④無輸入 ⑤排序依點擊生效 ⑥無副作用
//對照組(保留之行為): 真滑鼠點擊可見部分、先捲到完整可見再點、鍵盤逐欄走過標頭、連續橫向滾輪, 皆不得多捲動或錯位
import assert from 'assert'
import { openPage, pageUrl, assertNoErrors, columnTexts } from './tools/e2e-setup.mjs'
import { pollUntil, waitGridIdle } from './tools/e2eLib.mjs'

//TOL, 左緣對齊之容許差(px, 次像素)
const TOL = 0.5

//measure, 標頭與資料區之捲動位置, 以及各欄標頭格(欄名列)與第 0 列同欄儲存格之左緣差(只比對兩者皆已渲染之欄)
function measure(page) {
    return page.evaluate(() => {
        let g = document.querySelector('#g1')
        let hv = g.querySelector('.ag-header-viewport')
        let cv = g.querySelector('.ag-center-cols-viewport')
        let hr = hv.getBoundingClientRect()
        let deltas = {}
        let cells = {}
        g.querySelectorAll('.ag-header-viewport .ag-header-row-column .ag-header-cell[col-id]').forEach((hc) => {
            let id = hc.getAttribute('col-id')
            let r = hc.getBoundingClientRect()
            cells[id] = { left: r.left, right: r.right }
            let dc = g.querySelector(`.ag-center-cols-container .ag-row[row-index="0"] .ag-cell[col-id="${id}"]`)
            if (dc) {
                deltas[id] = r.left - dc.getBoundingClientRect().left
            }
        })
        return { hv: hv.scrollLeft, cv: cv.scrollLeft, hvLeft: hr.left, hvRight: hr.right, cells, deltas }
    })
}

//findPartial, 中間欄標頭格中右緣被裁切、仍露出一部分者(取最右一個)
function findPartial(page) {
    return page.evaluate(() => {
        let hv = document.querySelector('#g1 .ag-header-viewport')
        let hr = hv.getBoundingClientRect()
        let best = null
        hv.querySelectorAll('.ag-header-row-column .ag-header-cell[col-id]').forEach((hc) => {
            let r = hc.getBoundingClientRect()
            if (r.right > hr.right + 2 && r.left < hr.right - 20 && (!best || r.left > best.left)) {
                best = { id: hc.getAttribute('col-id'), left: r.left, right: r.right, top: r.top, height: r.height, hvLeft: hr.left, hvRight: hr.right }
            }
        })
        return best
    })
}

//alignedProblem, 標頭與資料區已一致時回 null, 否則回原因: scrollLeft 相同、已渲染之欄左緣皆對齊(至少 3 欄, 含目標欄)、目標欄標頭格完整在標頭容器內(visible 為 true 時)
function alignedProblem(m, target, visible) {
    if (Math.abs(m.hv - m.cv) >= 1) {
        return `標頭 scrollLeft=${m.hv} 與資料區 scrollLeft=${m.cv} 不同`
    }
    let ids = Object.keys(m.deltas)
    if (ids.length < 3) {
        return `可比對之欄只有 ${ids.length}`
    }
    let bad = ids.filter((id) => Math.abs(m.deltas[id]) > TOL)
    if (bad.length > 0) {
        return `欄名較資料左移: ${bad.map((id) => `${id}:${m.deltas[id]}`).join(',')}`
    }
    if (target && !(target in m.deltas)) {
        return `目標欄 ${target} 之標頭格或儲存格未渲染`
    }
    if (target && visible) {
        let c = m.cells[target]
        if (!(c.left >= m.hvLeft - 1 && c.right <= m.hvRight + 1)) {
            return `目標欄 ${target} 之標頭格未完整可見(${c.left}~${c.right} 對 ${m.hvLeft}~${m.hvRight})`
        }
    }
    return null
}

//waitAligned, 偵測等待標頭與資料區一致(補償於下一個畫面幀後才生效), 逾時拋錯並附量測值; 一致後再觀察 300ms 仍須一致(補償若在兩種位置間來回即在此被抓出)
async function waitAligned(page, label, target, visible = true, timeout = 3000) {
    try {
        await pollUntil(label, async () => alignedProblem(await measure(page), target, visible) === null, { timeout, interval: 100 })
    }
    catch (err) {
        let m = await measure(page)
        throw new Error(`${label}: ${alignedProblem(m, target, visible)}; 量測 hv=${m.hv} cv=${m.cv} deltas=${JSON.stringify(m.deltas)}`)
    }
    await page.waitForTimeout(300)
    let m = await measure(page)
    let problem = alignedProblem(m, target, visible)
    if (problem) {
        throw new Error(`${label}: 一致後又不一致: ${problem}; 量測 hv=${m.hv} cv=${m.cv}`)
    }
}

//settleScroll, 等標頭與資料區之 scrollLeft 連續 3 次(各 100ms)不變
async function settleScroll(page) {
    let last = null
    let n = 0
    await pollUntil('scrollLeft 靜止', async () => {
        let m = await measure(page)
        let s = `${m.hv}|${m.cv}`
        n = s === last ? n + 1 : 0
        last = s
        return n >= 3
    }, { timeout: 5000, interval: 100 })
    return measure(page)
}

//headCell, 目標欄之標頭格(欄名列)
const headCell = (page, id) => page.locator(`#g1 .ag-header-viewport .ag-header-row-column .ag-header-cell[col-id="${id}"]`)

//url, 宿主頁網址(查詢字串見 headerscroll.html)
const url = (q) => `${pageUrl('headerscroll.html')}?${q}`

//open, 開宿主頁並確認目標欄(最右一欄)確實只露出一部分
async function open(q, opt = {}) {
    let ctx = await openPage(url(q), { viewport: { width: 1600, height: 700 }, ...opt })
    let t = await findPartial(ctx.page)
    assert.ok(t, `前置: 表格右緣應有只露出一部分之欄(${q})`)
    let m = await measure(ctx.page)
    assert.strictEqual(m.hv, 0, '前置: 標頭 scrollLeft')
    assert.strictEqual(m.cv, 0, '前置: 資料區 scrollLeft')
    ctx.target = t
    return ctx
}

//assertSorted, 目標欄已依點擊升冪排序: aria-sort 為 ascending, 已渲染各列之值為升冪且第 0 列為最小值 v000(宿主頁各欄之原始順序皆非升冪)
async function assertSorted(page, id) {
    let sort = await headCell(page, id).getAttribute('aria-sort')
    assert.strictEqual(sort, 'ascending', `${id} 之 aria-sort`)
    let texts = (await columnTexts(page, '#g1', id)).filter((t) => t !== null)
    assert.deepStrictEqual(texts, texts.slice().sort(), `${id} 排序後各列應為升冪`)
    assert.strictEqual(texts[0], 'v000', `${id} 排序後第 0 列`)
}

//headVariants, 標頭範本三種: 預設、head-render slot、head-render slot 內含可聚焦元素
const HEADS = ['default', 'slot', 'focusable']

describe('e2e-headerscroll:標頭與資料區之水平對齊', function() {
    let ctx = null

    afterEach(async function() {
        if (ctx) {
            await ctx.close()
        }
        ctx = null
    })

    //---- 修: 標頭容器被單獨捲動後, 資料區須捲到相同位置 ----

    it('HS1 預設標頭: locator.click 被裁切之欄名文字, 標頭與資料區一致、欄名對齊資料、排序生效(R21)', async function() {
        ctx = await open('head=default&w=950')
        let { page, target } = ctx
        await page.locator(`#g1 .ag-header-viewport .ag-header-cell[col-id="${target.id}"] .ag-header-cell-text`).click()
        await waitAligned(page, 'HS1', target.id)
        await assertSorted(page, target.id)
        assertNoErrors(ctx)
    })

    it('HS2 預設標頭: locator.click 只露出一部分之標頭格, 標頭與資料區一致(R21)', async function() {
        ctx = await open('head=default&w=1000')
        let { page, target } = ctx
        await headCell(page, target.id).click()
        await waitAligned(page, 'HS2', target.id)
        await assertSorted(page, target.id)
        assertNoErrors(ctx)
    })

    it('HS3 head-render slot: locator.click 被裁切之欄名文字, 標頭與資料區一致(R21)', async function() {
        ctx = await open('head=slot&w=950')
        let { page, target } = ctx
        await page.locator(`#g1 .ag-header-viewport .ag-header-cell[col-id="${target.id}"] .ag-header-cell-text`).click()
        await waitAligned(page, 'HS3', target.id)
        await assertSorted(page, target.id)
        assertNoErrors(ctx)
    })

    it('HS4 head-render slot: locator.click 只露出一部分之標頭格, 標頭與資料區一致(R21)', async function() {
        ctx = await open('head=slot&w=1000')
        let { page, target } = ctx
        await headCell(page, target.id).click()
        await waitAligned(page, 'HS4', target.id)
        await assertSorted(page, target.id)
        assertNoErrors(ctx)
    })

    it('HS5 預設標頭、c0 釘選左側: locator.click 被裁切之欄名文字, 中間欄之標頭與資料區一致(R21)', async function() {
        ctx = await open('head=default&pin=1&w=950')
        let { page, target } = ctx
        await page.locator(`#g1 .ag-header-viewport .ag-header-cell[col-id="${target.id}"] .ag-header-cell-text`).click()
        await waitAligned(page, 'HS5', target.id)
        await assertSorted(page, target.id)
        assertNoErrors(ctx)
    })

    it('HS6 head-render slot、c0 釘選左側: locator.click 只露出一部分之標頭格(R21)', async function() {
        ctx = await open('head=slot&pin=1&w=1000')
        let { page, target } = ctx
        await headCell(page, target.id).click()
        await waitAligned(page, 'HS6', target.id)
        await assertSorted(page, target.id)
        assertNoErrors(ctx)
    })

    it('HS7 head-render slot 內含可聚焦元素(a): locator.click 被裁切之欄名, 標頭與資料區一致(R21)', async function() {
        ctx = await open('head=focusable&w=950')
        let { page, target } = ctx
        await page.locator(`#g1 .ag-header-viewport .ag-header-cell[col-id="${target.id}"] .ag-header-cell-text`).click()
        await waitAligned(page, 'HS7', target.id)
        await assertSorted(page, target.id)
        assertNoErrors(ctx)
    })

    it('HS8 最末欄半露且有垂直捲軸(80 列): locator.click 被裁切之欄名文字, 標頭與資料區一致(R21)', async function() {
        ctx = await open('head=default&n=7&rows=80&w=950')
        let { page, target } = ctx
        assert.strictEqual(target.id, 'c6', '前置: 最末欄')
        let hasV = await page.evaluate(() => {
            let b = document.querySelector('#g1 .ag-body-viewport')
            return b.scrollHeight > b.clientHeight
        })
        assert.ok(hasV, '前置: 應有垂直捲軸')
        await page.locator(`#g1 .ag-header-viewport .ag-header-cell[col-id="${target.id}"] .ag-header-cell-text`).click()
        await waitAligned(page, 'HS8', target.id)
        await assertSorted(page, target.id)
        assertNoErrors(ctx)
    })

    it('HS9 呼叫端對標頭內可聚焦元素呼叫 focus()(瀏覽器捲入可見): 標頭與資料區一致, 焦點仍在該元素(R21; 呼叫端程式觸發, 非使用者操作)', async function() {
        ctx = await open('head=focusable&w=950')
        let { page, target } = ctx
        await page.evaluate((id) => {
            document.querySelector(`#g1 .ag-header-cell[col-id="${id}"] .hr-a`).focus()
        }, target.id)
        await waitAligned(page, 'HS9', target.id)
        let active = await page.evaluate(() => document.activeElement.className)
        assert.strictEqual(active, 'hr-a', '焦點應仍在標頭內之 a')
        assertNoErrors(ctx)
    })

    it('HS10 呼叫端對欄名呼叫 scrollIntoView(): 標頭與資料區一致(R21; 呼叫端程式觸發, 非使用者操作)', async function() {
        ctx = await open('head=default&w=950')
        let { page, target } = ctx
        await page.evaluate((id) => {
            document.querySelector(`#g1 .ag-header-cell[col-id="${id}"] .ag-header-cell-text`).scrollIntoView({ inline: 'nearest', block: 'nearest' })
        }, target.id)
        //nearest 只把欄名文字(非整個標頭格)捲入可見, 故以欄名文字完整可見為準
        await waitAligned(page, 'HS10', target.id, false)
        let box = await page.evaluate((id) => {
            let r = document.querySelector(`#g1 .ag-header-cell[col-id="${id}"] .ag-header-cell-text`).getBoundingClientRect()
            let h = document.querySelector('#g1 .ag-header-viewport').getBoundingClientRect()
            return { left: r.left, right: r.right, hvLeft: h.left, hvRight: h.right }
        }, target.id)
        assert.ok(box.left >= box.hvLeft - 1 && box.right <= box.hvRight + 1, `欄名文字應完整可見: ${JSON.stringify(box)}`)
        assertNoErrors(ctx)
    })

    it('HS11 補償後可繼續橫向捲動: 滾輪回到最左, 標頭與資料區一致(R21)', async function() {
        ctx = await open('head=default&w=950')
        let { page, target } = ctx
        await page.locator(`#g1 .ag-header-viewport .ag-header-cell[col-id="${target.id}"] .ag-header-cell-text`).click()
        await waitAligned(page, 'HS11 點擊後', target.id)
        let m0 = await measure(page)
        assert.ok(m0.cv > 0, `點擊後資料區應已捲動: ${m0.cv}`)
        await page.mouse.move(400, 300)
        await page.mouse.wheel(-5000, 0)
        await pollUntil('回到最左', async () => (await measure(page)).cv === 0, { timeout: 5000, interval: 100 })
        await waitAligned(page, 'HS11 回到最左', 'c0', false)
        let m1 = await measure(page)
        assert.strictEqual(m1.hv, 0)
        assertNoErrors(ctx)
    })

    it('HS18 資料區已捲到最右, 呼叫端對末欄標頭 scrollIntoView(center): 標頭不得比資料區多捲數 px, 兩者一致(R21; 資料區捲動範圍小於標頭; 呼叫端程式觸發, 非使用者操作)', async function() {
        ctx = await open('head=default&n=7&w=950')
        let { page } = ctx
        //前置: 標頭容器可捲範圍須大於資料區(實測 ag-grid 之欄名列多出 4px 之 resize 把手), 否則本格不是在測範圍差
        let rng = await page.evaluate(() => {
            let hv = document.querySelector('#g1 .ag-header-viewport')
            let cv = document.querySelector('#g1 .ag-center-cols-viewport')
            return { head: hv.scrollWidth - hv.clientWidth, body: cv.scrollWidth - cv.clientWidth }
        })
        assert.ok(rng.head > rng.body, `前置: 標頭可捲範圍應大於資料區: ${JSON.stringify(rng)}`)
        await page.mouse.move(400, 300)
        await page.mouse.wheel(5000, 0)
        let m0 = await settleScroll(page)
        assert.ok(m0.cv > 0, `前置: 資料區應已捲到最右: ${m0.cv}`)
        assert.strictEqual(alignedProblem(m0, 'c6', true), null, '前置: 捲到最右後應一致')
        await page.evaluate(() => {
            document.querySelector('#g1 .ag-header-row-column .ag-header-cell[col-id="c6"]').scrollIntoView({ inline: 'center', block: 'nearest' })
        })
        await waitAligned(page, 'HS18', 'c6')
        assertNoErrors(ctx)
    })

    it('HS19 資料區已向右捲動而左緣欄被裁切: locator.click 該欄標頭格(標頭向左捲), 標頭與資料區一致、排序生效(R21; 方向相反)', async function() {
        ctx = await open('head=default&w=1000')
        let { page } = ctx
        await page.mouse.move(400, 300)
        await page.mouse.wheel(60, 0)
        let m0 = await settleScroll(page)
        assert.ok(m0.cv > 0, `前置: 資料區應已向右捲動: ${m0.cv}`)
        let left = await page.evaluate(() => {
            let hr = document.querySelector('#g1 .ag-header-viewport').getBoundingClientRect()
            let r = document.querySelector('#g1 .ag-header-viewport .ag-header-row-column .ag-header-cell[col-id="c0"]').getBoundingClientRect()
            return { cut: r.left < hr.left - 2 && r.right > hr.left + 20 }
        })
        assert.ok(left.cut, '前置: c0 左緣應被裁切')
        await headCell(page, 'c0').click()
        await waitAligned(page, 'HS19', 'c0')
        await assertSorted(page, 'c0')
        assertNoErrors(ctx)
    })

    it('HS20 呼叫端於同一任務內連續對兩欄(c6 再 c7)scrollIntoView(center): 以最後一次為準, 標頭與資料區一致(R21; 呼叫端程式觸發, 非使用者操作)', async function() {
        ctx = await open('head=default&w=950')
        let { page } = ctx
        //前置: 兩欄之欄名皆已渲染(欄虛擬化只渲染可見範圍附近)
        let both = await page.evaluate(() => ['c6', 'c7'].every((id) => !!document.querySelector(`#g1 .ag-header-cell[col-id="${id}"] .ag-header-cell-text`)))
        assert.ok(both, '前置: c6、c7 之欄名應已渲染')
        await page.evaluate(() => {
            document.querySelector('#g1 .ag-header-cell[col-id="c6"] .ag-header-cell-text').scrollIntoView({ inline: 'center', block: 'nearest' })
            document.querySelector('#g1 .ag-header-cell[col-id="c7"] .ag-header-cell-text').scrollIntoView({ inline: 'center', block: 'nearest' })
        })
        await waitAligned(page, 'HS20', 'c7', false)
        let m = await measure(page)
        let c = m.cells.c7
        assert.ok(c.left >= m.hvLeft - 1 && c.right <= m.hvRight + 1, `最後一次之 c7 應完整可見: ${JSON.stringify(c)}`)
        assertNoErrors(ctx)
    })

    it('HS21 元件銷毀後重建: 再對露出一部分之欄 locator.click, 標頭與資料區一致(R21)', async function() {
        ctx = await open('head=default&w=950')
        let { page } = ctx
        await page.click('#btnToggle')
        await pollUntil('元件已銷毀', async () => (await page.evaluate(() => document.querySelectorAll('#g1').length)) === 0, { timeout: 5000, interval: 100 })
        await page.click('#btnToggle')
        await waitGridIdle(page, { minCells: 1, timeout: 30000 })
        let target = await findPartial(page)
        assert.ok(target, '前置: 重建後表格右緣應有只露出一部分之欄')
        await page.locator(`#g1 .ag-header-viewport .ag-header-cell[col-id="${target.id}"] .ag-header-cell-text`).click()
        await waitAligned(page, 'HS21', target.id)
        await assertSorted(page, target.id)
        assertNoErrors(ctx)
    })

    it('HS22 無資料列(0 列)之表格: locator.click 只露出一部分之標頭格, 標頭與資料區 scrollLeft 一致(R21)', async function() {
        ctx = await open('head=default&w=1000&rows=0', { minCells: 0 })
        let { page, target } = ctx
        await headCell(page, target.id).click()
        let last = null
        try {
            await pollUntil('HS22 一致', async () => {
                last = await measure(page)
                return last.cv > 0 && Math.abs(last.hv - last.cv) < 1
            }, { timeout: 3000, interval: 100 })
        }
        catch (err) {
            throw new Error(`HS22: 標頭與資料區不一致; 量測 hv=${last && last.hv} cv=${last && last.cv}`)
        }
        assertNoErrors(ctx)
    })

    it('HS26 使用者剛拖曳橫向捲軸(500ms 內, ag-grid 只認捲軸為捲動來源)後標頭被捲到最右: 捲軸、資料區、標頭一致, 最末欄已渲染, 置頂置底列之儲存格與欄名對齊(R21; 以程式捲動捲軸元件模擬拖曳, headless 無法拖曳原生捲軸)', async function() {
        ctx = await open('head=default&w=1000&pinrows=1')
        let { page } = ctx
        //模擬使用者拖曳捲軸: 捲軸元件被捲動, ag-grid 以其為捲動來源並鎖定 500ms
        await page.evaluate(() => {
            document.querySelector('#g1 .ag-body-horizontal-scroll-viewport').scrollLeft = 1
        })
        await pollUntil('ag-grid 已處理捲軸捲動', async () => (await measure(page)).cv === 1, { timeout: 3000, interval: 50 })
        //鎖定窗內標頭被捲到最右(呼叫端程式或瀏覽器之捲入可見)
        await page.evaluate(() => {
            let hv = document.querySelector('#g1 .ag-header-viewport')
            hv.scrollLeft = hv.scrollWidth
        })
        let last = null
        try {
            await pollUntil('HS26 一致', async () => {
                last = await page.evaluate(() => {
                    let g = document.querySelector('#g1')
                    let hv = g.querySelector('.ag-header-viewport').scrollLeft
                    let cv = g.querySelector('.ag-center-cols-viewport').scrollLeft
                    let fake = g.querySelector('.ag-body-horizontal-scroll-viewport').scrollLeft
                    let lastCell = !!g.querySelector('.ag-center-cols-container .ag-row[row-index="0"] .ag-cell[col-id="c11"]')
                    return { hv, cv, fake, lastCell }
                })
                return last.cv > 1 && Math.abs(last.hv - last.cv) < 1 && Math.abs(last.fake - last.cv) < 1 && last.lastCell
            }, { timeout: 3000, interval: 100 })
        }
        catch (err) {
            throw new Error(`HS26: 捲軸元件、資料區、標頭不一致或最末欄未渲染; 量測 ${JSON.stringify(last)}`)
        }
        await waitAligned(page, 'HS26', 'c11', false)
        //置頂、置底列以 translateX 隨 ag-grid 內部之水平位置同步: 其儲存格左緣須與同欄欄名左緣對齊
        let pinned = await page.evaluate(() => {
            let g = document.querySelector('#g1')
            let out = {}
            for (let sel of ['.ag-floating-top-container', '.ag-floating-bottom-container']) {
                g.querySelectorAll(`${sel} .ag-row .ag-cell[col-id]`).forEach((c) => {
                    let id = c.getAttribute('col-id')
                    let h = g.querySelector(`.ag-header-viewport .ag-header-row-column .ag-header-cell[col-id="${id}"]`)
                    if (h) {
                        out[`${sel}|${id}`] = c.getBoundingClientRect().left - h.getBoundingClientRect().left
                    }
                })
            }
            return out
        })
        let ids = Object.keys(pinned)
        assert.ok(ids.length >= 6, `置頂置底列可比對之儲存格過少: ${JSON.stringify(pinned)}`)
        assert.deepStrictEqual(ids.filter((k) => Math.abs(pinned[k]) > TOL), [], `置頂置底列之儲存格較欄名錯位: ${JSON.stringify(pinned)}`)
        assertNoErrors(ctx)
    })

    it('HS28 經 getApi 將 c11 釘選於右側後, locator.click 只露出一部分之欄名: 中間欄之標頭與資料區一致(R21; 右側釘選由 API 到達, 套件無對應 opt)', async function() {
        ctx = await openPage(url('head=default&w=1000'), { viewport: { width: 1600, height: 700 } })
        let { page } = ctx
        //setup: 以 grid API 設定右側釘選(模擬呼叫端之設定, 非使用者操作)
        await page.evaluate(() => {
            document.querySelector('#g1').__vue__.getApi().applyColumnState({ state: [{ colId: 'c11', pinned: 'right' }] })
        })
        await pollUntil('c11 已釘選右側', async () => (await page.evaluate(() => !!document.querySelector('#g1 .ag-pinned-right-header .ag-header-cell[col-id="c11"]'))), { timeout: 5000, interval: 100 })
        await waitGridIdle(page, { minCells: 1, timeout: 30000 })
        let target = await findPartial(page)
        assert.ok(target, '前置: 中間欄右緣應有只露出一部分之欄')
        await headCell(page, target.id).click()
        await waitAligned(page, 'HS28', target.id)
        await assertSorted(page, target.id)
        assertNoErrors(ctx)
    })

    //---- 保留: 既有行為不變 ----

    for (const head of ['default', 'focusable']) {
        it(`HS12 ${head}: 真滑鼠點擊只露出一部分之欄名(游標在可見部分): 不捲動、排序生效、標頭格取得焦點、標頭與資料區一致(保留)`, async function() {
            ctx = await open(`head=${head}&w=1000`)
            let { page, target } = ctx
            await page.mouse.click((target.left + target.hvRight) / 2, target.top + target.height / 2)
            await pollUntil('排序', async () => (await headCell(page, target.id).getAttribute('aria-sort')) === 'ascending', { timeout: 3000, interval: 100 })
            //負向觀察窗: 點擊不應引起任何橫向捲動
            await page.waitForTimeout(400)
            let m = await measure(page)
            assert.strictEqual(m.hv, 0, '標頭 scrollLeft')
            assert.strictEqual(m.cv, 0, '資料區 scrollLeft')
            assert.strictEqual(alignedProblem(m, target.id, false), null)
            await assertSorted(page, target.id)
            let focus = await page.evaluate(() => document.activeElement.getAttribute('col-id'))
            assert.strictEqual(focus, target.id, '焦點應在被點擊之標頭格')
            assertNoErrors(ctx)
        })
    }

    for (const head of ['default', 'slot']) {
        it(`HS13 ${head}: 對照組, 先以滾輪捲到該欄完整可見再 locator.click: 不再捲動、排序生效、標頭與資料區一致(保留)`, async function() {
            ctx = await open(`head=${head}&w=1000`)
            let { page, target } = ctx
            await page.mouse.move(400, 300)
            await page.mouse.wheel(Math.ceil(target.right - target.hvRight) + 10, 0)
            await pollUntil('目標欄完整可見', async () => {
                let m = await measure(page)
                let c = m.cells[target.id]
                return !!c && c.right <= m.hvRight && c.left >= m.hvLeft
            }, { timeout: 5000, interval: 100 })
            let before = await settleScroll(page)
            assert.ok(before.cv > 0, '前置: 已向右捲動')
            assert.strictEqual(alignedProblem(before, target.id, true), null)
            await headCell(page, target.id).click()
            await pollUntil('排序', async () => (await headCell(page, target.id).getAttribute('aria-sort')) === 'ascending', { timeout: 3000, interval: 100 })
            //負向觀察窗: 目標欄已完整可見, 點擊不應再引起捲動
            await page.waitForTimeout(400)
            let after = await measure(page)
            assert.strictEqual(after.hv, before.hv, '標頭 scrollLeft 不變')
            assert.strictEqual(after.cv, before.cv, '資料區 scrollLeft 不變')
            assert.strictEqual(alignedProblem(after, target.id, true), null)
            await assertSorted(page, target.id)
            assertNoErrors(ctx)
        })
    }

    for (const head of ['default', 'focusable']) {
        it(`HS14 ${head}: 鍵盤 Tab 進入標頭後以右方向鍵逐欄走到最末欄: 每一步標頭與資料區一致、焦點隨之、目標欄完整可見(保留)`, async function() {
            ctx = await open(`head=${head}&w=1000`)
            let { page } = ctx
            await page.focus('#btnBefore')
            await page.keyboard.press('Tab')
            await pollUntil('Tab 進入標頭', async () => (await page.evaluate(() => document.activeElement.getAttribute('col-id'))) === 'c0', { timeout: 3000, interval: 100 })
            for (let i = 1; i < 12; i++) {
                await page.keyboard.press('ArrowRight')
                let id = `c${i}`
                await pollUntil(`焦點到 ${id}`, async () => (await page.evaluate(() => document.activeElement.getAttribute('col-id'))) === id, { timeout: 3000, interval: 100 })
                await waitAligned(page, `HS14 ${id}`, id)
            }
            assertNoErrors(ctx)
        })
    }

    //rapidWheel, 連續 10 次橫向滾輪(各 40px, 不等待), 過程中記錄資料區每次 scroll 事件之位置; 資料區只能前進不得倒退(補償不得把它拉回標頭之舊位置), 最終為 400 且與標頭一致
    async function rapidWheel(page, x) {
        await page.evaluate(() => {
            let cv = document.querySelector('#g1 .ag-center-cols-viewport')
            window.__cvLog = []
            cv.addEventListener('scroll', () => window.__cvLog.push(cv.scrollLeft))
        })
        await page.mouse.move(x, 300)
        for (let i = 0; i < 10; i++) {
            await page.mouse.wheel(40, 0)
        }
        let m = await settleScroll(page)
        let log = await page.evaluate(() => window.__cvLog)
        assert.ok(log.length > 0, '資料區應有 scroll 事件')
        assert.ok(log.every((v, i) => i === 0 || v >= log[i - 1]), `資料區不得倒退: ${JSON.stringify(log)}`)
        assert.strictEqual(m.cv, 400, '資料區最終位置(10×40)')
        assert.strictEqual(alignedProblem(m, null, false), null)
    }

    it('HS15 連續快速橫向滾輪(10 次, 不等待): 資料區只前進不倒退、最終 400 且與標頭一致, 補償不與 ag-grid 之同步互搶(保留)', async function() {
        ctx = await open('head=default&w=1000')
        await rapidWheel(ctx.page, 400)
        assertNoErrors(ctx)
    })

    it('HS16 釘選左側欄之表格: 連續快速橫向滾輪, 資料區只前進不倒退、最終 400 且中間欄之標頭與資料區一致(保留)', async function() {
        ctx = await open('head=slot&pin=1&w=1000')
        await rapidWheel(ctx.page, 600)
        assertNoErrors(ctx)
    })

    it('HS23 同一任務內標頭被捲到 100、資料區被捲到 300: 以資料區為準, 兩者最終皆為 300(ag-grid 之資料區→標頭同步優先, 補償不得推翻; 保留)', async function() {
        ctx = await open('head=default&w=1000')
        let { page } = ctx
        await page.evaluate(() => {
            document.querySelector('#g1 .ag-header-viewport').scrollLeft = 100
            document.querySelector('#g1 .ag-center-cols-viewport').scrollLeft = 300
        })
        let m = await settleScroll(page)
        assert.strictEqual(m.cv, 300, '資料區 scrollLeft')
        assert.strictEqual(m.hv, 300, '標頭 scrollLeft')
        assertNoErrors(ctx)
    })

    it('HS24 標頭捲動事件之後、補償確認之前資料區又被捲動(連續滾輪之情形): 補償不得把資料區拉回標頭的舊位置, 兩者最終皆為資料區之位置(保留)', async function() {
        ctx = await open('head=default&w=1000')
        let { page } = ctx
        await page.evaluate(() => {
            let hv = document.querySelector('#g1 .ag-header-viewport')
            let cv = document.querySelector('#g1 .ag-center-cols-viewport')
            //本監聽註冊於元件之監聽之後, 故在元件排定確認之後才執行
            hv.addEventListener('scroll', () => {
                cv.scrollLeft = 400
            }, { once: true })
            hv.scrollLeft = 100
        })
        let m = await settleScroll(page)
        assert.strictEqual(m.cv, 400, '資料區 scrollLeft')
        assert.strictEqual(m.hv, 400, '標頭 scrollLeft')
        assertNoErrors(ctx)
    })

    it('HS27 同一任務內先將資料區捲到 300、再將標頭捲到 400: 以資料區為準, 兩者最終皆為 300(混合順序, ag-grid 同步優先; 保留)', async function() {
        ctx = await open('head=default&w=1000')
        let { page } = ctx
        await page.evaluate(() => {
            document.querySelector('#g1 .ag-center-cols-viewport').scrollLeft = 300
            document.querySelector('#g1 .ag-header-viewport').scrollLeft = 400
        })
        let m = await settleScroll(page)
        assert.strictEqual(m.cv, 300, '資料區 scrollLeft')
        assert.strictEqual(m.hv, 300, '標頭 scrollLeft')
        assertNoErrors(ctx)
    })

    it('HS25 滑鼠滾輪置於標頭上: 標頭與資料區皆不捲動(ag-grid 31 現行行為), 維持一致(保留)', async function() {
        ctx = await open('head=default&w=1000')
        let { page } = ctx
        let hb = await page.evaluate(() => {
            let r = document.querySelector('#g1 .ag-header-viewport .ag-header-row-column').getBoundingClientRect()
            return { x: r.left + 300, y: r.top + r.height / 2 }
        })
        await page.mouse.move(hb.x, hb.y)
        await page.mouse.wheel(200, 0)
        //負向觀察窗
        await page.waitForTimeout(500)
        let m = await measure(page)
        assert.strictEqual(m.hv, 0, '標頭 scrollLeft')
        assert.strictEqual(m.cv, 0, '資料區 scrollLeft')
        assert.strictEqual(alignedProblem(m, null, false), null)
        assertNoErrors(ctx)
    })

    it('HS17 元件銷毀: 標頭容器之 scroll 監聽須成對移除(R21)', async function() {
        ctx = await open('head=default&w=1000')
        let { page } = ctx
        let s0 = await page.evaluate(() => ({ added: window.__hvScroll.added, removed: window.__hvScroll.removed }))
        assert.ok(s0.added >= 1, `標頭容器應已註冊 scroll 監聽: ${JSON.stringify(s0)}`)
        assert.strictEqual(s0.removed, 0, '銷毀前不應移除')
        await page.click('#btnToggle')
        await pollUntil('元件已銷毀', async () => (await page.evaluate(() => document.querySelectorAll('#g1').length)) === 0, { timeout: 5000, interval: 100 })
        let s1 = await page.evaluate(() => ({ added: window.__hvScroll.added, removed: window.__hvScroll.removed }))
        assert.strictEqual(s1.removed, s1.added, `註冊與移除須成對: ${JSON.stringify(s1)}`)
        //銷毀後等一段時間, 不得有延後排程之例外(負向觀察窗)
        await page.waitForTimeout(500)
        assertNoErrors(ctx)
    })

})
