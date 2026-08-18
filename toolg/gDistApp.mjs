import rollupVueToHtml from 'w-package-tools/src/rollupVueToHtml.mjs'


let opt = {
    title: `w-aggrid-vue`,
    head: `

    <!-- rollupVueToHtml已自動添加@babel/polyfill與vue -->

    <!-- data -->
    <script src="https://cdn.jsdelivr.net/npm/w-demores/res/data/dataEasy.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/w-demores/res/data/dataEduagency.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/w-demores/res/data/dataLikeNumber.js"></script>

    `,
    newVue: ``,
    globals: {
        'vue': 'Vue',
    },
    external: [
        'vue',
    ],
}
rollupVueToHtml('./src/App.vue', './docs/examples/app.html', opt)

