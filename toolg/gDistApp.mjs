import rollupVueToHtml from 'w-package-tools/src/rollupVueToHtml.mjs'


let opt = {
    title: `w-aggrid-vue`,
    head: `

    <!-- @babel/polyfill -->
    <script nomodule src="https://cdn.jsdelivr.net/npm/@babel/polyfill/dist/polyfill.min.js"></script>

    <!-- vue -->
    <script src="https://cdn.jsdelivr.net/npm/vue/dist/vue.min.js"></script>

    <!-- ag-grid-community, do not include css -->
    <script src="https://cdn.jsdelivr.net/npm/ag-grid-community/dist/ag-grid-community.min.noStyle.js"></script>
    <link rel="stylesheet" _href="https://cdn.jsdelivr.net/npm/ag-grid-community/dist/styles/ag-grid.css">
    <link rel="stylesheet" _href="https://cdn.jsdelivr.net/npm/ag-grid-community/dist/styles/ag-theme-balham.css">

    <!-- ag-grid-vue -->
    <script src="https://cdn.jsdelivr.net/npm/ag-grid-vue/dist/ag-grid-vue.umd.min.js"></script>

    <!-- data -->
    <script src="https://cdn.jsdelivr.net/npm/w-demores@1.0.1/res/data/dataEasy.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/w-demores@1.0.1/res/data/dataEduagency.js"></script>
    <script>
        //save in window
        window.dataEasy=dataEasy
        window.dataEduagency=dataEduagency
    </script>

    `,
    newVue: ``,
    globals: {
        'ag-grid-community': 'agGrid', //用rollup很難編譯ag-grid-community與ag-grid-vue, 故皆由外部引入
        'ag-grid-vue': 'ag-grid-vue',
    },
    external: [
        'ag-grid-community',
        'ag-grid-vue',
    ],
}
rollupVueToHtml('./src/App.vue', './docs/examples/app.html', opt)

