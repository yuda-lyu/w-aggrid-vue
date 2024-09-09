<template>
    <div>

        <div class="bkh">
            <div style="font-size:1.5rem;">rowDragLeave</div>
            <a href="//yuda-lyu.github.io/w-aggrid-vue/examples/ex-rowDragLeave.html" target="_blank" class="item-link">example</a>
            <a href="//github.com/yuda-lyu/w-aggrid-vue/blob/master/docs/examples/ex-rowDragLeave.html" target="_blank" class="item-link">code</a>
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
                kpRowDrag: {
                    'make': true,
                },
                rowDragLeave: function(indFrom, indTo, r, rs) {
                    document.querySelector('#ckmsg').innerHTML = 'trigger: rowDragLeave\n\n' + 'indFrom: ' + indFrom + '\n\n' + 'indTo: ' + indTo + '\n\n' + 'row: ' + JSON.stringify(r, null, 2) + '\n\n' + 'rows: ' + JSON.stringify(rs, null, 2)
                },
                rows: JSON.parse(JSON.stringify(window.dataEasy)),
            },
            'action': [],
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
