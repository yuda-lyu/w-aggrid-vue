//範例(對外文件)之接線與產製(規則帳本 R18、R24、R25、R26; Gitea issue #26 之範例 localeText、showOverlayWhenFilteredEmpty,issue #31 之範例 state)
//unit 層: 只讀 src 與 docs/examples 之檔案並於 node 產製範例頁, 不起瀏覽器
//R18: 新增或改名範例時, App.vue 之選單、v-if、import、components 四處一致; 範例頁之 example/code 連結指向自身(ex-<名稱>.html)
//R18: 範例頁之外部資源與 e2e-setup 之 EXTERNAL 對照表一致(EXT1、EXT2): w-package-tools 之 genDocsExams 改寫規則變動、範例頁引用變動時由此格先紅
import assert from 'assert'
import fs from 'fs'
import path from 'path'
import { projRoot, useTmpDir, EXTERNAL, findExternal } from './tools/e2e-setup.mjs'
import { buildExample, getCasename } from './tools/exampleBuild.mjs'

const SRC = path.join(projRoot, 'src')

//範例檔(src/App<名稱>.vue, 不含 App.vue)
const FILES = fs.readdirSync(SRC).filter((f) => /^App\w*\.vue$/.test(f) && f !== 'App.vue').map((f) => f.replace('.vue', ''))

//App.vue 之四處: import、components、v-if、選單(單行之葉節點 { name: '<名稱>' })
function parseApp() {
    let app = fs.readFileSync(path.join(SRC, 'App.vue'), 'utf8').replace(/\r\n/g, '\n')
    let imports = [...app.matchAll(/^import (App\w+) from '\.\/(App\w+)\.vue'$/gm)].map((m) => ({ name: m[1], file: m[2] }))
    let comps = [...app.match(/components: \{\n([\s\S]*?)\n {4}\},/)[1].matchAll(/^\s{8}(\w+),$/gm)].map((m) => m[1]).filter((n) => /^App\w+$/.test(n))
    let vifs = [...app.matchAll(/<(App\w+) v-if="cmpPick==='(\w+)'"><\/\1>/g)].map((m) => ({ cmp: m[1], pick: m[2] }))
    let start = app.indexOf('let cmps = [')
    let menu = app.slice(start, app.indexOf('return {', start))
    let leaves = [...menu.matchAll(/\{ name: '(\w+)' \}/g)].map((m) => m[1])
    return { imports, comps, vifs, leaves }
}

//sorted, 供集合相等比對
function sorted(a) {
    return a.slice().sort()
}

