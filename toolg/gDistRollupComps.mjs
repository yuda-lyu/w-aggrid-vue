import rollupFiles from 'w-package-tools/src/rollupFiles.mjs'


let fdSrc = './src/components/'
let fdTar = './dist'


rollupFiles({
    fns: 'WAgGridVue.vue',
    fdSrc,
    fdTar,
    format: 'umd',
    //nameDistType: 'kebabCase',
    hookNameDist: () => {
        return 'w-aggrid-vue'
    },
    globals: { //用rollup很難編譯ag-grid-community與ag-grid-vue故由外部引入
        'ag-grid-community': 'agGrid',
        'ag-grid-vue': 'ag-grid-vue',
        'crypto': 'crypto', //因crypto-js修改使用內建crypto方式, 會偵測nodejs並使用require內建的crypto, 故需剔除
        'xlsx': 'XLSX', //因getDataFromExcelFileU8ArrDyn會引用getDataFromExcelFileU8Arr並再引用xlsx, 先剔除不打包進來, 於專案使用得安裝xlsx, 使用cdn引用得預先加載xlsx
    },
    external: [
        'ag-grid-community',
        'ag-grid-vue',
        'crypto',
        'xlsx',
    ],
})

