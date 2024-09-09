<template>
    <div>

        <div class="bkh">
            <div style="font-size:1.5rem;">largeData</div>
            <a href="//yuda-lyu.github.io/w-aggrid-vue/examples/ex-largeData.html" target="_blank" class="item-link">example</a>
            <a href="//github.com/yuda-lyu/w-aggrid-vue/blob/master/docs/examples/ex-largeData.html" target="_blank" class="item-link">code</a>
        </div>

        <div class="bkp">

            <div style="display:flex; padding-bottom:40px; overflow-x:auto;">

                <div style="width:100%; min-width:620px; position:relative;">

                    <WAgGridVue
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
                keys: [
                    'name',
                    'category',
                    'categorychild',
                    'purpose',
                    'service',
                    'region',
                    'opentime',
                    'address',
                    'phone',
                    'fax',
                    'email',
                    'admincategory',
                    'img_front',
                    'img_inner',
                    'link'
                ],
                defHeadFilterType: 'text',
                rows: JSON.parse(JSON.stringify(window.dataEduagency)),
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
