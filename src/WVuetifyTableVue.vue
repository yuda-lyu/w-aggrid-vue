<template>
    <div v-bind:ch_param="ch_param">

        <v-data-table
            no-data-text="無數據"
            no-results-text="找不到符合數據"
            light
            v-bind:hide-actions="hideActions"
            v-bind:rows-per-page-items="pagerows"
            v-bind:headers="columns"
            v-bind:items="rows"
            v-bind:search="search"
            v-bind:loading="loading"
        >

            <template slot="headerCell" slot-scope="props">

                <v-tooltip bottom v-if="props.header.tooltip">
                    <template v-slot:activator="{ on }">
                        <span v-on="on">
                            {{ props.header.text }}
                        </span>
                    </template>
                    <span v-html="props.header.tooltip"></span>
                </v-tooltip>

                <span style="text-align:left;" v-else>
                    {{ props.header.text }}
                </span>

            </template>

            <template v-slot:items="props">
                <td
                    v-bind:class="'text-xs-'+kpCellAlighH[col.value]"
                    v-bind:style="getRowsStyle"
                    v-bind:key="icol"
                    v-on:click="vtyCellClick(col,props)"
                    v-on:dblclick="vtyCellDbClick(col,props)"
                    v-for="(col,icol) in columns"
                >

                    <v-tooltip
                        bottom
                        v-if="kpCellTooltip[col.value]"
                    >
                        <template v-slot:activator="{ on }">
                            <div
                                v-on="on"
                                v-bind:style="getCellStyle(col.value)"
                                v-html="getCellHtml(col.value,props.item[col.value],props.item)"
                            ></div>
                        </template>
                        <span v-html="getCellTooltip(col.value,props.item[col.value])"></span>
                    </v-tooltip>

                    <div
                        v-bind:style="getCellStyle(col.value)"
                        v-html="getCellHtml(col.value,props.item[col.value],props.item)"
                        v-else
                    ></div>

                </td>
            </template>

        </v-data-table>

    </div>
</template>

<script>
import _ from 'lodash'
import haskey from 'wsemi/src/haskey.mjs'
import isobj from 'wsemi/src/isobj.mjs'
import isnum from 'wsemi/src/isnum.mjs'
import isfun from 'wsemi/src/isfun.mjs'
import oo from 'wsemi/src/oo.mjs'

