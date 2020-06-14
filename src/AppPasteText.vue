<template>
    <div>

        <div style="display:flex;">

            <div>

                <div style="margin:20px 0px;">
                    <span style="font-size:1.5rem; margin-right:20px;" title>pasteText</span>
                    <a href="//yuda-lyu.github.io/w-aggrid-vue/examples/ex-pasteText.html" target="_blank" class="item-link item-shadow">example</a>
                    <a href="//github.com/yuda-lyu/w-aggrid-vue/blob/master/docs/examples/ex-pasteText.html" target="_blank" class="item-link item-shadow">code</a>
                </div>

                <WAgGridVue
                    style="width:620px;"
                    ref="rftable"
                    :opt="opt"
                ></WAgGridVue>

                <pre id="ckmsg"></pre>

            </div>

            <div style="margin-left:20px; width:calc(100% - 20px);">
                <div style="margin:20px 0px; font-size:1.5rem;">Option:</div>
                <div style="border-top:1px solid #ddd; padding:10px; overflow-y:auto; height:calc(100vh - 120px);">
                    <div id="optjson" style="font-size:10pt;"></div>
                </div>
            </div>

        </div>

    </div>
</template>

<script>
import WAgGridVue from './components/WAgGridVue.vue'
import jv from 'w-jsonview-tree'

export default {
    components: {
        WAgGridVue,
    },
    data: function() {
        return {
            'opt': {
                keys: ['make', 'model', 'price', 'index'],
                kpHead: {
                    'make': 'make(true)',
                    'model': 'model(false)',
                    'price': 'price(true)',
                    'index': 'index(true)',
                },
                kpCellEditable: { //default: false
                    'make': true,
                    // 'model': false,
                    'price': true,
                    'index': true,
                },
                kpHeadHide: { //default: false
                    // 'make': false,
                    // 'model': false,
                    'price': true,
                    // 'index': false,
                },
                rows: [
                    { 'make': 'Toyota', 'model': 'Celica', 'price': 35000, 'index': 0 },
                    { 'make': 'Ford', 'model': 'Mondeo', 'price': 32000, 'index': 1 },
                    { 'make': 'Porsche', 'model': 'Boxter', 'price': 72000, 'index': 2 },
                    { 'make': 'BMW', 'model': 'Sedan', 'price': 66000, 'index': 3 },
                    { 'make': 'Nissan', 'model': 'March', 'price': 61000, 'index': 4 }],
            },
            'action': [
            ],
        }
    },
    mounted: function() {
        let vo = this
        jv(vo.opt, document.querySelector('#optjson'), { expanded: true })

        //pasteText
        setTimeout(function() {
            try {
                let text = 'pt-col1-row1\tpt-col2-row1\tpt-col3-row1\npt-col1-row2\tpt-col2-row2\tpt-col3-row2\n'
                vo.$refs.rftable.pasteText(text, 2, 'make')
            }
            catch (err) { }
        }, 1000)

    },
}
</script>

<style>
</style>
