<template>
    <div>

        <div class="bkh">
            <div style="font-size:1.5rem;">genRowsPinnTop</div>
            <a href="//yuda-lyu.github.io/w-aggrid-vue/examples/ex-genRowsPinnTop.html" target="_blank" class="item-link">example</a>
            <a href="//github.com/yuda-lyu/w-aggrid-vue/blob/master/docs/examples/ex-genRowsPinnTop.html" target="_blank" class="item-link">code</a>
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
                keys: ['type', 'group-A-1', 'group-A-2', 'group-B-1'],
                // defCellEditable: true,
                kpCellAlignH: {
                    'group-A-1': 'right',
                    'group-A-2': 'right',
                    'group-B-1': 'right',
                },
                kpRowStyle: {
                    'type': function(v) {
                        if (v === 'sum') {
                            return { 'color': '#f26', 'background': 'rgba(255, 246, 246, 0.5)' }
                        }
                        else if (v === 'sum(all)') {
                            return { 'color': '#f26', 'background': 'rgba(255, 235, 238, 0.5)' }
                        }
                        return {}
                    },
                },
                kpColSpan: {
                    'group-A-1': function(value, key, row, parmas) {
                        // console.log(value, key, row, parmas)
                        if (row.type === 'sum(all)') {
                            return 3
                        }
                        return 1
                    },
                },
                genRowsPinnTop: function(rows) {
                    // console.log('genRowsPinnTop', rows)
                    let a1 = 0
                    let a2 = 0
                    let b1 = 0
                    for (let i = 0; i < rows.length; i++) {
                        let r = rows[i]
                        a1 += parseFloat(r['group-A-1'])
                        a2 += parseFloat(r['group-A-2'])
                        b1 += parseFloat(r['group-B-1'])
                    }
                    let all = a1 + a2 + b1
                    let r = {
                        'type': 'sum',
                        'group-A-1': a1,
                        'group-A-2': a2,
                        'group-B-1': b1,
                    }
                    let ra = {
                        'type': 'sum(all)',
                        'group-A-1': all,
                    }
                    return [ra, r]
                },
                rows: [
                    {
                        'type': 'T1',
                        'group-A-1': 14,
                        'group-A-2': 20,
                        'group-B-1': 49,
                    },
                    {
                        'type': 'T2',
                        'group-A-1': 9,
                        'group-A-2': 22,
                        'group-B-1': 25,
                    },
                    {
                        'type': 'T3',
                        'group-A-1': 83,
                        'group-A-2': 97,
                        'group-B-1': 96,
                    },
                    {
                        'type': 'T4',
                        'group-A-1': 6,
                        'group-A-2': 56,
                        'group-B-1': 43,
                    },
                    {
                        'type': 'T5',
                        'group-A-1': 32,
                        'group-A-2': 8,
                        'group-B-1': 24,
                    },
                    {
                        'type': 'T6',
                        'group-A-1': 27,
                        'group-A-2': 49,
                        'group-B-1': 9,
                    },
                    {
                        'type': 'T7',
                        'group-A-1': 46,
                        'group-A-2': 37,
                        'group-B-1': 33,
                    },
                    {
                        'type': 'T8',
                        'group-A-1': 9,
                        'group-A-2': 39,
                        'group-B-1': 29,
                    },
                ],
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
