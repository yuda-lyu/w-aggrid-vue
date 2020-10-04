<template>
    <div>

        <div style="display:flex;">

            <div>

                <div style="margin:20px 0px;">
                    <span style="font-size:1.5rem; margin-right:20px;">highlight</span>
                    <a href="//yuda-lyu.github.io/w-aggrid-vue/examples/ex-highlight.html" target="_blank" class="item-link item-shadow">example</a>
                    <a href="//github.com/yuda-lyu/w-aggrid-vue/blob/master/docs/examples/ex-highlight.html" target="_blank" class="item-link item-shadow">code</a>
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
                kpCellEditable: { //default: false
                    'price': true,
                },
                kpRowStyle: {
                    'price': function(v) {
                        if (v >= 70000) {
                            return { 'background': '#fac' }
                        }
                        return {}
                    },
                },
                rows: JSON.parse(JSON.stringify(window.dataEasy)),
            },
            'action': [
                { 'mode': 'wait', 'time': 1500 }, { 'mode': 'click', 'x1': 510, 'y1': 87 }, { 'mode': 'type', 'str': '80000' }
            ],
        }
    },
    mounted: function() {
        let vo = this
        jv(vo.opt, document.querySelector('#optjson'), { expanded: true })

        //push data
        setTimeout(function() {
            try {

                //cloneDeep
                let t = JSON.parse(JSON.stringify(vo.opt.rows))

                //modify
                t[5]['price'] = 75000

                //set for vue detect
                vo.opt.rows = t

            }
            catch (err) {
                console.log(err)
            }
        }, 1000)

    },
}
</script>

<style>
</style>
