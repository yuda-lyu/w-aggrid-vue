//範例頁產製(專案專屬原語): 依 toolg/gExtractHtml.mjs 與 toolg/gDocExams.mjs 之作法, 自 src/App<名稱>.vue 產製與 docs/examples/ex-<名稱>.html 同形之範例頁
//用途: docs/examples 於發布時才由 script.txt 重產(gDistApp → gExtractHtml → gDocExams), 新增或修改範例後至發布前, docs/examples 尚無該頁或為舊稿;
//測試以本檔自 src 當場產製, 與發布時重產之產物同形, 不依賴發布時機. 同形性由 unit-appExamples 之 BLD1 以既有 5 個範例對照 docs/examples 驗證
//發布流程之兩段: ①gExtractHtml 以 extractHtml 產出 test-html/ex-<名稱>.html(head 含 ../dist/w-aggrid-vue.umd.js 與各 CDN 位址)
//  ②gDocExams 以 w-package-tools 之 genDocsExams 複製到 docs/examples/ 並改寫引用(自有套件之 jsDelivr 網址改為 gh-pages 網址, 本套件 dist 保持相對路徑 ../dist/), docs/dist/ 由 genDocsDist 自 dist 複製
//本檔第②段直接呼叫同一個 genDocsExams(不另寫改寫規則, 其規則變動時產製結果自動跟隨), 目錄配置同發布流程: 於 outDir 下置 test-html/、docs/examples/、docs/dist/, 使頁內相對路徑 ../dist/ 指向其中的 dist 副本(複製自專案 dist/)
//第①段之 head 與選項若與 gExtractHtml 不同, 本檔須同步(BLD1 會失敗而提醒)
import fs from 'fs'
import path from 'path'
import { pathToFileURL } from 'url'
import parseVueCode from 'w-package-tools/src/parseVueCode.mjs'
import extractHtml from 'w-package-tools/src/extractHtml.mjs'
import genDocsExams from 'w-package-tools/src/genDocsExams.mjs'
import { projRoot } from './e2e-setup.mjs'


//HEAD, 同 toolg/gExtractHtml.mjs 之 head
const HEAD = `

        <!-- extractHtml已自動添加@babel/polyfill與vue -->

        <!-- w-aggrid-vue -->
        <script src="../dist/w-aggrid-vue.umd.js"></script>

        <!-- data -->
        <script src="https://cdn.jsdelivr.net/npm/w-demores/res/data/dataEasy.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/w-demores/res/data/dataEduagency.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/w-demores/res/data/dataLikeNumber.js"></script>

        <!-- w-jsonview-tree -->
        <script src="https://yuda-lyu.github.io/w-jsonview-tree/dist/w-jsonview-tree.umd.js"></script>
        <script>
            let jv=window['w-jsonview-tree']
        </script>

        <style>
            .item-link {
                display: inline-block;
                margin: 10px 10px 0px 0px;
                padding: 5px 10px;
                font-size: 0.8rem;
                color: #fff;
                background-color: #443a65;
                cursor: pointer;
                text-decoration: none;
            }
            .bkh { /* 寬 */
                padding:20px;
            }
            @media screen and (max-width:800px){ /* 中 */
                .bkh {
                    padding:10px;
                }
            }
            @media screen and (max-width:400px){ /* 窄 */
                .bkh {
                    padding:5px;
                }
            }
            .bkp { /* 寬 */
                padding:0px 20px;
            }
            @media screen and (max-width:800px){ /* 中 */
                .bkp {
                    padding:0px 10px;
                }
            }
            @media screen and (max-width:400px){ /* 窄 */
                .bkp {
                    padding:0px 5px;
                }
            }
        </style>

        `


//getCasename, App<名稱>.vue → 名稱(首字小寫), 同 gExtractHtml 之 casename
export function getCasename(fnVue) {
    let tfn = fnVue.replace('App', '').replace('.vue', '')
    return tfn[0].toLowerCase() + tfn.slice(1)
}


//buildExample, 產製 outDir/docs/examples/ex-<casename>.html 並回傳其路徑與網址(outDir 下另有 test-html/ 之 gExtractHtml 階段產物與 docs/dist/ 之 dist 副本)
export async function buildExample(fnVue, outDir) {
    let casename = getCasename(fnVue)
    let fn = `ex-${casename}`

    //目錄配置同發布流程(test-html → docs/examples, dist → docs/dist)
    let fdTestHtml = path.join(outDir, 'test-html')
    let fdTar = path.join(outDir, 'docs', 'examples')
    let fdTarDist = path.join(outDir, 'docs', 'dist')
    fs.mkdirSync(fdTestHtml, { recursive: true })
    fs.mkdirSync(fdTarDist, { recursive: true })

    //parseVueCode
    let hh = fs.readFileSync(path.join(projRoot, 'src', fnVue), 'utf8')
    let { tmp, data, mounted, computed, methods } = parseVueCode(hh)

    //①extractHtml(同 gExtractHtml), 寫入 outDir/test-html 而非 ./test-html
    await extractHtml({
        title: `example for ${casename}`,
        head: HEAD,
        appTag: `div`,
        appClass: `bkh`,
        appStyle: ``,
        appTmp: tmp,
        installVue: `Vue.component('w-aggrid-vue', window['w-aggrid-vue'])`,
        newVue: ``,
        data,
        mounted,
        computed,
        methods,
        procHtml: (h) => h.split('WAggridVue').join('w-aggrid-vue'),
        fpHtml: path.join(fdTestHtml, `${fn}.html`),
        fpAction: '',
    })

    //②genDocsExams(同 gDocExams; 只處理本頁, 輸出至 outDir/docs/examples; fdDist 為專案 dist, 以判定頁內相對路徑是否指向本套件 dist)
    genDocsExams({
        fdSrc: fdTestHtml,
        files: [`${fn}.html`],
        fdTar,
        fdDist: path.join(projRoot, 'dist'),
        fdTarDist,
        fnPks: path.join(projRoot, 'package.json'),
        bLog: false,
    })

    //docs/dist(發布流程由 genDocsDist 自 dist 複製): 複製專案 dist 之 umd, 使頁內 ../dist/w-aggrid-vue.umd.js 載入的就是本地 dist
    let fpDist = path.join(fdTarDist, 'w-aggrid-vue.umd.js')
    if (!fs.existsSync(fpDist)) {
        fs.copyFileSync(path.join(projRoot, 'dist', 'w-aggrid-vue.umd.js'), fpDist)
    }

    let fpHtml = path.join(fdTar, `${fn}.html`)
    return { fn, casename, fpHtml, url: pathToFileURL(fpHtml).href }
}
