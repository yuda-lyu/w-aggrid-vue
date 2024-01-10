<template>
    <div>

        <div class="bkh">
            <div style="font-size:1.5rem;">getInstance</div>
            <a href="//yuda-lyu.github.io/w-threejs-vue/examples/ex-getInstance.html" target="_blank" class="item-link">example</a>
            <a href="//github.com/yuda-lyu/w-threejs-vue/blob/master/docs/examples/ex-getInstance.html" target="_blank" class="item-link">code</a>
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

        //getInstance
        let o = vo.$refs.rftable.getInstance()

        //use api sort price(asc)
        setTimeout(function() {
            try {
                o.columnApi.applyColumnState({
                    state: [{ colId: 'price', sort: 'asc' }],
                    defaultState: { sort: null },
                })
            }
            catch (err) {
                console.log(err)
            }
        }, 1000)

        //use api sort price(desc)
        setTimeout(function() {
            try {
                o.columnApi.applyColumnState({
                    state: [{ colId: 'price', sort: 'desc' }],
                    defaultState: { sort: null },
                })
            }
            catch (err) {
                console.log(err)
            }
        }, 2000)

        //use api filter model and price
        setTimeout(function() {
            try {
                o.api.setFilterModel({ model: { type: 'contains', filter: 'm' }, price: { type: 'contains', filter: '3' } }) //ag-grid 23版有修改filter判斷式, 其內使用trim故限定value需為字串, 故此處原本為3需改為'3'
            }
            catch (err) {
                console.log(err)
            }
        }, 3000)

    },
}
</script>

<style>
</style>
