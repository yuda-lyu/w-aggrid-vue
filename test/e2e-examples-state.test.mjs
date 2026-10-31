//官方範例 state(對外文件; 規則帳本 R18、R26; Gitea issue #31)
//使用者路徑: ①開範例頁(依 gExtractHtml、gDocExams 之作法自 src 當場產製, CDN 資源一律路由至本機, w-aggrid-vue 為本地 dist; 同形性見 unit-appExamples 之 BLD1)
//②無操作: 範例於掛載後 0.1 秒把容器由 620px 改為 900px, 並於頁內列出根節點 state 屬性之變化 ③看到說明文字、表格與 state 變化清單 ④無輸入
//⑤比對說明文字(值與轉換時點、等待寫法)與清單(依序為 showing、改寬、shown) ⑥無副作用
import assert from 'assert'
import { openPage, useTmpDir, assertNoErrors, assertExamplePage } from './tools/e2e-setup.mjs'
import { waitUntilExist } from './tools/e2eLib.mjs'
import { buildExample } from './tools/exampleBuild.mjs'

const VIEW = { width: 1400, height: 900 }

describe('e2e-examples-state:官方範例 state', function() {
    let tmp = useTmpDir('e2e-examples-state')
    let page = null
    let ctx = null

    before(async function() {
        tmp.make()
        page = await buildExample('AppState.vue', tmp.dir)
    })

    afterEach(async function() {
        if (ctx) {
            await ctx.close()
        }
        ctx = null
    })

    after(function() {
        tmp.clean()
    })

    it('EXS1 ex-state:標題與連結、說明文字(state 之值、轉換時點、淡入期間改寬之補繪、等待寫法)(R18、R26)', async function() {
        ctx = await openPage(page.url, { routeExternalResources: true, viewport: VIEW, idle: false })
        await assertExamplePage(ctx.page, 'state', 'state')
        let desc = await ctx.page.locator('#ckdesc').innerText()
        //說明文字須載明: 屬性名與位置、兩個值、單向轉換、淡入期間改寬之補繪(refreshCells、穩定時間)、等待寫法
        for (let s of ['CompCssWAggridVue', 'state="showing"', 'state="shown"', '單向轉換', 'api.refreshCells({ force: true })', '0.35 秒', '淡入期間尺寸未改變者不重繪', '[state="shown"]']) {
            assert.ok(desc.includes(s), `說明文字應含 ${s}`)
        }
        assert.deepStrictEqual(ctx.external.unmapped, [], '範例頁之外部資源皆已對照本機')
        assertNoErrors(ctx)
    })

    it('EXS2 ex-state:頁內清單依序列出 state="showing"(初值)、容器改寬、state="shown"; 終態時根節點屬性為 shown(R26)', async function() {
        ctx = await openPage(page.url, { routeExternalResources: true, viewport: VIEW, idle: false })
        await waitUntilExist(ctx.page, '清單出現 state="shown"', () => document.querySelector('#ckmsg').innerText.includes('state="shown"'), { timeout: 30000 })
        let lines = (await ctx.page.locator('#ckmsg').innerText()).split('\n').map((s) => s.replace(/^\d+ms: /, ''))
        assert.deepStrictEqual(lines, ['state="showing"', 'container width 620px -> 900px', 'state="shown"'])
        //清單之 shown 與根節點實際屬性相符, 且淡入已結束(外層容器 opacity 為 1)
        let r = await ctx.page.evaluate(() => {
            let root = document.querySelector('.CompCssWAggridVue')
            return { state: root.getAttribute('state'), opacity: getComputedStyle(root.firstElementChild).opacity }
        })
        assert.deepStrictEqual(r, { state: 'shown', opacity: '1' })
        assertNoErrors(ctx)
    })
})
