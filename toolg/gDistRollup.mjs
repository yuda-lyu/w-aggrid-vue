import rollupFiles from 'w-package-tools/src/rollupFiles.mjs'
import getFiles from 'w-package-tools/src/getFiles.mjs'


let fdSrc = './src'
let fdTar = './dist'


rollupFiles({
    fns: getFiles(fdSrc),
    fdSrc,
    fdTar,
    //nameDistType: 'kebabCase',
    hookNameDist: () => {
        return 'w-aggrid-vue'
    },
    globals: {
        'ag-grid-vue': 'ag-grid-vue',
    },
    external: [
        'ag-grid-vue',
    ],
})

