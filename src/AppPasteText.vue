<template>
    <div>

        <div class="bkh">
            <div style="font-size:1.5rem;">pasteText</div>
            <a href="//yuda-lyu.github.io/w-threejs-vue/examples/ex-pasteText.html" target="_blank" class="item-link">example</a>
            <a href="//github.com/yuda-lyu/w-threejs-vue/blob/master/docs/examples/ex-pasteText.html" target="_blank" class="item-link">code</a>
        </div>

        <div class="bkp">

            <div style="display:flex; padding-bottom:40px; overflow-x:auto;">

                <div style="position:relative;">

                    <WAgGridVue
                        style="width:620px;"
                        ref="rftable"
                        :opt="opt"
                    ></WAgGridVue>

                    <pre id="ckmsg"></pre>

                </div>

                <div style="padding:0px 20px;">

                    <div :style="`border:1px solid #ddd; width:600px; min-width:600px; height:300px; overflow-y:auto;`">
                        <div style="padding-left:5px;">
                            <div id="optjson" style="font-size:10pt;"></div>
                        </div>
                    </div>

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
                rowsChange: function(rs) {
                    console.log('rowsChange', rs)
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

        // setInterval(function() {
        //     console.log(JSON.parse(JSON.stringify(vo.opt.rows))) //可檢測數據有被組件更新
        // }, 1000)

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
