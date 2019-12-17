<template>
    <div>

        <div>

            <div style="margin:20px 0px;">
                <span style="font-size:1.5rem; margin-right:20px;" title>tableWidthFull</span>
                <a href="//yuda-lyu.github.io/w-aggrid-vue/examples/ex-tableWidthFull.html" target="_blank" class="item-link item-shadow">example</a>
                <a href="//github.com/yuda-lyu/w-aggrid-vue/blob/master/docs/examples/ex-tableWidthFull.html" target="_blank" class="item-link item-shadow">code</a>
            </div>

            <WAgGridVue
                ref="rftable"
                :opt="opt"
            ></WAgGridVue>

            <pre id="ckmsg"></pre>

        </div>

        <div style="margin-top:20px;">
            <div style="margin:20px 0px; font-size:1.5rem;">Option:</div>
            <div id="optjson" style="font-size:10pt; padding:10px 0px 0px 10px; border-top:1px solid #ddd;"></div>
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
