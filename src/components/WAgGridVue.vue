<template>
    <div
        class="CompCssWAgGridVue"
        :changeParam="changeParam"
    >

        <div
            :style="`width:${width}%; height:${height}px; ${transition}; opacity:${opacity};`"
        >

            <ag-grid-vue
                style="width:100%; height:100%;"
                class="ag-theme-balham"
                :columnDefs="columns"
                :rowData="filterRows"
                :rowStyle="getRowsStyle"
                :gridOptions="gridOptions"
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
import find from 'lodash/find'
import every from 'lodash/every'
import merge from 'lodash/merge'
import get from 'lodash/get'
import join from 'lodash/join'
import values from 'lodash/values'
import cloneDeep from 'lodash/cloneDeep'
import difference from 'lodash/difference'
import haskey from 'wsemi/src/haskey.mjs'
import arrhas from 'wsemi/src/arrhas.mjs'
import isobj from 'wsemi/src/isobj.mjs'
import iseobj from 'wsemi/src/iseobj.mjs'
import isearr from 'wsemi/src/isearr.mjs'
import isnum from 'wsemi/src/isnum.mjs'
import isfun from 'wsemi/src/isfun.mjs'
import isbol from 'wsemi/src/isbol.mjs'
import binstr from 'wsemi/src/binstr.mjs'
import getdtv from 'wsemi/src/getdtv.mjs'
import ltdtmapping from 'wsemi/src/ltdtmapping.mjs'
import str2md5 from 'wsemi/src/str2md5.mjs'
import delay from 'wsemi/src/delay.mjs'
import onTooltip from 'wsemi/src/onTooltip.mjs'
import { AgGridVue } from 'ag-grid-vue' //會再引用vue-class-component與vue-property-decorator
import 'ag-grid-community/dist/styles/ag-grid.css'
import 'ag-grid-community/dist/styles/ag-theme-balham.css'


//tooltip, 通過key查msg避免特殊html符號無法顯示
let dtmsg = {}
window.ttWAgGridVue = function(ele, kmsg) {
    let msg = dtmsg[kmsg]
    onTooltip(ele, msg)
}


/**
 * @vue-prop {Object} opt 輸入資料設定物件
 * @vue-prop {Array} opt.keys 輸入資料各欄位keys
 * @vue-prop {Array} opt.rows 輸入資料列，各列為物件，內含各欄位keys之值，例[{},{},...,{}]
 * @vue-prop {Object} [opt.kpHead={}] 輸入key對應head物件，預設為keys
 * @vue-prop {Object} [opt.kpHeadTooltip={}] 輸入key對應需tooltip的html字串物件，於各head處滑鼠移入時觸發，預設為{}
 * @vue-prop {Object} [opt.defHeadAlighH='center'] 輸入head預設之左右對齊字串，預設為'center'
 * @vue-prop {Object} [opt.kpHeadAlighH={}] 輸入key對應head之左右對齊字串物件，預設為各key值為defHeadAlighH
 * @vue-prop {Object} [opt.defHeadSort=true] 輸入head預設之是否允許排序布林值，預設為true
 * @vue-prop {Object} [opt.kpHeadSort={}] 輸入key對應head之是否允許排序物件，預設為各key值為defHeadSort
 * @vue-prop {Object} [opt.kpHeadFixLeft={}] 輸入key對應head之是否固定於左側物件，預設為各key值為false
 * @vue-prop {Object} [opt.defHeadFilter=true] 輸入head預設之是否允許過濾布林值，預設為true
 * @vue-prop {Object} [opt.kpHeadFilter={}] 輸入key對應head之是否允許過濾物件，預設為各key值為defHeadFilter
 * @vue-prop {Object} [opt.defHeadDrag=true] 輸入head預設之是否允許拖曳布林值，預設為true
 * @vue-prop {Object} [opt.kpHeadDrag={}] 輸入key對應head之是否允許拖曳物件，預設為各key值為defHeadDrag
 * @vue-prop {Object} [opt.kpRowStyle={}] 輸入key對應row style之物件，可設定key欄之cell值所需對應之row style，預設為{}
 * @vue-prop {Object} [opt.kpRowDrag={}] [專有:ag-grid] 輸入key對應row之是否能拖曳排序物件，預設為各key值為false
 * @vue-prop {Number} [opt.defCellMinWidth=null] 輸入cell預設最小寬度數字，預設為null
 * @vue-prop {Object} [opt.kpCellWidth=null] 輸入key對應cell之寬度物件，預設為各key值為null
 * @vue-prop {Object} [opt.kpCellRender={}] 輸入key對應cell之渲染函數物件，預設為{}
 * @vue-prop {Object} [opt.kpCellTooltip={}] 輸入key對應cell之tooltip的html字串物件，於各cell處滑鼠移入時觸發，預設為{}
 * @vue-prop {Object} [opt.defCellAlighH='center'] 輸入cell預設之左右對齊字串，預設為'center'
 * @vue-prop {Object} [opt.kpCellAlighH={}] 輸入key對應cell之左右對齊字串物件，預設為各key值為defCellAlighH
 * @vue-prop {Object} [opt.defCellEditable=false] 輸入cell預設之是否可編輯布林值，預設為false
 * @vue-prop {Object} [opt.kpCellEditable={}] 輸入key對應cell之是否可編輯物件，預設為各key值為defCellEditable
 * @vue-prop {Function} [opt.rowClick={}] 輸入row click之觸發事件，預設為function(){}
 * @vue-prop {Function} [opt.rowDbClick={}] 輸入row double click之觸發事件，預設為function(){}
 * @vue-prop {Function} [opt.rowChange={}] 輸入row change之觸發事件，預設為function(){}
 * @vue-prop {Function} [opt.cellClick={}] 輸入cell click之觸發事件，預設為function(){}
 * @vue-prop {Function} [opt.cellDbClick={}] 輸入cell double click之觸發事件，預設為function(){}
 * @vue-prop {Function} [opt.cellChange={}] 輸入cell change之觸發事件，預設為function(){}
 * @vue-prop {Number} [height=300] 表格高度，預設300(px)
 * @vue-prop {String} [filterall=''] 輸入對全表數據進行過濾之字串，預設為''
 * @vue-event {Null} refresh 刷新表格，無輸入與回傳
 * @vue-event {Array} showKeys 指定欲顯示欄位的keys，數量最多為原本初始化的keys，可更改順序，無回傳
 * @vue-event {Array} setHeadFilter 指定欄位的key與要過濾的值value，會於界面上指定欄進行過濾
 * @vue-event {Array} clearHeadFilter 指定欄位的key並清除當前所使用的過濾值
 * @vue-event {Array} clearHeadFilterAll 清除當前所有欄位所使用的過濾值
 * @vue-event {Null} getDisplayData 無輸入，會回傳目前表格所顯示之數據
 * @vue-event {Null} getInstance 無輸入，會回傳ag-grid表格實例物件
 * @vue-event {Null} fitColumns 無輸入，會進行擴充版的sizeColumnsToFit
 */
