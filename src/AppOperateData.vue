<template>
    <div>

        <div class="bkh">
            <div style="font-size:1.5rem;">operateData</div>
            <a href="//yuda-lyu.github.io/w-aggrid-vue/examples/ex-operateData.html" target="_blank" class="item-link">example</a>
            <a href="//github.com/yuda-lyu/w-aggrid-vue/blob/master/docs/examples/ex-operateData.html" target="_blank" class="item-link">code</a>
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

        //slice data
        setTimeout(function() {
            try {

                //cloneDeep
                let rows = JSON.parse(JSON.stringify(window.dataEasy))
                console.log('rows(ori)', rows)

                //slice
                rows = rows.slice(2, 4)

                //set
                vo.opt.rows = rows
                console.log('rows(slice(2, 4))', rows)

            }
            catch (err) {
                console.log(err)
            }
        }, 1000)

        //push data
        setTimeout(function() {
            try {

                //rows
                let rows = vo.opt.rows

                //merge
                rows = [
                    {
                        'make': 'new make1',
                        'model': 'new model1',
                        'price': 'new price1'
                    },
                    {
                        'make': 'new make2',
                        'model': 'new model2',
                        'price': 'new price2'
                    },
                    ...rows,
                ]

                //set
                vo.opt.rows = rows
                console.log('rows(push)', rows)

            }
            catch (err) {
                console.log(err)
            }
        }, 2000)

        //delete all data
        setTimeout(function() {
            try {

                //set
                vo.opt.rows = []
                console.log('rows(clear)', [])

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
