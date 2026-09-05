<template>
    <div>

        <div class="bkh">
            <div style="font-size:1.5rem;">kpCellFormat</div>
            <a href="//yuda-lyu.github.io/w-aggrid-vue/examples/ex-kpCellFormat.html" target="_blank" class="item-link">example</a>
            <a href="//github.com/yuda-lyu/w-aggrid-vue/blob/master/docs/examples/ex-kpCellFormat.html" target="_blank" class="item-link">code</a>
        </div>

        <div class="bkp">

            <div style="display:flex; padding-bottom:40px; overflow-x:auto;">

                <div style="position:relative;">

                    <WAggridVue
                        style="width:620px;"
                        ref="rftable"
                        :opt="opt"
                    ></WAggridVue>

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
import WAggridVue from './components/WAggridVue.vue'
import jv from 'w-jsonview-tree'

export default {
    components: {
        WAggridVue,
    },
    data: function() {
        return {
            'opt': {
                keys: ['make', 'model', 'price'],
                kpCellFormat: {
                    'make': function(value, key, row, params) {
                        // console.log(value, key, row, params)
                        //空值(null、undefined、空字串)會原樣傳入, 由呼叫端決定如何處理, 回傳null代表不格式化維持原值
                        if (value === null || value === undefined || value === '') {
                            return null
                        }
                        return String(value).toUpperCase()
                    },
                    'price': function(value, key, row, params) {
                        // console.log(value, key, row, params)
                        //空值不可直接Number(), 否則''與null會變成0.00
                        if (value === null || value === undefined || value === '') {
                            return null
                        }
                        return Number(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                    },
                },
                kpHeadFilterType: { //default: num (num,text,time,set)
                    'make': 'text',
                    'model': 'text',
                    'price': 'num',
                },
                rows: JSON.parse(JSON.stringify(window.dataEasy)),
            },
            'action': [
            ],
        }
    },
    mounted: function() {
        let vo = this
        jv(vo.opt, document.querySelector('#optjson'), { expanded: true })
    },
}
</script>

<style>
</style>