export default {
    components: {
        AgGridVue,
    },
    props: {
        opt: {
            type: Object,
        },
        height: {
            type: Number,
            default: 300
        },
        filterall: {
            type: String,
            default: ''
        },
    },
    data: function() {
        let vo = this
        return {

            width: 100,
            transition: 'transition:all 0.5s',
            opacity: 0,

            canFitColumn: false,

            rows: [],
            keys: [],
            columns: [],

            kpHead: {},
            kpHeadTooltip: {},
            defHeadAlighH: null,
            kpHeadAlighH: {},
            defHeadSort: null,
            kpHeadSort: {},
            kpHeadFixLeft: {},
            defHeadFilter: null,
            kpHeadFilter: {},
            hideHeadFilter: null,
            defHeadDrag: null,
            kpHeadDrag: {},
            kpRowStyle: {},
            kpRowDrag: {}, //ag-grid才有
            defCellMinWidth: null,
            kpCellWidth: {},
            kpCellRender: {},
            kpCellTooltip: {},
            defCellAlighH: null,
            kpCellAlighH: {},
            defCellEditable: null,
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

        changeParam: function() {
            //console.log('computed changeParam')

            let vo = this

            //opt for trigger
            let opt = vo.opt

            //changeOpt
            vo.changeOpt()

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

            //rows, filterall for trigger
            let rows = vo.rows
            let filterall = vo.filterall

            //check
            if (filterall === '') {
                return rows
            }

            //filter
            let frs = filter(rows, function(v, k) {
                let c = join(values(v), '')
                return binstr(c, filterall)
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
                let d = getdtv(params.data, k)
                if (isfun(f) && d) {
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

        refresh: async function() {
            //console.log('methods refresh')

            let vo = this

            //delay
            await delay(1)

            //redrawRows, 因資料變更不會觸發getRowStyle, 給自行redrawRows
            vo.gridOptions.api.redrawRows()

        },

        changeOpt: function() {
            //console.log('methods changeOpt')

            let vo = this

            //check
            if (!iseobj(vo.opt)) {
                return
            }
            if (!isearr(get(vo, 'opt.keys'))) {
                console.log('no keys')
                return
            }
            if (!isearr(get(vo, 'opt.rows'))) {
                console.log('no rows')
                return
            }

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

            //canFitColumn, ag-grid僅有, 可用但效果不好
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

            //defHeadAlighH
            vo.defHeadAlighH = 'center'
            if (arrhas(vo.opt.defHeadAlighH, ['left', 'center', 'right'])) {
                vo.defHeadAlighH = vo.opt.defHeadAlighH
            }

            //kpHeadAlighH
            vo.kpHeadAlighH = setobj(vo.keys,
                true,
                function(key) {
                    return vo.defHeadAlighH
                },
                vo.opt.kpHeadAlighH
            )

            //defHeadSort
            vo.defHeadSort = true
            if (isbol(vo.opt.defHeadSort)) {
                vo.defHeadSort = vo.opt.defHeadSort
            }

            //kpHeadSort
            vo.kpHeadSort = setobj(vo.keys,
                true,
                function(key) {
                    return vo.defHeadSort
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

            //defHeadFilter
            vo.defHeadFilter = true
            if (isbol(vo.opt.defHeadFilter)) {
                vo.defHeadFilter = vo.opt.defHeadFilter
            }

            //kpHeadFilter
            vo.kpHeadFilter = setobj(vo.keys,
                true,
                function(key) {
                    return vo.defHeadFilter
                },
                vo.opt.kpHeadFilter
            )

            //hideHeadFilter
            vo.hideHeadFilter = every(values(vo.kpHeadFilter), function(v) {
                return v === false
            })

            //defHeadDrag
            vo.defHeadDrag = true
            if (isbol(vo.opt.defHeadDrag)) {
                vo.defHeadDrag = vo.opt.defHeadDrag
            }

            //kpHeadDrag
            vo.kpHeadDrag = setobj(vo.keys,
                true,
                function(key) {
                    return vo.defHeadDrag
                },
                vo.opt.kpHeadDrag
            )

            //kpRowStyle
            vo.kpRowStyle = {}
            if (isobj(vo.opt.kpRowStyle)) {
                vo.kpRowStyle = vo.opt.kpRowStyle
            }

            //kpRowDrag, ag-grid才有
            vo.kpRowDrag = setobj(vo.keys,
                true,
                function(key) {
                    return false //預設false
                },
                vo.opt.kpRowDrag
            )

            //defCellMinWidth
            vo.defCellMinWidth = null
            if (isnum(vo.opt.defCellMinWidth)) {
                vo.defCellMinWidth = vo.opt.defCellMinWidth
            }

            //kpCellWidth
            vo.kpCellWidth = setobj(vo.keys,
                true,
                function(key) {
                    return null //預設null
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

            //defCellAlighH
            vo.defCellAlighH = 'center'
            if (arrhas(vo.opt.defCellAlighH, ['left', 'center', 'right'])) {
                vo.defCellAlighH = vo.opt.defCellAlighH
            }

            //kpCellAlighH
            vo.kpCellAlighH = setobj(vo.keys,
                true,
                function(key) {
                    return vo.defCellAlighH
                },
                vo.opt.kpCellAlighH
            )

            //defCellEditable
            vo.defCellEditable = false
            if (isbol(vo.opt.defCellEditable)) {
                vo.defCellEditable = vo.opt.defCellEditable
            }

            //kpCellEditable
            vo.kpCellEditable = setobj(vo.keys,
                true,
                function(key) {
                    return vo.defCellEditable
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

            //hideHeadFilter
            if (vo.hideHeadFilter) {
                vo.gridOptions.floatingFilter = false
            }

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
                    // caseSensitive: true, //過濾區分大小寫, 會導致數字欄位無法被過濾
                    // applyButton: true, //彈出選單下方可加入使用按鈕
                    // clearButton: true, //彈出選單下方可加入取消按鈕
                    // filterParams: {
                    //     comparator: function(ft, cv) {
                    //         console.log('comparator', ft, cv)
                    //     }
                    // }
                }
                //filter plus, 欄位標題下方加入文字過濾輸入框, 需gridOptions內floatingFilter=true
                o.floatingFilterComponentParams = { suppressFilterButton: true } //關閉文字過濾輸入框右邊按鈕, 需suppressFilterButton=true

                //lockPosition, 會強制置左故不使用
                //o.lockPosition = !vo.kpHeadDrag[key]

                //suppressMovable, 指定欄位不能拖曳, 但會被其他欄位拖曳而改變位置
                o.suppressMovable = !vo.kpHeadDrag[key]

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

                    //kmsg
                    let kmsg = str2md5(t)

                    //add dtmsg
                    dtmsg[kmsg] = t

                    //onmouseenter
                    headerMouseenter = `onmouseenter="ttWAgGridVue(this,'${kmsg}')"`

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

                        //kmsg
                        let kmsg = str2md5(t)

                        //add dtmsg
                        dtmsg[kmsg] = t

                        //onmouseenter
                        params.eGridCell.setAttribute('onmouseenter', `ttWAgGridVue(this,'${kmsg}')`)

                    }

                    //h
                    let h = params.value

                    //funCellRender
                    if (isfun(funCellRender)) {
                        h = funCellRender(params.value, cloneDeep(params.data))
                    }

                    return h
                }

                //selectable
                o.checkboxSelection = false

                //fix
                if (vo.kpHeadFixLeft[key]) {

                    //pinned
                    o.pinned = vo.kpHeadFixLeft[key] ? 'left' : ''

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

                //fitColumns
                vo.fitColumns()

            }
            else {

                //show, 假如transition沒被清空, 就代表沒有fitColumns執行中, 可直接顯示
                if (vo.transition !== '') {
                    vo.opacity = 1
                }

            }

        },

        showKeys: function(keys_new) {
            //console.log('methods showKeys', keys_new)

            let vo = this

            //keys_old
            let keys_old = cloneDeep(vo.keys)

            //keys_nouse
            let keys_nouse = difference(keys_old, keys_new)

            //cs
            let cs = vo.gridOptions.columnApi.getColumnState()

            //csn
            let csn = []
            each(keys_new, function(key) {
                let c = find(cs, { 'colId': key })
                c.hide = false
                csn.push(c)
            })
            each(keys_nouse, function(key) {
                let c = find(cs, { 'colId': key })
                c.hide = true //未顯示column改為隱藏
                csn.push(c)
            })

            //update
            vo.gridOptions.columnApi.setColumnState(csn)

        },

        clearHeadFilterAll: function() {
            //console.log('methods clearHeadFilterAll')

            let vo = this

            //reset all filters
            vo.gridOptions.api.setFilterModel(null)

            //fire onFilterChanged
            vo.gridOptions.api.onFilterChanged()

        },

        clearHeadFilter: function(key) {
            //console.log('methods clearHeadFilter', key)

            let vo = this

            //ft
            let ft = vo.gridOptions.api.getFilterInstance(key)

            //setModel
            ft.setModel(null)

            //fire onFilterChanged
            vo.gridOptions.api.onFilterChanged()

        },

        setHeadFilter: function(key, value, type = 'contains') {
            //console.log('methods setHeadFilter', key, value, type)

            let vo = this

            //check
            if (!arrhas(type, ['equals', 'notEqual', 'contains', 'notContains', 'startsWith', 'endsWith'])) {
                type = 'contains'
            }

            // //fo
            // let fo = {}
            // fo[key] = { type: type, filter: value }

            // //setFilterModel
            // vo.gridOptions.api.setFilterModel(fo) //此法是一次性對全部欄位設定過濾條件, 故分次設定過濾時, 前次的過濾設定會被取消

            //ft
            let ft = vo.gridOptions.api.getFilterInstance(key)

            //setModel
            ft.setModel({
                type: type,
                filter: value
            })

            //fire onFilterChanged
            vo.gridOptions.api.onFilterChanged()

        },

        getDisplayData: function() {
            //console.log('methods getDisplayData')

            let vo = this

            //rs
            let rs = []
            vo.gridOptions.api.forEachNodeAfterFilterAndSort(function(node) {
                rs.push(cloneDeep(node.data))
            })

            //cs
            let cs = vo.gridOptions.columnApi.getColumnState()

            //show keys
            let keys = map(filter(cs, { 'hide': false }), 'colId')

            //ltdtmapping
            rs = ltdtmapping(rs, keys)

            return rs
        },

        getInstance: function() {
            //console.log('methods getInstance')

            let vo = this

            return vo.gridOptions
        },

        fitColumns: async function() {
            //console.log('methods fitColumns')

            let vo = this

            //fit
            async function fit(w) {
                try {

                    //width
                    vo.width = w

                    //getInstance
                    let o = vo.getInstance()

                    //sizeColumnsToFit
                    o.api.sizeColumnsToFit()

                }
                catch (e) {
                    console.log('fitColumns error', e)
                }
            }

            //hide
            vo.transition = ''
            vo.opacity = 0

            //delay
            await delay(1)

            //先微縮小fit
            await fit(99.5)

            //delay
            await delay(1)

            //還原再fit
            await fit(100)

            //delay
            await delay(1)

            //show
            vo.transition = 'transition:all 0.5s'
            vo.opacity = 1

        },

    },
}
</script>

<style>
.CompCssWAgGridVue .ag-theme-balham, .ag-header {
    font-family: inherit;
}
.CompCssWAgGridVue .ag-theme-balham .ag-header {
    font-family: inherit;
}
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