let opt = {
    props: {
        opt: {
            type: Object,
        },
        loading: {
            type: Boolean,
            default: false
        },
        height: { //vuetify不使用
            type: Number,
            default: 300
        },
        hideActions: {
            type: Boolean,
            default: false
        },
        pagerows: {
            type: Array,
            default: function() {
                return [10, 25, 50, 100, { text: '全部', value: -1 }]
            }
        },
        search: {
            type: String,
            default: ''
        },
    },
    data: function() {
        return {

            rows: [],
            keys: [],
            columns: [],

            kpHead: {},
            kpHeadTooltip: {},
            kpHeadAlighH: {},
            kpHeadSort: {},
            kpHeadFixLeft: {},
            kpHeadFilter: {},
            kpRowStyle: {},
            defCellMinWidth: null,
            kpCellWidth: {},
            kpCellRender: {},
            kpCellTooltip: {},
            kpCellAlighH: {},
            kpCellEditable: {},

            tableClickEnable: false,
            rowChange: function() {},
            rowClick: function() {},
            rowDbClick: function() {},
            cellClick: function() {},
            cellDbClick: function() {},
            cellChange: function() {},

        }
    },
    mounted: function() {
    },
    computed: {

        ch_param: function() {
            //console.log('computed ch_param')

            let vo = this

            //opt for trigger
            let opt = vo.opt

            //ch_opt
            vo.ch_opt()

            return {
                opt: opt
            }
        },

        getRowsStyle: function() {
            //console.log('computed getRowsStyle')

            let vo = this

            if (vo.tableClickEnable) {
                return {
                    cursor: 'pointer'
                }
            }
            return {}
        },

    },
    methods: {

        vtyCellClick: function(col, props) {
            //console.log('methods vtyCellClick', col, props)

            let vo = this

            //cellClick
            vo.cellClick(col.value, props.item)

            //rowClick
            vo.rowClick(col.value, props.item)

        },

        vtyCellDbClick: function(col, props) {
            //console.log('methods vtyCellDbClick', col, props)

            let vo = this

            //cellDbClick
            vo.cellDbClick(col.value, props.item)

            //rowDbClick
            vo.rowDbClick(col.value, props.item)

        },

        getCellTooltip: function(key, value) {
            //console.log('methods getCellTooltip', key, value)

            let vo = this

            //f
            let f = vo.kpCellTooltip[key]
            if (isfun(f)) {
                return f(value)
            }
            return ''
        },

        getCellStyle: function(key) {
            //console.log('methods getCellStyle', key)

            let vo = this

            //style
            let style = {}

            //nowrap
            style['white-space'] = 'nowrap'

            //width, 內容物超過width不會自動撐開
            if (isnum(vo.kpCellWidth[key])) {

                //display
                style['display'] = 'inline-block'

                //width
                style['width'] = vo.kpCellWidth[key] + 'px'

                //有指定寬度就要設定超長文字處理情形
                style['overflow'] = 'hidden'
                style['text-overflow'] = 'ellipsis'

            }

            //min-width, 內容物超過min-width會自動撐開
            if (isnum(vo.defCellMinWidth)) {

                //min-width
                style['min-width'] = vo.defCellMinWidth + 'px'

            }


            return style
        },

        getCellHtml: function(key, value, row) {
            //console.log('methods getCellHtml', key, value, row)

            let vo = this

            //f
            let f = vo.kpCellRender[key]

            //h
            let h = value
            if (isfun(f)) {
                h = f(value, oo(row))
            }

            return h
        },

        ch_opt: function() {
            //console.log('methods ch_opt')

            let vo = this

            //setobj
            function setobj(keys, defEvalKey = true, def, kpobj) {
                let o = {}
                _.each(keys, function(key) {
                    let h
                    if (defEvalKey) {
                        h = def(key)
                    }
                    else {
                        h = def
                    }
                    if (isobj(kpobj)) {
                        if (haskey(kpobj, key)) {
                            h = kpobj[key]
                        }
                    }
                    o[key] = h
                })
                return o
            }

            //keys
            vo.keys = vo.opt.keys

            //kpHead
            vo.kpHead = setobj(vo.keys,
                true,
                function(key) {
                    return key //預設使用key做head
                },
                vo.opt.kpHead
            )

            //kpHeadTooltip
            vo.kpHeadTooltip = {}
            if (isobj(vo.opt.kpHeadTooltip)) {
                vo.kpHeadTooltip = vo.opt.kpHeadTooltip
            }

            //kpHeadAlighH
            vo.kpHeadAlighH = setobj(vo.keys,
                true,
                function(key) {
                    return 'center' //預設center
                },
                vo.opt.kpHeadAlighH
            )

            //kpHeadSort
            vo.kpHeadSort = setobj(vo.keys,
                true,
                function(key) {
                    return true //預設true
                },
                vo.opt.kpHeadSort
            )

            //kpHeadFixLeft, vuetify無效
            vo.kpHeadFixLeft = setobj(vo.keys,
                true,
                function(key) {
                    return false //預設false
                },
                vo.opt.kpHeadFixLeft
            )

            //kpHeadFilter
            vo.kpHeadFilter = setobj(vo.keys,
                true,
                function(key) {
                    return true //預設true
                },
                vo.opt.kpHeadFilter
            )

            //kpRowStyle
            vo.kpRowStyle = {}
            if (isobj(vo.opt.kpRowStyle)) {
                vo.kpRowStyle = vo.opt.kpRowStyle
            }

            //defCellMinWidth
            vo.defCellMinWidth = null
            if (isnum(vo.opt.defCellMinWidth)) {
                vo.defCellMinWidth = vo.opt.defCellMinWidth
            }

            //kpCellWidth
            vo.kpCellWidth = setobj(vo.keys,
                true,
                function(key) {
                    return '' //預設空字串
                },
                vo.opt.kpCellWidth
            )

            //kpCellRender
            vo.kpCellRender = {}
            if (isobj(vo.opt.kpCellRender)) {
                vo.kpCellRender = vo.opt.kpCellRender
            }

            //kpCellTooltip
            vo.kpCellTooltip = {}
            if (isobj(vo.opt.kpCellTooltip)) {
                vo.kpCellTooltip = vo.opt.kpCellTooltip
            }

            //kpCellAlighH
            vo.kpCellAlighH = setobj(vo.keys,
                true,
                function(key) {
                    return 'center' //預設center
                },
                vo.opt.kpCellAlighH
            )

            //kpCellEditable
            // vo.kpCellEditable = setobj(vo.keys,
            //     true,
            //     function(key) {
            //         return false //預設false
            //     },
            //     vo.opt.kpCellEditable
            // )
            if (isobj(vo.opt.kpCellEditable)) {
                console.warn('kpCellEditable: 目前 DTableVuetify 尚未支援')
            }

            //tableClickEnable
            vo.tableClickEnable = false

            //rowClick
            vo.rowClick = function() {}
            if (isfun(vo.opt.rowClick)) {
                vo.rowClick = vo.opt.rowClick
                vo.tableClickEnable = true
            }

            //rowDbClick
            vo.rowDbClick = function() {}
            if (isfun(vo.opt.rowDbClick)) {
                vo.rowDbClick = vo.opt.rowDbClick
                vo.tableClickEnable = true
            }

            //rowChange
            vo.rowChange = function() {}
            if (isfun(vo.opt.rowChange)) {
                vo.rowChange = vo.opt.rowChange
            }

            //cellClick
            vo.cellClick = function() {}
            if (isfun(vo.opt.cellClick)) {
                vo.cellClick = vo.opt.cellClick
                vo.tableClickEnable = true
            }

            //cellDbClick
            vo.cellDbClick = function() {}
            if (isfun(vo.opt.cellDbClick)) {
                vo.cellDbClick = vo.opt.cellDbClick
                vo.tableClickEnable = true
            }

            //cellChange
            vo.cellChange = function() {}
            if (isfun(vo.opt.cellChange)) {
                vo.cellChange = vo.opt.cellChange
            }

            //columns, 需放在給予rows之前, 避免給予rows沒有column設定
            vo.columns = vo.keys2columns(vo.keys)

            //rows
            vo.rows = vo.opt.rows

        },

        keys2columns: function(keys) {
            //console.log('methods keys2columns')

            let vo = this

            let r = _.map(keys, function(key) {
                let o = {}

                //key
                o.value = key

                //text
                o.text = vo.kpHead[key]

                //tooltip
                let f_tooltip = vo.kpHeadTooltip[key]
                if (isfun(f_tooltip)) {

                    //tooltip
                    o.tooltip = f_tooltip(vo.kpHead[key])

                }

                //sort
                o.sortable = true

                //align
                o.align = vo.kpHeadAlighH[key]

                //width
                if (isnum(vo.kpCellWidth[key])) {
                    o.width = vo.kpCellWidth[key]
                }

                return o
            })

            return r
        },

        showKeys: function(keys_new) {
            //console.log('methods showKeys', keys_new)

            let vo = this

            // //keys_old
            // let keys_old = _.cloneDeep(vo.keys)

            // //keys_nouse
            // let keys_nouse = _.difference(keys_old, keys_new)

            //cls_new
            let cls_new = vo.keys2columns(keys_new)
            // let cls_nouse = vo.keys2columns(keys_nouse)
            // cls_nouse = _.map(cls_nouse, function(cl) {
            //     cl.hide = true //未顯示column改為隱藏
            //     return cl
            // })

            // //cls
            // let cls = _.concat(cls_new, cls_nouse)
            let cls = cls_new

            //update
            vo.columns = cls

        },

    },
}
export default opt
</script>

<style scoped>
</style>


