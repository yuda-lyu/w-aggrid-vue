//範例頁產製(專案專屬原語): 依 toolg/gExtractHtml.mjs 與 toolg/gDocExams.mjs 之作法, 自 src/App<名稱>.vue 產製與 docs/examples/ex-<名稱>.html 同形之範例頁
//用途: docs/examples 於發布時才由 script.txt 重產(gDistApp → gExtractHtml → gDocExams), 新增或修改範例後至發布前, docs/examples 尚無該頁或為舊稿;
//測試以本檔自 src 當場產製, 與發布時重產之產物同形, 不依賴發布時機. 同形性由 e2e-examples-overlay 之 BLD1 以既有範例 filterAllData 對照 docs/examples 驗證
//gExtractHtml 之 head 與選項若變動, 本檔須同步(BLD1 會失敗而提醒)
import fs from 'fs'
import path from 'path'
import { pathToFileURL } from 'url'
import parseVueCode from 'w-package-tools/src/parseVueCode.mjs'
import extractHtml from 'w-package-tools/src/extractHtml.mjs'
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
        <script src="https://cdn.jsdelivr.net/npm/w-jsonview-tree@latest/dist/w-jsonview-tree.umd.js"></script>
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


//buildExample, 產製 outDir/ex-<casename>.html 並回傳其路徑與網址; version 為 package.json 之 version(同 gDocExams 之 CDN 位址)
export async function buildExample(fnVue, outDir) {
    let casename = getCasename(fnVue)
    let fn = `ex-${casename}`
    let fpHtml = path.join(outDir, `${fn}.html`)
    fs.mkdirSync(outDir, { recursive: true })

    //parseVueCode
    let hh = fs.readFileSync(path.join(projRoot, 'src', fnVue), 'utf8')
    let { tmp, data, mounted, computed, methods } = parseVueCode(hh)

    //extractHtml(同 gExtractHtml), 寫入 outDir 而非 test-html
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
        fpHtml,
        fpAction: '',
    })

    //換 CDN(同 gDocExams)
    let version = JSON.parse(fs.readFileSync(path.join(projRoot, 'package.json'), 'utf8')).version
    let cdn = `<script src="https://cdn.jsdelivr.net/npm/w-aggrid-vue@${version}/dist/w-aggrid-vue.umd.js"></script>`
    let c = fs.readFileSync(fpHtml, 'utf8')
    c = c.replace(`<script src="../dist/w-aggrid-vue.umd.js"></script>`, cdn)
    fs.writeFileSync(fpHtml, c, 'utf8')

    return { fn, casename, fpHtml, url: pathToFileURL(fpHtml).href }
}
