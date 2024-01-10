<template>
    <div>

        <div class="bkh">
            <div style="font-size:1.5rem;">autoFitColumns</div>
            <a href="//yuda-lyu.github.io/w-threejs-vue/examples/ex-autoFitColumns.html" target="_blank" class="item-link">example</a>
            <a href="//github.com/yuda-lyu/w-threejs-vue/blob/master/docs/examples/ex-autoFitColumns.html" target="_blank" class="item-link">code</a>
        </div>

        <div class="bkp">

            <div style="display:flex; padding-bottom:40px; overflow-x:auto;">

                <div style="position:relative;">

                    <WAgGridVue
                        ref="rftable"
                        :style="'width:'+opt.width+'px;'"
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
                width: 620,
                keys: ['make', 'model', 'price'],
                kpHeadFilterType: { //default: num (num,text,time,set)
                    'make': 'text',
                    'model': 'text',
                    'price': 'num',
                },
                autoFitColumn: true,
                rows: JSON.parse(JSON.stringify(window.dataEasy)),
            },
            'action': [
            ],
        }
    },
    mounted: function() {
        let vo = this
        jv(vo.opt, document.querySelector('#optjson'), { expanded: true })

        //change width
        setTimeout(function() {
            try {
                vo.opt.width = 400
            }
            catch (err) {
                console.log(err)
            }
        }, 1000)

        //change width
        setTimeout(function() {
            try {
                vo.opt.width = 800
            }
            catch (err) {
                console.log(err)
            }
        }, 2000)

        //change width
        setTimeout(function() {
            try {
                vo.opt.width = 620
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