describe('unit-appExamples:範例之接線與產製', function() {
    let tmp = useTmpDir('unit-appExamples')

    before(function() {
        tmp.make()
    })

    after(function() {
        tmp.clean()
    })

    it('AX1 App.vue 之 import、components、v-if、選單四處與 src/App*.vue 一一對應(R18)', function() {
        //spec R18: 新增或改名範例時, App.vue 之選單、v-if、import、components 四處一致
        let { imports, comps, vifs, leaves } = parseApp()
        assert.ok(FILES.length > 0)
        assert.deepStrictEqual(sorted(imports.map((v) => v.file)), sorted(FILES), 'import 與檔案')
        assert.ok(imports.every((v) => v.name === v.file), 'import 名稱與檔名一致')
        assert.deepStrictEqual(sorted(comps), sorted(FILES), 'components 與檔案')
        assert.deepStrictEqual(sorted(vifs.map((v) => v.cmp)), sorted(FILES), 'v-if 與檔案')
        assert.deepStrictEqual(sorted(vifs.map((v) => v.pick)), sorted(leaves), 'v-if 之名稱與選單葉節點')
        assert.strictEqual(new Set(leaves).size, leaves.length, '選單葉節點名稱不重複')
    })

    it('AX2 本次新增之範例 AppLocaleText、AppShowOverlayWhenFilteredEmpty 於四處皆在, 選單名為 localeText、showOverlayWhenFilteredEmpty(R18 命名: 選項名之 camelCase)', function() {
        let { imports, comps, vifs, leaves } = parseApp()
        for (let [cmp, pick] of [['AppLocaleText', 'localeText'], ['AppShowOverlayWhenFilteredEmpty', 'showOverlayWhenFilteredEmpty']]) {
            assert.ok(FILES.includes(cmp), `${cmp} 檔案`)
            assert.ok(imports.some((v) => v.file === cmp), `${cmp} import`)
            assert.ok(comps.includes(cmp), `${cmp} components`)
            assert.ok(vifs.some((v) => v.cmp === cmp && v.pick === pick), `${cmp} v-if`)
            assert.ok(leaves.includes(pick), `${cmp} 選單`)
            assert.strictEqual(getCasename(`${cmp}.vue`), pick, '產製名稱')
        }
    })

    it('AX3 每個範例頁之 example/code 兩個連結皆指向自身 ex-<名稱>.html(R18)', function() {
        for (let f of FILES) {
            let t = fs.readFileSync(path.join(SRC, `${f}.vue`), 'utf8')
            let hrefs = [...t.matchAll(/<a href="([^"]+)"/g)].map((m) => m[1])
            let cn = getCasename(`${f}.vue`)
            assert.strictEqual(hrefs.length, 2, `${f} 連結數`)
            assert.ok(hrefs.every((h) => h.endsWith(`/ex-${cn}.html`)), `${f}: ${JSON.stringify(hrefs)}`)
        }
    })

    it('AX4 docs/examples 之每個 ex-<名稱>.html 皆有對應之 src 範例(無改名後遺留之舊頁; 尚未重產之新範例不在此限, 重產依 script.txt)(R18)', function() {
        let docs = fs.readdirSync(path.join(projRoot, 'docs', 'examples')).filter((f) => /^ex-.*\.html$/.test(f))
        let cases = FILES.map((f) => `ex-${getCasename(`${f}.vue`)}.html`)
        let orphan = docs.filter((f) => !cases.includes(f))
        assert.deepStrictEqual(orphan, [], '無對應 src 之 docs/examples 頁')
    })

    it('AX5 JSDoc 載明: opt.showOverlayWhenFilteredEmpty 之破壞性變更(預設開啟、恢復舊行為設 false); opt.localeText 之新鍵 noRowsToShowFiltered(R24)', function() {
        let vue = fs.readFileSync(path.join(SRC, 'components', 'WAggridVue.vue'), 'utf8')
        let line = (key) => vue.split(/\r?\n/).find((l) => l.includes(`@vue-prop`) && l.includes(`[opt.${key}`))
        let so = line('showOverlayWhenFilteredEmpty')
        assert.ok(so, 'JSDoc 缺 opt.showOverlayWhenFilteredEmpty')
        assert.ok(so.includes('破壞性變更') && so.includes('預設開啟') && so.includes('設為false'), so)
        let lt = line('localeText')
        assert.ok(lt, 'JSDoc 缺 opt.localeText')
        assert.ok(lt.includes('noRowsToShowFiltered') && lt.includes('noRowsToShow'), lt)
    })

    it('AX6 新增之範例 AppState 於四處皆在, 選單名為 state(R18)、JSDoc 載明根節點 state 屬性之值與轉換時點(R26)', function() {
        let { imports, comps, vifs, leaves } = parseApp()
        assert.ok(FILES.includes('AppState'), 'AppState 檔案')
        assert.ok(imports.some((v) => v.file === 'AppState'), 'AppState import')
        assert.ok(comps.includes('AppState'), 'AppState components')
        assert.ok(vifs.some((v) => v.cmp === 'AppState' && v.pick === 'state'), 'AppState v-if')
        assert.ok(leaves.includes('state'), 'AppState 選單')
        assert.strictEqual(getCasename('AppState.vue'), 'state', '產製名稱')
        //JSDoc: 根節點 state 屬性, 值 showing / shown 與轉換時點(淡入結束、淡入期間改寬之補繪)
        let vue = fs.readFileSync(path.join(SRC, 'components', 'WAggridVue.vue'), 'utf8')
        let line = vue.split(/\r?\n/).find((l) => l.includes('@vue-data') && l.includes('[state='))
        assert.ok(line, 'JSDoc 缺 state')
        for (let s of ['CompCssWAggridVue', "'showing'", "'shown'", '單向轉換', 'refreshCells({ force: true })', '淡入期間尺寸未改變者不做補繪']) {
            assert.ok(line.includes(s), `JSDoc state 應含 ${s}`)
        }
    })

    it('BLD1 範例產製器(test/tools/exampleBuild.mjs)與發布時之 gExtractHtml、gDocExams(genDocsExams)同形: 既有 5 個範例自 src 產製之頁與 docs/examples 逐字相同(行尾除外); 自有套件引用為 gh-pages 網址、本套件 dist 為相對路徑', async function() {
        //此等價成立, 以 buildExample 產製之新範例頁才等同發布後之 docs/examples 頁
        let norm = (s) => s.replace(/\r\n/g, '\n')
        for (let f of ['AppFilterAllData', 'AppSetHeadFilter', 'AppKpCellFormat', 'AppShowKeysApplyOrder', 'AppSlotCellRender']) {
            let r = await buildExample(`${f}.vue`, tmp.dir)
            let built = norm(fs.readFileSync(r.fpHtml, 'utf8'))
            let docs = norm(fs.readFileSync(path.join(projRoot, 'docs', 'examples', `${r.fn}.html`), 'utf8'))
            assert.ok(built === docs, `${r.fn} 與 docs/examples 不同`)
            //genDocsExams 之改寫結果(規則: 自有套件之 CDN 網址 → gh-pages 網址, 本套件 dist 保持相對路徑 ../dist/, keepCdn 之 w-demores 與第三方保持 jsDelivr)
            let srcs = [...built.matchAll(/<script\b[^>]*?\bsrc="([^"]+)"/g)].map((m) => m[1])
            assert.ok(srcs.includes('../dist/w-aggrid-vue.umd.js'), `${r.fn}: 本套件 dist 應為相對路徑 ../dist/`)
            assert.ok(srcs.includes('https://yuda-lyu.github.io/w-jsonview-tree/dist/w-jsonview-tree.umd.js'), `${r.fn}: w-jsonview-tree 應為 gh-pages 網址`)
            assert.deepStrictEqual(srcs.filter((s) => /jsdelivr\.net\/npm\/(wsemi|w-(?!demores))/.test(s)), [], `${r.fn}: 不應殘留自有套件(w-demores 除外)之 jsDelivr 網址`)
            //產製器於 outDir 置 docs/dist 之 dist 副本, 使相對路徑指向本地 dist
            assert.ok(fs.readFileSync(path.join(path.dirname(r.fpHtml), '..', 'dist', 'w-aggrid-vue.umd.js')).equals(fs.readFileSync(path.join(projRoot, 'dist', 'w-aggrid-vue.umd.js'))), `${r.fn}: 產製器之 dist 副本應同專案 dist`)
        }
    })

    //pageRefs, docs/examples 內全部頁面(ex-*.html 與 app.html)之 script src 與 link href(含跨行之標籤)
    function pageRefs() {
        let dir = path.join(projRoot, 'docs', 'examples')
        let out = []
        for (let file of fs.readdirSync(dir).filter((f) => /\.html$/.test(f))) {
            let c = fs.readFileSync(path.join(dir, file), 'utf8')
            for (let m of c.matchAll(/<(?:script|link)\b[^>]*?\b(?:src|href)\s*=\s*"([^"]+)"/g)) {
                out.push({ file, ref: m[1] })
            }
        }
        return out
    }

    it('EXT1 docs/examples 全部頁面(ex-*.html 與 app.html)之 http(s) 外部資源皆在 e2e-setup 之 EXTERNAL 對照表內; 對照項皆指向存在之本機檔且皆被使用(無過期項)(R18)', function() {
        //genDocsExams 改寫規則或範例頁引用變動時, 對照表未同步會使 e2e 範例頁以「jv is not a function」等形式整批紅; 此格於 node 直接點名未對照之網址
        let refs = pageRefs()
        let urls = refs.filter((r) => /^https?:\/\//.test(r.ref))
        assert.ok(urls.length > 0, '應有外部資源')
        let unmapped = [...new Set(urls.filter((r) => !findExternal(r.ref)).map((r) => r.ref))]
        assert.deepStrictEqual(unmapped, [], '未對照之外部資源')
        //每個對照項: 有 file 者其檔存在; 且至少被一個頁面引用(對照表不留已不再出現之舊形)
        for (let e of EXTERNAL) {
            if (e.file) {
                assert.ok(fs.existsSync(path.join(projRoot, e.file)), `對照項 ${e.re} 之本機檔不存在: ${e.file}`)
            }
            assert.ok(urls.some((r) => e.re.test(r.ref)), `對照項 ${e.re} 已無頁面使用(過期項, 應移除)`)
        }
    })

    it('EXT2 docs/examples 之每個 ex-*.html 皆恰一次以相對路徑 ../dist/w-aggrid-vue.umd.js 載入本套件 dist(genDocsExams 對自身 dist 引用保持相對路徑), 且該檔(docs/dist)存在; e2e 以 file: 路由改由專案 dist/ 供應(R18)', function() {
        let refs = pageRefs()
        let exFiles = fs.readdirSync(path.join(projRoot, 'docs', 'examples')).filter((f) => /^ex-.*\.html$/.test(f))
        let rels = refs.filter((r) => /^ex-/.test(r.file) && !/^https?:\/\//.test(r.ref))
        assert.deepStrictEqual([...new Set(rels.map((r) => r.ref))], ['../dist/w-aggrid-vue.umd.js'], 'ex 頁之相對路徑資源')
        assert.deepStrictEqual(rels.map((r) => r.file).sort(), exFiles.slice().sort(), '每個 ex 頁恰引用一次')
        //頁內相對路徑所指之檔(發布站台上之 docs/dist)存在; 其內容為 genDocsDist 自 dist 複製之發布副本, 新舊不屬本套件測試之判準(e2e 以路由改由 dist/ 供應)
        assert.ok(fs.existsSync(path.join(projRoot, 'docs', 'dist', 'w-aggrid-vue.umd.js')), 'docs/dist/w-aggrid-vue.umd.js 不存在(範例頁之相對路徑失效)')
    })
})
