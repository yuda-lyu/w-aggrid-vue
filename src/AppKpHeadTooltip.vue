<template>
    <div>

        <div style="display:flex;">

            <div>

                <div style="margin:20px 0px;">
                    <span style="font-size:1.5rem; margin-right:20px;" title>kpHeadTooltip</span>
                    <a href="//yuda-lyu.github.io/w-aggrid-vue/examples/ex-kpHeadTooltip.html" target="_blank" class="item-link item-shadow">example</a>
                    <a href="//github.com/yuda-lyu/w-aggrid-vue/blob/master/docs/examples/ex-kpHeadTooltip.html" target="_blank" class="item-link item-shadow">code</a>
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
import jdata1 from './data-easy.mjs'

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
                rows: JSON.parse(JSON.stringify(jdata1)),
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
