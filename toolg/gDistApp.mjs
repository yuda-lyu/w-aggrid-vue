import rollupVueToHtml from 'w-package-tools/src/rollupVueToHtml.mjs'


let opt = {
    title: `w-aggrid-vue`,
    head: `

    <!-- rollupVueToHtml已自動添加@babel/polyfill與vue -->

    <!-- ag-grid-community, do not include css -->
    <script src="https://cdn.jsdelivr.net/npm/ag-grid-community@27.3.0/dist/ag-grid-community.min.noStyle.js"></script>
    <script _src="https://cdn.jsdelivr.net/npm/ag-grid-enterprise@27.3.0/dist/ag-grid-enterprise.min.noStyle.js"></script>
    <link rel="stylesheet" _href="https://cdn.jsdelivr.net/npm/ag-grid-community@27.3.0/dist/styles/ag-grid.min.css">
    <link rel="stylesheet" _href="https://cdn.jsdelivr.net/npm/ag-grid-community@27.3.0/dist/styles/ag-theme-balham.min.css">

    <!-- ag-grid-vue, 因rollup無法簡單編譯ag-grid-vue故改引用 -->
    <script src="https://cdn.jsdelivr.net/npm/ag-grid-vue@27.3.0/dist/ag-grid-vue.umd.min.js"></script>

    <!-- data -->
    <script src="https://cdn.jsdelivr.net/npm/w-demores@1.0.15/res/data/dataEasy.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/w-demores@1.0.15/res/data/dataEduagency.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/w-demores@1.0.15/res/data/dataLikeNumber.js"></script>
    <script>
        //save in window
        window.dataEasy=dataEasy
        window.dataEduagency=dataEduagency
        window.dataLikeNumber=dataLikeNumber
    </script>

    `,
    newVue: ``,
    globals: {
        'ag-grid-community': 'agGrid', //用rollup很難編譯ag-grid-community與ag-grid-vue, 故皆由外部引入
        'ag-grid-vue': 'ag-grid-vue',
        'crypto': 'crypto', //因crypto-js修改使用內建crypto方式, 會偵測nodejs並使用require內建的crypto, 故需剔除不打包進來
        'xlsx': 'XLSX', //因getDataFromExcelFileU8ArrDyn會引用getDataFromExcelFileU8Arr並再引用xlsx, 先剔除不打包進來, 於專案使用得安裝xlsx, 使用cdn引用得預先加載xlsx
    },
    external: [
        'ag-grid-community',
        'ag-grid-vue',
        'crypto',
        'xlsx',
    ],
}
rollupVueToHtml('./src/App.vue', './docs/examples/app.html', opt)

