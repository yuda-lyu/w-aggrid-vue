<template>
    <div class="CompCssWAgGridVue" v-bind:ch_param="ch_param">

        <div v-bind:style="{height:tbheight+'px'}">

            <ag-grid-vue
                style="width:100%; height:100%; margin-top:20px;"
                class="ag-theme-balham"
                v-bind:columnDefs="columns"
                v-bind:rowData="filterRows"
                v-bind:rowStyle="getRowsStyle"
                v-bind:gridOptions="gridOptions"
                v-on:cellClicked="agCellClick"
                v-on:cellDoubleClicked="agCellDbClick"
                v-on:cellValueChanged="agCellChange"
                v-on:grid-ready="onGridReady"
            ></ag-grid-vue>

        </div>

    </div>
</template>

<script>
import map from 'lodash/map'
import each from 'lodash/each'
import filter from 'lodash/filter'
import merge from 'lodash/merge'
import delay from 'lodash/delay'
import join from 'lodash/join'
import values from 'lodash/values'
import cloneDeep from 'lodash/cloneDeep'
import difference from 'lodash/difference'
import concat from 'lodash/concat'

import haskey from 'wsemi/src/haskey.mjs'
import isobj from 'wsemi/src/isobj.mjs'
import isnum from 'wsemi/src/isnum.mjs'
import isfun from 'wsemi/src/isfun.mjs'
import isbol from 'wsemi/src/isbol.mjs'
import binstr from 'wsemi/src/binstr.mjs'
import oo from 'wsemi/src/oo.mjs'
import onTooltip from 'wsemi/src/onTooltip.mjs'

//add
window.ttWAgGridVue = onTooltip

/**
 * @vue-prop {Object} opt 輸入資料設定物件
 * @vue-prop {Array} opt.keys 輸入資料各欄位keys
 * @vue-prop {Array} opt.rows 輸入資料列，各列為物件，內含各欄位keys之值，例[{},{},...,{}]
 * @vue-prop {Object} [opt.kpHead={}] 輸入key對應head物件，預設為keys
 * @vue-prop {Object} [opt.kpHeadTooltip={}] 輸入key對應需tooltip的html字串物件，於各head處滑鼠移入時觸發，預設為{}
 * @vue-prop {Object} [opt.kpHeadAlighH={}] 輸入key對應head之左右對齊字串物件，預設為各key值為center
 * @vue-prop {Object} [opt.kpHeadSort={}] 輸入key對應head之是否允許排序物件，預設為各key值為true
 * @vue-prop {Object} [opt.kpHeadFix={}] 輸入key對應head之是否固定於左側物件，預設為各key值為false
 * @vue-prop {Object} [opt.kpHeadFilter={}] 輸入key對應head之是否允許過濾物件，預設為各key值為true
 * @vue-prop {Object} [opt.kpRowStyle={}] 輸入key對應row style之物件，可設定key欄之cell值所需對應之row style，預設為{}
 * @vue-prop {Object} [opt.defCellMinWidth={}] 輸入cell預設最小寬度數字，預設為null
 * @vue-prop {Object} [opt.kpRowDrag={}] [專有:ag-grid] 輸入key對應row之是否能拖曳排序物件，預設為各key值為false
 * @vue-prop {Object} [opt.kpCellWidth={}] 輸入key對應cell之寬度物件，預設為各key值為''
 * @vue-prop {Object} [opt.kpCellRender={}] 輸入key對應cell之渲染函數物件，預設為{}
 * @vue-prop {Object} [opt.kpCellTooltip={}] 輸入key對應cell之tooltip的html字串物件，於各cell處滑鼠移入時觸發，預設為{}
 * @vue-prop {Object} [opt.kpCellAlighH={}] 輸入key對應cell之左右對齊字串物件，預設為各key值為center
 * @vue-prop {Object} [opt.kpCellEditable={}] 輸入key對應cell之是否可編輯物件，預設為各key值為false
 * @vue-prop {Function} [opt.rowClick={}] 輸入row click之觸發事件，預設為function(){}
 * @vue-prop {Function} [opt.rowDbClick={}] 輸入row double click之觸發事件，預設為function(){}
 * @vue-prop {Function} [opt.rowChange={}] 輸入row change之觸發事件，預設為function(){}
 * @vue-prop {Function} [opt.cellClick={}] 輸入cell click之觸發事件，預設為function(){}
 * @vue-prop {Function} [opt.cellDbClick={}] 輸入cell double click之觸發事件，預設為function(){}
 * @vue-prop {Function} [opt.cellChange={}] 輸入cell change之觸發事件，預設為function(){}
 * @vue-prop {Number} [tbheight=300] 表格高度，預設300px
 * @vue-prop {String} [search=''] 輸入過濾字串，預設為''
 * @vue-event {Null} refresh 刷新表格，無輸入與回傳
 * @vue-event {Array} showKeys 輸入要顯示欄位的keys，數量最多為原本初始化的keys，可更改順序，無回傳
 * @vue-event {Null} getDisplayData 無輸入，會回傳目前表格所顯示之數據
 */
