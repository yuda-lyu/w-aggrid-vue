<template>
    <div>

        <div class="bkh">
            <div style="font-size:1.5rem;">showKeys (applyOrder: false)</div>
            <a href="//yuda-lyu.github.io/w-aggrid-vue/examples/ex-showKeysApplyOrder.html" target="_blank" class="item-link">example</a>
            <a href="//github.com/yuda-lyu/w-aggrid-vue/blob/master/docs/examples/ex-showKeysApplyOrder.html" target="_blank" class="item-link">code</a>
        </div>

        <div class="bkp">

            <div style="display:flex; padding-bottom:40px; overflow-x:auto;">

                <div style="position:relative;">

                    <WAggridVue
                        style="width:620px;"
                        ref="rftable"
                        :opt="opt"
                    ></WAggridVue>

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
import WAggridVue from './components/WAggridVue.vue'
import jv from 'w-jsonview-tree'

export default {
    components: {
        WAggridVue,
    },
    data: function() {
        return {
            'opt': {
                keys: ['make', 'model', 'price'],
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

        //showMsg
        let showMsg = function(msg) {
            let keys = []
            try {
                keys = vo.$refs.rftable.getApi().getAllDisplayedColumns().map(function(c) {
                    return c.getColId()
                })
            }
            catch (err) {
                console.log(err)
            }
            document.querySelector('#ckmsg').innerHTML = msg + '\n\n' + 'displayed keys: ' + JSON.stringify(keys)
        }

        //hide 'model' key, applyOrder: false keeps current column order
        setTimeout(function() {
            try {
                vo.$refs.rftable.showKeys(['make', 'price'], { applyOrder: false })
                showMsg(`showKeys(['make', 'price'], { applyOrder: false })`)
            }
            catch (err) {
                console.log(err)
            }
        }, 1000)

        //show 'model' key again, it returns to its original position instead of moving to the end
        setTimeout(function() {
            try {
                vo.$refs.rftable.showKeys(['make', 'price', 'model'], { applyOrder: false })
                showMsg(`showKeys(['make', 'price', 'model'], { applyOrder: false })`)
            }
            catch (err) {
                console.log(err)
            }
        }, 2000)

    },
}
</script>

<style>
</style>
