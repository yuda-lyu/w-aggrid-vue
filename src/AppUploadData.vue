<template>
    <div>

        <div style="display:flex;">

            <div>

                <div style="margin:20px 0px;">
                    <span style="font-size:1.5rem; margin-right:20px;">uploadData</span>
                    <a href="//yuda-lyu.github.io/w-aggrid-vue/examples/ex-uploadData.html" target="_blank" class="item-link item-shadow">example</a>
                    <a href="//github.com/yuda-lyu/w-aggrid-vue/blob/master/docs/examples/ex-uploadData.html" target="_blank" class="item-link item-shadow">code</a>
                </div>

                <div style="margin-bottom:10px;">
                    <button @click="upload">Upload excel file (with key for head)</button>
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
    },
    methods: {
        upload: function() {
            let vo = this

            function beforeUpload(rows) {
                console.log('beforeUpload', rows)
                return rows
            }

            // async function beforeUploadAsync(rows) {
            //     console.log('beforeUploadAsync', rows)
            //     return rows
            // }

            try {
                vo.$refs.rftable.uploadData({
                    pathItems: null, //default: 'https://cdn.jsdelivr.net/npm/xlsx@0.16.6/dist/xlsx.full.min.js'
                    beforeUpload: beforeUpload,
                    // beforeUploadAsync: beforeUploadAsync,
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
