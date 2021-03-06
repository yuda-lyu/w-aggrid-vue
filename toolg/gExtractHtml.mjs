import fs from 'fs'
import prettyhtml from '@starptech/prettyhtml'
import _ from 'lodash'
import w from 'wsemi'
import getFiles from 'w-package-tools/src/getFiles.mjs'
import cleanFolder from 'w-package-tools/src/cleanFolder.mjs'
import parseVueCode from 'w-package-tools/src/parseVueCode.mjs'


let fdSrc = './src/'
let fdTestHtml = './test-html/'
//let fdTestSrc = './test-action/'


let h = `
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" lang="zh-tw">
<head>
    <meta http-equiv="content-type" content="text/html; charset=UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, minimal-ui">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>example for {{casename}}</title>

    <!-- vue -->
    <script src="https://cdn.jsdelivr.net/npm/vue/dist/vue.min.js"></script>

    <!-- ag-grid-community, do not include css -->
    <script src="https://cdn.jsdelivr.net/npm/ag-grid-community@23.2.1/dist/ag-grid-community.min.noStyle.js"></script>
    <script _src="https://cdn.jsdelivr.net/npm/ag-grid-enterprise@23.2.1/dist/ag-grid-enterprise.min.noStyle.js"></script>
    <link rel="stylesheet" _href="https://cdn.jsdelivr.net/npm/ag-grid-community@23.2.1/dist/styles/ag-grid.min.css">
    <link rel="stylesheet" _href="https://cdn.jsdelivr.net/npm/ag-grid-community@23.2.1/dist/styles/ag-theme-balham.min.css">

    <!-- ag-grid-vue -->
    <script src="https://cdn.jsdelivr.net/npm/ag-grid-vue/dist/ag-grid-vue.umd.min.js"></script>

    <!-- w-aggrid-vue -->
    <script src="../dist/w-aggrid-vue.umd.js"></script>

    <!-- data -->
    <script src="https://cdn.jsdelivr.net/npm/w-demores@1.0.9/res/data/dataEasy.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/w-demores@1.0.9/res/data/dataEduagency.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/w-demores@1.0.9/res/data/dataLikeNumber.js"></script>
    <script>
        //save in window
        window.dataEasy=dataEasy
        window.dataEduagency=dataEduagency
        window.dataLikeNumber=dataLikeNumber
    </script>

    <!-- w-jsonview-tree -->
    <script src="https://cdn.jsdelivr.net/npm/w-jsonview-tree/dist/w-jsonview-tree.umd.js"></script>
    <script>
        let jv=window['w-jsonview-tree']
    </script>

    <style>
        .item {
            transition: all 0.3s;
            display: inline-block;
            margin: 0px 15px 20px 0px;
            padding: 4px 15px;
            border-radius: 30px;
            cursor: pointer;
            font-size: 0.8rem;
            background-color:#f6f6f6;
        }
        .item-active {
            color: #fff;
            background-color:rgb(141, 32, 145);
        }
        .item-inactive:hover {
            background-color:#eaeaea;
        }
        .item-link {
            margin-right: 10px;
            padding: 2px 10px;
            font-size: 0.8rem;
            color:#f22;
            background-color:#fafafa;
            border-radius:10px;
            cursor:pointer;
            text-decoration:none;
        }
        .item-shadow {
            box-shadow:0 3px 1px -2px rgba(0,0,0,.2),0 2px 2px 0 rgba(0,0,0,.14),0 1px 5px 0 rgba(0,0,0,.12);
        }
    </style>

</head>
<body style="font-family:'Microsoft JhengHei','Avenir','Helvetica'; padding:0px 30px; margin:0px;">

    <div id="app">

        {{tmp}}

    </div>

    <script>

        //install w-aggrid-vue
        Vue.component('w-aggrid-vue', window['w-aggrid-vue'])

        //initialize
        new Vue({
            el: '#app',
            data: {{data}},
            mounted: {{mounted}},
            computed: {{computed}},
            methods: {{methods}},
        })

    </script>

</body>
</html>
`


function writeHtml({ fn, casename, tmp, data, mounted, computed, methods, action }) {

    //c
    let c = h

    //replace casename
    c = c.replace('{{casename}}', casename)

    //replace tmp
    c = c.replace('{{tmp}}', tmp)

    //replace data
    c = c.replace('{{data}}', data)

    //replace mounted
    c = c.replace('{{mounted}}', mounted)

    //replace computed
    c = c.replace('{{computed}}', computed)

    //replace methods
    c = c.replace('{{methods}}', methods)

    //prettyhtml
    c = prettyhtml(c, {
        tabWidth: 4,
    })
    c = c.contents //取contents
    //console.log('prettyhtml', c)

    //write
    // console.log(c)
    fs.writeFileSync(fn, c, 'utf8')

    // //write action
    // fs.writeFileSync(fdTestSrc + `${v.fn}.action.json`, v.action, 'utf8')

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

    //tmp, change cmp name
    tmp = w.replace(tmp, 'WAgGridVue', 'w-aggrid-vue')

    //writeHtml
    writeHtml({
        fn: fdTestHtml + `ex-${casename}.html`,
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
