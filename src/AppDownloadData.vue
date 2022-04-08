<template>
    <div>

        <div style="display:flex;">

            <div>

                <div style="margin:20px 0px;">
                    <span style="font-size:1.5rem; margin-right:20px;">downloadData</span>
                    <a href="//yuda-lyu.github.io/w-aggrid-vue/examples/ex-downloadData.html" target="_blank" class="item-link item-shadow">example</a>
                    <a href="//github.com/yuda-lyu/w-aggrid-vue/blob/master/docs/examples/ex-downloadData.html" target="_blank" class="item-link item-shadow">code</a>
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
                keys: ['make', 'model', 'price'],
                kpHead: {
                    'make': 'make(製作)',
                    'model': 'model(モデル)',
                    'price': 'price(价钱)',
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
                    //can modify keys
                    return keys
                },
                //useHead: true, //default: false
                fileName: 'data.xlsx',
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
