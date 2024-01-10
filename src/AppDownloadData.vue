<template>
    <div>

        <div class="bkh">
            <div style="font-size:1.5rem;">downloadData</div>
            <a href="//yuda-lyu.github.io/w-threejs-vue/examples/ex-downloadData.html" target="_blank" class="item-link">example</a>
            <a href="//github.com/yuda-lyu/w-threejs-vue/blob/master/docs/examples/ex-downloadData.html" target="_blank" class="item-link">code</a>
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
                kpHead: {
                    'make': 'make(製作)',
                    'model': 'model(モデル)',
                    'price': 'price(价钱)',
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

        try {
            let ddata = vo.$refs.rftable.downloadData({
                funGetKeysHook: function(keys) {
                    console.log('funGetKeysHook', keys)
                    //modify keys
                    return keys
                },
                funGetLtdtHook: function(ltdt) {
                    console.log('funGetLtdtHook', ltdt)
                    //modify ltdt
                    return ltdt
                },
                funGetMatHook: function(mat) {
                    console.log('funGetMatHook', mat)
                    //modify mat
                    return mat
                },
                useHead: true, //default: false
                fileName: null, //default: 'data.xlsx'
                sheetName: null, //default: data
                pathItems: null, //default: 'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js'
            })
            document.querySelector('#ckmsg').innerHTML = 'trigger: downloadData\n\n' + 'data: ' + JSON.stringify(ddata, null, 2)
        }
        catch (err) {
            console.log(err)
        }

    },
}
</script>

<style>
</style>
