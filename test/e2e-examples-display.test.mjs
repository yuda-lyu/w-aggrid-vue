//官方範例(對外文件)之顯示類(規則帳本 R06、R08、R11、R18、R20; 第 6 節已知限制 9)
//使用者路徑: ①開 docs/examples 之範例頁或 app.html?cmp=<範例名>(CDN 資源一律路由至本機) ②看畫面、停留儲存格或表頭、於表頭浮動過濾輸入; showKeys 類範例於 1、2 秒後自行切換欄位
//③看到 slot 之渲染、提示、欄序、對齊、選單與過濾事件 ④過濾值以真鍵盤輸入 ⑤比對顏色、文字、欄序、幾何量測 ⑥無副作用
//app.html 載入的是 gDistApp 之產物 app.umd.js(內含建置當時之元件), 不經本地 dist: APP- 開頭之格驗範例建置產物之選單與標題(R18), 不驗本次 dist 之修改
import assert from 'assert'
import { openPage, exampleUrl, headerOrder, typeIntoFloatingFilter, assertNoErrors } from './tools/e2e-setup.mjs'
import { waitUntilExist } from './tools/e2eLib.mjs'

let VIEW = { width: 1400, height: 700 }

function openExample(name, query = '', opt = {}) {
    return openPage(exampleUrl(name, query), { routeExternalResources: true, viewport: VIEW, ...opt })
}

//assertExamplePage, 範例頁之標題與兩個連結皆指向自身(R18 命名一致)
async function assertExamplePage(page, name, h1) {
    let head = await page.locator('.bkh').first().innerText()
    assert.strictEqual(head.split('\n')[0].trim(), h1)
    let links = await page.locator('a.item-link').evaluateAll((as) => as.map((a) => a.getAttribute('href')))
    assert.strictEqual(links.length, 2)
    assert.ok(links.every((l) => l.endsWith(`ex-${name}.html`)), JSON.stringify(links))
}

//waitHeaderOrder, 等畫面欄序(依表頭螢幕座標)等於預期
async function waitHeaderOrder(page, expected) {
    await waitUntilExist(page, `畫面欄序為 ${expected.join(',')}`, (e) => {
        let ks = Array.from(document.querySelectorAll('.ag-header-row-column .ag-header-cell'))
            .map((h) => [h.getBoundingClientRect().left, h.getAttribute('col-id')])
            .sort((a, b) => a[0] - b[0])
            .map((x) => x[1])
        return JSON.stringify(ks) === JSON.stringify(e)
    }, { arg: expected, timeout: 15000 })
}

//alignMeasure, 對齊範例第 0 列各欄中 56px 寬控制項相對儲存格之上下左右距離
function alignMeasure(page) {
    return page.evaluate(() => {
        let r2 = (v) => Math.round(v * 100) / 100
        let out = {}
        for (let col of ['noWrap', 'center', 'top', 'bottom', 'left', 'right']) {
            let c = document.querySelector(`.ag-center-cols-container .ag-row[row-index="0"] .ag-cell[col-id="${col}"]`)
            let spans = Array.from(c.querySelectorAll('span')).filter((s) => getComputedStyle(s).width === '56px')
            let k = spans[spans.length - 1]
            let cr = c.getBoundingClientRect()
            let kr = k.getBoundingClientRect()
            out[col] = { top: r2(kr.top - cr.top), bottom: r2(cr.bottom - kr.bottom), left: r2(kr.left - cr.left), right: r2(cr.right - kr.right) }
        }
        return out
    })
}

let SLOT_NAMES = ['slotCellRender', 'slotCellTooltip', 'slotHeadRender', 'slotHeadTooltip']

