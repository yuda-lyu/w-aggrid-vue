import fs from 'fs'
import _ from 'lodash-es'
import w from 'wsemi'
import getFiles from 'w-package-tools/src/getFiles.mjs'
import cleanFolder from 'w-package-tools/src/cleanFolder.mjs'
import parseVueCode from 'w-package-tools/src/parseVueCode.mjs'
import extractHtml from 'w-package-tools/src/extractHtml.mjs'


let fdSrc = './src/'
let fdTestHtml = './test-html/'
let fdTestSrc = './test-action/'


function writeHtml(v) {

    function getAppTmp() {
        return v.tmp
    }

    function procHtml(h) {

        //change cmp name
        h = w.replace(h, 'WAgGridVue', 'w-aggrid-vue')

        return h
    }

    //opt
    let opt = {
        title: `example for ${v.casename}`,
        head: `
    
        <!-- extractHtml已自動添加@babel/polyfill與vue -->
    
        <!-- ag-grid-community, do not include css -->
        <script src="https://cdn.jsdelivr.net/npm/ag-grid-community@31.3.4/dist/ag-grid-community.min.noStyle.js"></script>
        <script _src="https://cdn.jsdelivr.net/npm/ag-grid-enterprise@31.3.4/dist/ag-grid-enterprise.min.noStyle.js"></script>
        <link rel="stylesheet" _href="https://cdn.jsdelivr.net/npm/ag-grid-community@31.3.4/dist/styles/ag-grid.min.css">
        <link rel="stylesheet" _href="https://cdn.jsdelivr.net/npm/ag-grid-community@31.3.4/dist/styles/ag-theme-balham.min.css">
    
        <!-- ag-grid-vue, 因rollup無法簡單編譯ag-grid-vue故改引用 -->
        <script src="https://cdn.jsdelivr.net/npm/ag-grid-vue@31.3.4/dist/ag-grid-vue.umd.min.js"></script>

        <!-- w-aggrid-vue -->
        <script src="../dist/w-aggrid-vue.umd.js"></script>
        
        <!-- data -->
        <script src="https://cdn.jsdelivr.net/npm/w-demores@1.0.23/res/data/dataEasy.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/w-demores@1.0.23/res/data/dataEduagency.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/w-demores@1.0.23/res/data/dataLikeNumber.js"></script>

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
    
        `,
        appTag: `div`,
        appClass: `bkh`,
        appStyle: ``,
        appTmp: getAppTmp(),
        installVue: `Vue.component('w-aggrid-vue', window['w-aggrid-vue'])`,
        newVue: ``,
        data: v.data,
        mounted: v.mounted,
        computed: v.computed,
        methods: v.methods,
        action: v.action,
        procHtml,
        fpHtml: `${fdTestHtml}${v.fn}.html`,
        fpAction: `${fdTestSrc}${v.fn}.action.json`,
    }

    //extractHtml
    extractHtml(opt)

}


function extractApp(fn) {

    //casename
    let tfn = fn.replace('App', '')
    tfn = tfn.replace('.vue', '')
    let casename = _.toLower(tfn[0]) + w.strdelleft(tfn, 1)

    //read
    let hh = fs.readFileSync(fdSrc + fn, 'utf8')

    //parseVueCode
    let { tmp, data, mounted, computed, methods, action } = parseVueCode(hh)

    //writeHtml
    writeHtml({
        fn: `ex-${casename}`,
        casename,
        tmp,
        data,
        mounted,
        computed,
        methods,
        action,
    })

}


function main() {
    //由jsdoc產製之wsemi.html, 自動添加將example轉換成codepen線上編輯功能

    //cleanFolder
    cleanFolder(fdTestHtml)
    //cleanFolder(fdTestSrc)

    //getFiles
    let ltfs = getFiles(fdSrc)

    //filter
    ltfs = _.filter(ltfs, function(v) {
        return v.indexOf('App') >= 0
    })
    _.pull(ltfs, 'App.vue')
    //console.log(ltfs)

    //extractApp
    _.each(ltfs, function(v) {
        console.log('extracting: ' + fdSrc + v)
        extractApp(v)
    })

}
main()
