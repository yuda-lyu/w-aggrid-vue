<template>
    <div>

        <div style="display:flex;">

            <div>

                <div style="margin:20px 0px;">
                    <span style="font-size:1.5rem; margin-right:20px;">pasteText</span>
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
                keys: ['make', 'model', 'price', 'index', 'int', 'tongue'],
                kpHead: {
                    'make': 'make(true)',
                    'model': 'model(false)',
                    'price': 'price(true)',
                    'index': 'index(true)',
                    'int': 'int(true)',
                    'tongue': 'tongue(true)',
                },
                kpCellEditable: { //default: false
                    'make': true,
                    // 'model': false,
                    'price': true,
                    'index': true,
                    'int': true,
                    'tongue': true,
                },
                kpHeadHide: { //default: false
                    // 'make': false,
                    // 'model': false,
                    'price': true,
                    // 'index': false,
                    // 'int': false,
                    // 'tongue': false,
                },
                kpHeadFixLeft: { //default: false
                    // 'make':false,
                    // 'model': false,
                    // 'price': false,
                    'index': true,
                    'int': true,
                    // 'tongue': false,
                },
                rows: [
                    { 'make': 'Toyota', 'model': 'Celica', 'price': 35000, 'index': 0, 'int': 123, 'tongue': 'a' },
                    { 'make': 'Ford', 'model': 'Mondeo', 'price': 32000, 'index': 1, 'int': 234, 'tongue': 'bc' },
                    { 'make': 'Porsche', 'model': 'Boxter', 'price': 72000, 'index': 2, 'int': 345, 'tongue': 'def' },
                    { 'make': 'BMW', 'model': 'Sedan', 'price': 66000, 'index': 3, 'int': 456, 'tongue': 'ghij' },
                    { 'make': 'Nissan', 'model': 'March', 'price': 61000, 'index': 4, 'int': 567, 'tongue': 'klmno' },
                    { 'make': 'Lexus', 'model': 'RX', 'price': 56000, 'index': 5, 'int': 678, 'tongue': 'oprs' },
                    { 'make': 'Audi', 'model': 'A6 Allroad', 'price': 45000, 'index': 6, 'int': 789, 'tongue': 'tuv' },
                    { 'make': 'Mazda', 'model': 'MX-5', 'price': 36000, 'index': 7, 'int': 890, 'tongue': 'wx' },
                ],
            },
            'action': [
            ],
        }
    },
    mounted: function() {
        let vo = this
        jv(vo.opt, document.querySelector('#optjson'), { expanded: true })

        let text1 = 'pt1:col1-row1\tpt1:col2-row1\tpt1:col3-row1\tpt1:col4-row1\tpt1:col5-row1\npt1:col1-row2\tpt1:col2-row2\tpt1:col3-row2\tpt1:col4-row2\tpt1:col5-row2\n'
        let text2 = text1.replace(/pt1/g, 'pt2')

        //pasteText
        setTimeout(function() {
            try {
                vo.$refs.rftable.pasteText(text1, 1, 'make')
            }
            catch (err) {
                console.log(err)
            }
        }, 1000)

        //pasteText
        setTimeout(function() {
            try {
                vo.$refs.rftable.pasteText(text2, 4, 'index')
            }
            catch (err) {
                console.log(err)
            }
        }, 2000)

        //pasteText
        setTimeout(function() {
            try {
                vo.$refs.rftable.pasteText(text2, 7, 'int')
            }
            catch (err) {
                console.log(err)
            }
        }, 3000)

    },
}
</script>

<style>
</style>