export default {
    props: {
        opt: {
            type: Object,
        },
        tbheight: {
            type: Number,
            default: 300
        },
        search: {
            type: String,
            default: ''
        },
    },
    data: function() {
        let vo = this
        return {

            canFitColumn: true,

            rows: [],
            keys: [],
            columns: [],

            kpHead: {},
            kpHeadTooltip: {},
            kpHeadAlighH: {},
            kpHeadSort: {},
            kpHeadFix: {},
            kpHeadFilter: {},
            kpRowStyle: {},
            defCellMinWidth: null,
            kpRowDrag: {}, //ag-grid才有
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

            gridOptions: {
                animateRows: true,
                floatingFilter: true,
                rowDragManaged: true,
                singleClickEdit: true, //單點即可變更
                localeText: { noRowsToShow: '無數據' },
                getRowStyle: vo.agGetRowStyle,
            },

            ag: null,

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

        getRowsStyle: function(params) {
            //console.log('computed getRowsStyle', params)

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
            // let frs = _.chain(rows)
            //     .filter(function(v, k) {
            //         let c = _.join(_.values(v), '')
            //         return binstr(c, search)
            //     })
            //     .value()
            let frs = filter(rows, function(v, k) {
                let c = join(values(v), '')
                return binstr(c, search)
            })

            return frs
        },

    },
    methods: {

        agGetRowStyle: function(params) {
            //console.log('agGetRowStyle', params) //由各row呼叫

            let vo = this

            //style
            let style = {}
            each(vo.kpRowStyle, function(v, k) {
                let f = v
                let d = params.data[k]
                if (isfun(f)) {
                    style = merge(style, f(d))
                }
            })

            return style
        },

        agCellClick: function(param) {
            //console.log('methods agCellClick', param)

            let vo = this

            //cellClick
            vo.cellClick(param.colDef.field, param.data)

            //rowClick
            vo.rowClick(param.colDef.field, param.data)

        },

        agCellDbClick: function(param) {
            //console.log('methods agCellDbClick', param)

            let vo = this

            //cellDbClick
            vo.cellDbClick(param.colDef.field, param.data)

            //rowDbClick
            vo.rowDbClick(param.colDef.field, param.data)

        },

        agCellChange: function(param) {
            //console.log('methods agCellChange', param)

            let vo = this

            //check值變化
            if (param.oldValue !== param.newValue) {

                //refresh
                vo.refresh()

                //cellChange
                vo.cellChange(param.colDef.field, param.data)

                //rowChange
                vo.rowChange(param.colDef.field, param.data)

            }

        },

        refresh: function() {
            //console.log('methods refresh')

            let vo = this

            //delay, 執行緒脫勾
            delay(function() {

                //redrawRows, 因資料變更不會觸發getRowStyle, 給自行redrawRows
                vo.gridOptions.api.redrawRows()

            }, 1)

        },

        ch_opt: function() {
            //console.log('methods ch_opt')

            let vo = this

            //setobj
            function setobj(keys, defEvalKey = true, def, kpobj) {
                let o = {}
                each(keys, function(key) {
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

            //canFitColumn, ag-grid僅有
            let canFitColumn = false
            if (isbol(vo.opt.canFitColumn)) {
                canFitColumn = vo.opt.canFitColumn
            }
            vo.canFitColumn = canFitColumn

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

            //kpHeadFix
            vo.kpHeadFix = setobj(vo.keys,
                true,
                function(key) {
                    return false //預設false
                },
                vo.opt.kpHeadFix
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

            //kpRowDrag, ag-grid才有
            vo.kpRowDrag = setobj(vo.keys,
                true,
                function(key) {
                    return false //預設false
                },
                vo.opt.kpRowDrag
            )

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
            vo.kpCellEditable = setobj(vo.keys,
                true,
                function(key) {
                    return false //預設false
                },
                vo.opt.kpCellEditable
            )

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

            let r = map(keys, function(key) {
                let o = {}

                //key
                o.field = key

                //text
                o.headerName = vo.kpHead[key]

                //sort
                o.sortable = vo.kpHeadSort[key]

                //filter
                o.filter = vo.kpHeadFilter[key] //若開啟欄位標題右邊的選單按鈕, 可使用文字過濾器'agTextColumnFilter'
                //o.suppressMenu = true //關閉欄位標題右邊的選單按鈕

                //filterParams
                o.filterParams = {
                    caseSensitive: true, //過濾區分大小寫
                    // applyButton: true, //彈出選單下方可加入使用按鈕
                    // clearButton: true, //彈出選單下方可加入取消按鈕
                }

                //filter plus, 欄位標題下方加入文字過濾輸入框, 需gridOptions內floatingFilter=true
                o.floatingFilterComponentParams = { suppressFilterButton: true } //關閉文字過濾輸入框右邊按鈕, 需suppressFilterButton=true

                //resizable
                o.resizable = true

                //editable
                o.editable = vo.kpCellEditable[key]

                //funHeadTooltip
                let funHeadTooltip = vo.kpHeadTooltip[key]

                //header onmouseenter
                let headerMouseenter = ''
                if (isfun(funHeadTooltip)) {

                    //tooltip
                    let t = funHeadTooltip(vo.kpHead[key])

                    //onmouseenter
                    headerMouseenter = `onmouseenter="ttWAgGridVue(this,'${t}')"`

                }

                //text-align
                let cTextAlign = vo.kpHeadAlighH[key]

                //justify-content
                let kpTA2JC = {
                    'left': 'flex-start',
                    'center': 'center',
                    'right': 'flex-end',
                }
                let cJustifyContent = kpTA2JC[cTextAlign]

                //複寫header template
                o.headerComponentParams = {
                    template: `
                        <div class="ag-cell-label-container" role="presentation"" ${headerMouseenter}>
                            <span ref="eMenu" class="ag-header-icon ag-header-cell-menu-button"></span>
                            <div ref="eLabel" class="ag-header-cell-label" style="justify-content:${cJustifyContent};" role="presentation">
                                <span ref="eText" class="ag-header-cell-text" role="columnheader"></span>
                                <span ref="eSortOrder" class="ag-header-icon ag-sort-order" ></span>
                                <span ref="eSortAsc" class="ag-header-icon ag-sort-ascending-icon" ></span>
                                <span ref="eSortDesc" class="ag-header-icon ag-sort-descending-icon" ></span>
                                <span ref="eSortNone" class="ag-header-icon ag-sort-none-icon" ></span>
                                <span ref="eFilter" class="ag-header-icon ag-filter-icon"></span>
                            </div> 
                        </div>
                    `
                }

                //funCellTooltip
                let funCellTooltip = vo.kpCellTooltip[key]

                //funCellRender
                let funCellRender = vo.kpCellRender[key]

                //render
                o.cellRenderer = function(params) {
                    //console.log('cellRenderer', params)

                    //funCellTooltip
                    if (isfun(funCellTooltip)) {

                        //tooltip
                        let t = funCellTooltip(params.value)

                        //onmouseenter
                        params.eGridCell.setAttribute('onmouseenter', `ttWAgGridVue(this,'${t}')`)

                    }

                    //h
                    let h = params.value

                    //funCellRender
                    if (isfun(funCellRender)) {
                        h = funCellRender(params.value, oo(params.data))
                    }

                    return h
                }

                //selectable
                o.checkboxSelection = false

                //fix
                if (vo.kpHeadFix[key]) {

                    //pinned
                    o.pinned = vo.kpHeadFix[key] ? 'left' : ''

                    //suppressSizeToFit, 禁止被sizeColumnsToFit
                    o.suppressSizeToFit = true

                }

                //align
                o.cellStyle = {
                    'text-align': vo.kpCellAlighH[key],
                }

                //width, 內容物超過width不會自動撐開
                if (isnum(vo.kpCellWidth[key])) {

                    //width
                    o.width = vo.kpCellWidth[key]

                }

                //min-width, ag-grid設定minWidth還是會自動被處理調整成寬度, 例如minWidth給150, 實際會依照內容長度轉成width如200, 而內容物超過轉換後的width不會自動撐開
                if (isnum(vo.defCellMinWidth)) {

                    //min-width
                    o.minWidth = vo.defCellMinWidth

                }

                //rowDrag
                o.rowDrag = vo.kpRowDrag[key]

                //hide
                o.hide = false

                return o
            })

            return r
        },

        onGridReady: function(params) {
            //console.log('methods onGridReady', params)

            let vo = this

            //ag
            vo.ag = params

            if (vo.canFitColumn) {

                //delay
                delay(function() {
                    params.api.sizeColumnsToFit()
                }, 1)

            }

        },

        showKeys: function(keys_new) {
            //console.log('methods showKeys', keys_new)

            let vo = this

            //keys_old
            let keys_old = cloneDeep(vo.keys)

            //keys_nouse
            let keys_nouse = difference(keys_old, keys_new)

            //cls_new
            let cls_new = vo.keys2columns(keys_new)
            let cls_nouse = vo.keys2columns(keys_nouse)
            cls_nouse = map(cls_nouse, function(cl) {
                cl.hide = true //未顯示column改為隱藏
                return cl
            })

            //cls
            let cls = concat(cls_new, cls_nouse)

            //update
            vo.gridOptions.api.setColumnDefs(cls)

        },

        getDisplayData: function() {
            //console.log('methods getDisplayData')

            let vo = this

            //rs
            let rs = []
            vo.gridOptions.api.forEachNodeAfterFilterAndSort(function(node) {
                rs.push(oo(node.data))
            })

            return rs
        },

    },
}
</script>

<style>
.CompCssWAgGridVue .ag-floating-filter-input, .ag-filter-filter, .ag-filter-select {
    transition: all 1s;
    padding: 3px;
    min-height: 21px;
    background-color: #fff;
    border: 1px solid #ccc;
    border-radius: 4px;
}
.CompCssWAgGridVue .ag-floating-filter-input:focus, .ag-filter-filter:focus, .ag-filter-select:focus {
    border: 1px solid #777;
}
.CompCssWAgGridVue .ag-floating-filter-button {
    margin: 0 !important;
    line-height: inherit !important;
    vertical-align: middle !important;
}
.CompCssWAgGridVue .ag-icon {
    vertical-align: middle !important;
}
</style>
