<template>
    <div class="CompCssWElementUITableVue" v-bind:ch_param="ch_param">

        <el-table
            style="width:100%; margin-top:20px;"
            border
            size="mini"
            empty-text="無數據"
            v-bind:max-height="height"
            v-bind:fit="true"
            v-bind:data="filterRows"
            v-bind:row-style="getRowsStyle"
            v-on:cell-click="eluiCellClick"
            v-on:cell-dblclick="eluiCellDbClick"
        >

            <template v-for="(key,ikey) in getUseKeys">
                <el-table-column
                    sortable
                    resizable
                    v-bind:key="ikey"
                    v-bind:prop="key"
                    v-bind:header-align="kpHeadAlighH[key]"
                    v-bind:fixed="kpHeadFixLeft[key]"
                    v-bind:min-width="defCellMinWidth"
                    v-bind:width="kpCellWidth[key]"
                    v-bind:align="kpCellAlighH[key]"
                >

                    <template slot="header">

                        <el-tooltip
                            effect="dark"
                            placement="bottom"
                            v-if="getHeadTooltip(key)!==''"
                        >
                            <div slot="content" v-html="getHeadTooltip(key)"></div>
                            <span>{{kpHead[key]}}</span>
                        </el-tooltip>

                        <span v-else>
                            {{kpHead[key]}}
                        </span>

                    </template>

                    <template slot-scope="scope">

                        <el-tooltip
                            effect="dark"
                            placement="bottom"
                            v-if="kpCellTooltip[key]"
                        >
                            <div
                                v-bind:style="getCellStyle(key)"
                                v-html="getCellHtml(key,scope.row[key],scope.row)"
                            ></div>
                            <span slot="content" v-html="getCellTooltip(key, scope.row[key])"></span>
                        </el-tooltip>

                        <div
                            v-bind:style="getCellStyle(key)"
                            v-html="getCellHtml(key,scope.row[key],scope.row)"
                            v-else
                        ></div>

                    </template>

                </el-table-column>
            </template>

        </el-table>

    </div>
</template>

<script>
import _ from 'lodash'
import haskey from 'wsemi/src/haskey.mjs'
import isobj from 'wsemi/src/isobj.mjs'
import isnum from 'wsemi/src/isnum.mjs'
import isfun from 'wsemi/src/isfun.mjs'
import binstr from 'wsemi/src/binstr.mjs'
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
        height: {
            type: Number,
            default: 300
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

            tpUseKeys: [],

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

        getUseKeys: function() {
            //console.log('computed getUseKeys')

            let vo = this

            if (_.size(vo.tpUseKeys) > 0) {
                return vo.tpUseKeys
            }
            else {
                return vo.keys
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

        filterRows: function() {
            //console.log('computed filterRows')

            let vo = this

            //rows, search for trigger
            let rows = vo.rows
            let search = vo.search

            //check
            if (search === '') {
                return rows
            }

            //filter
            let frs = _.chain(rows)
                .filter(function(v, k) {
                    let c = _.join(_.values(v), '')
                    return binstr(c, search)
                })
                .value()

            return frs
        },

    },
    methods: {

        eluiCellClick: function(row, column, event) {
            //console.log('methods eluiCellClick', row, column, event)

            let vo = this

            //cellClick
            vo.cellClick(column.property, row)

            //rowClick
            vo.rowClick(column.property, row)

        },

        eluiCellDbClick: function(row, column, event) {
            //console.log('methods eluiCellDbClick', row, column, event)

            let vo = this

            //cellDbClick
            vo.cellDbClick(column.property, row)

            //rowDbClick
            vo.rowDbClick(column.property, row)

        },

        getHeadTooltip: function(key) {
            //console.log('methods getHeadTooltip', key)

            let vo = this

            //tooltip
            let f_tooltip = vo.kpHeadTooltip[key]
            if (isfun(f_tooltip)) {
                return f_tooltip(vo.kpHead[key])
            }
            return ''
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

            //width, 內容物超過width不會自動撐開
            //style['width']

            //min-width, 若element-ui直接於column設定min-width, 會導致超長文字強迫換行
            //若有min-width且大於width會自動轉為width, 使設定min-width時具有width效果而不會自動撐開, 因不合理故不使用
            //style['min-width']

            //nowrap
            //style['white-space'] = 'nowrap' //element-ui已自動算好欄位寬度並使用table-layout=fixed, 開nowrap會導致破版

            //width
            if (isnum(vo.kpCellWidth[key])) {

                //有指定寬度就要設定超長文字處理情形, 寬度由el-table-column設定
                style['white-space'] = 'nowrap' //退而求其次改為設定欄寬才nowrap
                style['overflow'] = 'hidden'
                style['text-overflow'] = 'ellipsis'

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

            //kpHeadFixLeft
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
                console.warn('kpCellEditable: 目前 WElementUITableVue 尚未支援')
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

            // //columns, 需放在給予rows之前, 避免給予rows沒有column設定
            // vo.columns = vo.keys2columns(vo.keys)

            //rows
            vo.rows = vo.opt.rows

        },

        keys2columns: function(keys) {
            //console.log('methods keys2columns')

            // let vo = this

            // let r = _.map(keys, function(key) {
            //     let o = {}
            //     return o
            // })

            // return r
        },

        showKeys: function(keys_new) {
            //console.log('methods showKeys', keys_new)

            let vo = this

            //save
            vo.tpUseKeys = keys_new

        },

    },
}
export default opt
</script>

<style>
.CompCssWElementUITableVue .el-table .cell{
    white-space: inherit;
    text-overflow: inherit;
    overflow: inherit;
}
</style>


