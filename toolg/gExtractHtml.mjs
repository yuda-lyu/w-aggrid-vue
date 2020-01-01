import fs from 'fs'
import prettyhtml from '@starptech/prettyhtml'
import _ from 'lodash'
import w from 'wsemi'
import getFiles from 'w-package-tools/src/getFiles.mjs'
import cleanFolder from 'w-package-tools/src/cleanFolder.mjs'


let fdSrc = './src/'
let fdTestHtml = './test-html/'
//let fdTestSrc = './test-action/'


let h = `
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" lang="zh-tw">
<head>
    <meta http-equiv="content-type" content="text/html; charset=UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, minimal-ui">
    <title>example for {{casename}}</title>

    <!-- vue -->
    <script src="https://cdn.jsdelivr.net/npm/vue/dist/vue.min.js"></script>

    <!-- ag-grid-community, do not include css -->
    <script src="https://cdn.jsdelivr.net/npm/ag-grid-community/dist/ag-grid-community.min.noStyle.js"></script>
    <link rel="stylesheet" _href="https://cdn.jsdelivr.net/npm/ag-grid-community/dist/styles/ag-grid.css">
    <link rel="stylesheet" _href="https://cdn.jsdelivr.net/npm/ag-grid-community/dist/styles/ag-theme-balham.css">

    <!-- ag-grid-vue -->
    <script src="https://cdn.jsdelivr.net/npm/ag-grid-vue/dist/ag-grid-vue.umd.min.js"></script>

    <!-- w-aggrid-vue -->
    <script src="../dist/w-aggrid-vue.umd.js"></script>

    <!-- data -->
    <script src="https://cdn.jsdelivr.net/npm/w-demores@1.0.1/res/data/dataEasy.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/w-demores@1.0.1/res/data/dataEduagency.js"></script>
    <script>
        //save in window
        window.dataEasy=dataEasy
        window.dataEduagency=dataEduagency
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


function getBlock(ss, m1, m2) {
    let rs = []
    for (let i = 0; i < ss.length; i++) {
        let s = ss[i]
        if (s.indexOf(m1) >= 0) { //indexOf for m1
            let t = s.substring(s.indexOf(m1) + m1.length, s.length)
            rs.push(t)
            continue
        }
        if (rs.length > 0) {
            rs.push(s)
            if (s === m2) { //equal for m2
                break
            }
        }
    }
    return rs.join('\n')
}


function writeHtml({ fn, casename, tmp, mounted, data, computed, methods, action }) {

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

    //prettyhtml
    //replace computed
    c = c.replace('{{computed}}', computed)

    //replace methods
    c = c.replace('{{methods}}', methods)

    //prettyhtml
    c = prettyhtml(c, {
        tabWidth: 4,
    })

    //write
    //console.log(c)
    fs.writeFileSync(fn, c, 'utf8')

    // //write action
    // fs.writeFileSync(fdTestSrc + `${v.fn}.action.json`, v.action, 'utf8')

}


function extractApp(fn) {
    let r
    let reg
    let m1
    let m2

    //casename
    let tfn = fn.replace('App', '')
    tfn = tfn.replace('.vue', '')
    let casename = _.toLower(tfn[0]) + w.strdelleft(tfn, 1)

    //read
    let h = fs.readFileSync(fdSrc + fn, 'utf8')

    //ss
    let ss = h.split('\r\n')

    //tmp
    r = `<template>[\\s\\S]+<\/template>`
    reg = new RegExp(r, 'g')
    let tmp = h.match(reg)[0]
    let s = _.split(tmp, '\r\n')
    s = _.drop(s, 2)
    s = _.dropRight(s, 2)
    tmp = _.join(s, '\r\n')
    tmp = w.replace(tmp, 'WAgGridVue', 'w-aggrid-vue')
    //console.log('tmp', tmp)

    //data
    m1 = 'data: function() {'
    m2 = '    },'
    let data = getBlock(ss, m1, m2)
    if (!data) {
        data = 'function() { return {} }'
    }
    else {
        data = 'function() {' + data
        data = w.strdelright(data, 1)
    }
    //console.log('data', data)

    //mounted
    m1 = 'mounted: function() {'
    m2 = '    },'
    let mounted = getBlock(ss, m1, m2)
    if (!mounted) {
        mounted = 'function() { return {} }'
    }
    else {
        mounted = 'function() {' + mounted
        mounted = w.strdelright(mounted, 1)
    }
    //console.log('mounted', mounted)

    //computed
    m1 = 'computed:'
    m2 = '    },'
    let computed = getBlock(ss, m1, m2)
    if (!computed) {
        computed = '{}'
    }
    else {
        computed = w.strdelright(computed, 1)
    }
    //console.log('computed', computed)

    //methods
    m1 = 'methods:'
    m2 = '    },'
    let methods = getBlock(ss, m1, m2)
    if (!methods) {
        methods = '{}'
    }
    else {
        methods = w.strdelright(methods, 1)
    }
    //console.log('methods', methods)

    //action
    m1 = `'actions':`
    m2 = '            ],'
    let action = getBlock(ss, m1, m2)
    if (!action) {
        action = '[]'
    }
    else {
        action = w.strdelright(action, 1)
    }
    //console.log('action', action)

    //writeHtml
    writeHtml({
        fn: fdTestHtml + `ex-${casename}.html`,
        casename,
        tmp,
        mounted,
        data,
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
