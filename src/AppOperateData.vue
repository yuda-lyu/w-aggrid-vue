<template>
    <div>

        <div style="display:flex;">

            <div>

                <div style="margin:20px 0px;">
                    <span style="font-size:1.5rem; margin-right:20px;" title>operateData</span>
                    <a href="//yuda-lyu.github.io/w-aggrid-vue/examples/ex-operateData.html" target="_blank" class="item-link item-shadow">example</a>
                    <a href="//github.com/yuda-lyu/w-aggrid-vue/blob/master/docs/examples/ex-operateData.html" target="_blank" class="item-link item-shadow">code</a>
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
                rows: JSON.parse(JSON.stringify(window.dataEasy)),
            },
            'action': [

            ],
        }
    },
    mounted: function() {
        let vo = this
        jv(vo.opt, document.querySelector('#optjson'), { expanded: true })

        //slice data
        setTimeout(function() {
            try {

                //cloneDeep
                let rows = JSON.parse(JSON.stringify(window.dataEasy))

                //slice
                rows = rows.slice(2, 4)

                //set
                vo.opt.rows = rows

            }
            catch (err) {}
        }, 1000)

        //push data
        setTimeout(function() {
            try {

                //rows
                let rows = vo.opt.rows

                //push
                rows.push({
                    'make': 'new make1',
                    'model': 'new model1',
                    'price': 'new price1'
                })
                rows.push({
                    'make': 'new make2',
                    'model': 'new model2',
                    'price': 'new price2'
                })

                //set
                vo.opt.rows = rows

            }
            catch (err) {}
        }, 2000)

    },
}
</script>

<style>
</style>
