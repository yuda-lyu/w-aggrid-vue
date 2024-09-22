<template>
    <div>

        <div class="bkh">
            <div style="font-size:1.5rem;">kpHeadWidth</div>
            <a href="//yuda-lyu.github.io/w-aggrid-vue/examples/ex-kpHeadWidth.html" target="_blank" class="item-link">example</a>
            <a href="//github.com/yuda-lyu/w-aggrid-vue/blob/master/docs/examples/ex-kpHeadWidth.html" target="_blank" class="item-link">code</a>
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
                // kpHeadFixLeft: {
                //     'make': true,
                // },
                // defHeadMinWidth: 150,
                kpHeadWidth: { //default: null
                    //'make':null,
                    'model': 400,
                    //'price':null,
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