describe('e2e-examples-display:官方顯示類範例', function() {
    let ctx = null

    afterEach(async function() {
        if (ctx) {
            await ctx.close()
        }
        ctx = null
    })

    it('SL1 ex-slotCellRender:cell-render slot 生效(各欄顏色)(R06、R18)', async function() {
        ctx = await openExample('ex-slotCellRender.html')
        await assertExamplePage(ctx.page, 'slotCellRender', 'slot: cell-render')
        let cs = await ctx.page.evaluate(() => {
            let f = (sel) => {
                let el = document.querySelector(sel + ' span span')
                return el ? getComputedStyle(el).color : null
            }
            return { make: f('.ag-cell[col-id="make"]'), model: f('.ag-cell[col-id="model"]'), price: f('.ag-cell[col-id="price"]') }
        })
        assert.deepStrictEqual(cs, { make: 'rgb(170, 170, 170)', model: 'rgb(34, 204, 102)', price: 'rgb(255, 34, 102)' })
        assertNoErrors(ctx)
    })

    it('SL2 ex-slotHeadRender:head-render slot 生效(表頭文字)(R08、R18)', async function() {
        ctx = await openExample('ex-slotHeadRender.html')
        await assertExamplePage(ctx.page, 'slotHeadRender', 'slot: head-render')
        let t = await ctx.page.locator('.ag-header').innerText()
        for (let s of ['生產製造商', '車款型號', '虛擬販售價格']) {
            assert.ok(t.includes(s), `表頭應含 ${s}: ${t}`)
        }
        assertNoErrors(ctx)
    })

    it('SL3 ex-slotCellTooltip:停留 make 儲存格後出現 cell-tooltip 之內容(R06、R18)', async function() {
        ctx = await openExample('ex-slotCellTooltip.html')
        await assertExamplePage(ctx.page, 'slotCellTooltip', 'slot: cell-tooltip')
        assert.ok(!(await ctx.page.evaluate(() => document.body.innerText.includes('[生產製造商]'))), '停留前不應出現')
        await ctx.page.locator('.ag-cell[col-id="make"]').first().hover()
        await waitUntilExist(ctx.page, '提示 [生產製造商]', () => document.body.innerText.includes('[生產製造商]'))
        assertNoErrors(ctx)
    })

    it('SL4 ex-slotHeadTooltip:停留 price 表頭後出現 head-tooltip 之內容(R08、R18)', async function() {
        ctx = await openExample('ex-slotHeadTooltip.html')
        await assertExamplePage(ctx.page, 'slotHeadTooltip', 'slot: head-tooltip')
        assert.ok(!(await ctx.page.evaluate(() => document.body.innerText.includes('虛擬販售價格'))), '停留前不應出現')
        await ctx.page.locator('.ag-header-cell[col-id="price"]').first().hover()
        await waitUntilExist(ctx.page, '提示 虛擬販售價格', () => document.body.innerText.includes('虛擬販售價格'))
        assertNoErrors(ctx)
    })

    let appTitles = { slotCellRender: 'slot: cell-render', slotCellTooltip: 'slot: cell-tooltip', slotHeadRender: 'slot: head-render', slotHeadTooltip: 'slot: head-tooltip' }
    for (let name of Object.keys(appTitles)) {
        it(`APP-${name} app.html?cmp=${name}:選單之 slot 群 4 項、標題,無已移除之舊名(R18)`, async function() {
            ctx = await openExample('app.html', `?cmp=${name}`)
            let body = await ctx.page.evaluate(() => document.body.innerText)
            assert.ok(SLOT_NAMES.every((k) => body.includes(k)), '選單應含 slot 群 4 項')
            assert.ok(body.includes(appTitles[name]), '標題')
            assert.ok(!/kpCellRender|kpCellTooltip|kpHeadRender|kpHeadTooltip/.test(body), '不應出現舊名')
            assert.deepStrictEqual(ctx.external.unmapped, [], '未對照之外部資源')
            assertNoErrors(ctx)
        })
    }

    it('APP-kpCellFormat app.html?cmp=kpCellFormat:標題與格式化生效(make 大寫、price 千分位兩位小數)(R07、R18)', async function() {
        ctx = await openExample('app.html', '?cmp=kpCellFormat')
        let body = await ctx.page.evaluate(() => document.body.innerText)
        assert.ok(body.includes('kpCellFormat'))
        let cells = await ctx.page.evaluate(() => {
            let f = (col) => {
                let c = document.querySelector(`.ag-center-cols-container .ag-row[row-index="0"] .ag-cell[col-id="${col}"]`)
                return c ? c.innerText : null
            }
            return { make: f('make'), price: f('price') }
        })
        assert.deepStrictEqual(cells, { make: 'TOYOTA', price: '35,000.00' })
        assertNoErrors(ctx)
    })

    it('SKX1 ex-showKeys:1 秒後欄序 price,make,model,2 秒後 make,price(R11、R18)', async function() {
        ctx = await openExample('ex-showKeys.html', '', { idle: false })
        await waitHeaderOrder(ctx.page, ['price', 'make', 'model'])
        await waitHeaderOrder(ctx.page, ['make', 'price'])
        assertNoErrors(ctx)
    })

    it('SKX2 ex-showKeysApplyOrder:隱藏 model 後 make,price,重勾後回原位 make,model,price(R11、R18)', async function() {
        ctx = await openExample('ex-showKeysApplyOrder.html', '', { idle: false })
        await waitHeaderOrder(ctx.page, ['make', 'price'])
        await waitUntilExist(ctx.page, '#ckmsg 顯示 make,price', () => document.querySelector('#ckmsg').innerText.includes('displayed keys: ["make","price"]'))
        await waitHeaderOrder(ctx.page, ['make', 'model', 'price'])
        await waitUntilExist(ctx.page, '#ckmsg 顯示 make,model,price', () => document.querySelector('#ckmsg').innerText.includes('displayed keys: ["make","model","price"]'))
        assertNoErrors(ctx)
    })

    it('EXF1 ex-filterChange:掛載時顯示 from filterall 之事件,於 make 輸入 Toy 後顯示 from heads 且含其模型(R20、R18)', async function() {
        ctx = await openExample('ex-filterChange.html')
        await assertExamplePage(ctx.page, 'filterChange', 'filterChange')
        let msg = () => ctx.page.evaluate(() => JSON.parse(document.querySelector('#ckmsg').innerText.split('msg: ')[1] || 'null'))
        await waitUntilExist(ctx.page, '#ckmsg 顯示掛載之事件', () => document.querySelector('#ckmsg').innerText.includes('"from": "filterall"'))
        assert.deepStrictEqual(await msg(), { from: 'filterall', filterall: '', flts: [], isFilter: false })
        await typeIntoFloatingFilter(ctx.page, '.ag-root-wrapper', 0, 'Toy')
        await waitUntilExist(ctx.page, '#ckmsg 顯示 heads 之事件', () => document.querySelector('#ckmsg').innerText.includes('"from": "heads"'))
        assert.deepStrictEqual(await msg(), { from: 'heads', filterall: '', flts: [{ filterType: 'text', type: 'contains', filter: 'Toy' }], isFilter: true })
        assertNoErrors(ctx)
    })

    //對齊範例: 儲存格 100×27、控制項高 22; 預期值為 2026-09-16 定案之量測(已知限制 9:垂直置中由呼叫端以 flex wrapper 處理)
    let ALIGN = {
        noWrap: { top: 4.77, bottom: 0.23, h: 'center' },
        center: { top: 2.5, bottom: 2.5, h: 'center' },
        top: { top: 1, bottom: 4, h: 'center' },
        bottom: { top: 4, bottom: 1, h: 'center' },
        left: { top: 2.5, bottom: 2.5, h: 'left' },
        right: { top: 2.5, bottom: 2.5, h: 'right' },
    }
    for (let col of Object.keys(ALIGN)) {
        it(`AL-${col} ex-slotCellRenderAlign 之 ${col} 欄:上 ${ALIGN[col].top} 下 ${ALIGN[col].bottom}、水平${ALIGN[col].h}(已知限制 9、R18)`, async function() {
            ctx = await openExample('ex-slotCellRenderAlign.html')
            let m = (await alignMeasure(ctx.page))[col]
            assert.strictEqual(m.top, ALIGN[col].top, JSON.stringify(m))
            assert.strictEqual(m.bottom, ALIGN[col].bottom, JSON.stringify(m))
            if (ALIGN[col].h === 'center') {
                assert.strictEqual(m.left, m.right, JSON.stringify(m))
            }
            else {
                assert.strictEqual(m[ALIGN[col].h], 12, JSON.stringify(m))
            }
            assertNoErrors(ctx)
        })
    }

    it('AL-head ex-slotCellRenderAlign:6 個表頭皆不截字(R18)', async function() {
        ctx = await openExample('ex-slotCellRenderAlign.html')
        let trunc = await ctx.page.evaluate(() => Array.from(document.querySelectorAll('.ag-header-row-column .ag-header-cell-text')).map((e) => ({ t: e.innerText, sw: e.scrollWidth, cw: e.clientWidth })))
        assert.strictEqual(trunc.length, 6)
        assert.ok(trunc.every((x) => x.sw <= x.cw), JSON.stringify(trunc))
        assertNoErrors(ctx)
    })

    for (let [cmp, title] of [['slotCellRenderAlign', 'slot: cell-render (align)'], ['showKeysApplyOrder', 'showKeys (applyOrder: false)']]) {
        it(`APP-${cmp} app.html?cmp=${cmp}:選單與標題(R18)`, async function() {
            ctx = await openExample('app.html', `?cmp=${cmp}`)
            let body = await ctx.page.evaluate(() => document.body.innerText)
            assert.ok(body.includes(cmp), '選單')
            assert.ok(body.includes(title), '標題')
            assertNoErrors(ctx)
        })
    }

})
