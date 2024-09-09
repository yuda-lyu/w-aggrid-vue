<template>
    <div>

        <div class="bkh">
            <div style="font-size:1.5rem;">uploadDataWithConvertKeys</div>
            <a href="//yuda-lyu.github.io/w-aggrid-vue/examples/ex-uploadDataWithConvertKeys.html" target="_blank" class="item-link">example</a>
            <a href="//github.com/yuda-lyu/w-aggrid-vue/blob/master/docs/examples/ex-uploadDataWithConvertKeys.html" target="_blank" class="item-link">code</a>
        </div>

        <div class="bkp">

            <div style="padding-bottom:10px;">
                <button @click="upload">Upload excel file with kpConvertKeysWhenUploadData</button>
                <span style="font-size:0.8rem; color:#f26;"> :: The first row of the file needs keys</span>
            </div>

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
                kpConvertKeysWhenUploadData: {
                    id: 'make',
                    mappingId: 'model',
                    order: 'price',
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
    methods: {
        upload: function() {
            let vo = this

            try {
                vo.$refs.rftable.uploadData({
                    pathItems: null, //default: 'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js'
                })
                    .then(function(ddata) {
                        document.querySelector('#ckmsg').innerHTML = 'trigger: uploadData\n\n' + 'data: ' + JSON.stringify(ddata, null, 2)
                    })
                    .catch(function (err) {
                        console.log(err)
                    })
            }
            catch (err) {
                console.log(err)
            }
        },
    },
}
</script>

<style>
</style>
