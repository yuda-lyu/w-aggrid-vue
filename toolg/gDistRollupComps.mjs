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
    },
    external: [
        'ag-grid-community',
        'ag-grid-vue',
    ],
})

