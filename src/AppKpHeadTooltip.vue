<template>
    <div>

        <div class="bkh">
            <div style="font-size:1.5rem;">kpHeadTooltip</div>
            <a href="//yuda-lyu.github.io/w-aggrid-vue/examples/ex-kpHeadTooltip.html" target="_blank" class="item-link">example</a>
            <a href="//github.com/yuda-lyu/w-aggrid-vue/blob/master/docs/examples/ex-kpHeadTooltip.html" target="_blank" class="item-link">code</a>
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
                keys: ['make', 'model', 'price'],
                kpHeadTooltip: {
                    'make': function(v) {
                        return '<div style="font-size:8pt; font-weight:bold; color:#6fe;">[' + v + ']</div><div>生產製造商</div>'
                    },
                    'model': function(v) {
                        return '<div style="font-size:8pt; font-weight:bold; color:#6fe;">[' + v + ']</div><div>車款型號</div>'
                    },
                    'price': function(v) {
                        return '<div style="font-size:8pt; font-weight:bold; color:#6fe;">[' + v + ']</div><div>虛擬販售價格</div>'
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
                { 'mode': 'elehover', 'selector': '[col-id="price"]' }
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
