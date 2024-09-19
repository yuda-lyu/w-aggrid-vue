<template>
    <div
        ref="shell"
        class="CompCssWAgGridVue"
        :changeParam="changeParam"
        :changeFilterall="changeFilterall"
    >

        <div
            :style="`width:${width}%; height:${height}px; transition:all 0.5s; opacity:${opacity};`"
            @mouseleave="leaveTable"
        >

            <ag-grid-vue
                ref="agv"
                style="width:100%; height:100%;"
                class="ag-theme-balham"
                :columnDefs="columns"
                :rowData="filterRows"
                :rowStyle="getRowsStyle"
                :rowSelection="'multiple'"
                :gridOptions="gridOptions"
                _enableRangeSelection="true"
                _copyHeadersToClipboard="true"
                _modules="AllModules"
                @selectionChanged="agRowSelect"
                @cellClicked="agCellClick"
                @cellDoubleClicked="agCellDbClick"
                @cellValueChanged="agCellChange"
                @cellMouseOver="agCellMouseEnter"
                @cellMouseOut="agCellMouseLeave"
                @cellKeyDown="agCellKeyDown"
                @rowDragEnter="agRowDragEnter"
                @rowDragEnd="agRowDragEnd"
                @rowDragMove="agRowDragMove"
                @rowDragLeave="agRowDragLeave"
                @filterChanged="agFilterChanged"
                @gridReady="agReady"
            ></ag-grid-vue>

        </div>

    </div>
</template>

<script>
import map from 'lodash-es/map.js'
import each from 'lodash-es/each.js'
import size from 'lodash-es/size.js'
import filter from 'lodash-es/filter.js'
import isEqual from 'lodash-es/isEqual.js'
import find from 'lodash-es/find.js'
import merge from 'lodash-es/merge.js'
import get from 'lodash-es/get.js'
import set from 'lodash-es/set.js'
import join from 'lodash-es/join.js'
import split from 'lodash-es/split.js'
import values from 'lodash-es/values.js'
import cloneDeep from 'lodash-es/cloneDeep.js'
import concat from 'lodash-es/concat.js'
import difference from 'lodash-es/difference.js'
import trim from 'lodash-es/trim.js'
import haskey from 'wsemi/src/haskey.mjs'
import arrHas from 'wsemi/src/arrHas.mjs'
import sep from 'wsemi/src/sep.mjs'
import pmSeries from 'wsemi/src/pmSeries.mjs'
import iser from 'wsemi/src/iser.mjs'
import isobj from 'wsemi/src/isobj.mjs'
import iseobj from 'wsemi/src/iseobj.mjs'
import isarr from 'wsemi/src/isarr.mjs'
import isearr from 'wsemi/src/isearr.mjs'
import isestr from 'wsemi/src/isestr.mjs'
import isnum from 'wsemi/src/isnum.mjs'
import isfun from 'wsemi/src/isfun.mjs'
import ispm from 'wsemi/src/ispm.mjs'
import isbol from 'wsemi/src/isbol.mjs'
import isp0int from 'wsemi/src/isp0int.mjs'
import cdbl from 'wsemi/src/cdbl.mjs'
import cstr from 'wsemi/src/cstr.mjs'
import cint from 'wsemi/src/cint.mjs'
import binstr from 'wsemi/src/binstr.mjs'
import ltdtmapping from 'wsemi/src/ltdtmapping.mjs'
import ltdtkeys2mat from 'wsemi/src/ltdtkeys2mat.mjs'
import downloadExcelFileFromDataDyn from 'wsemi/src/downloadExcelFileFromDataDyn.mjs'
import domShowInputAndGetFilesU8Arrs from 'wsemi/src/domShowInputAndGetFilesU8Arrs.mjs'
import getDataFromExcelFileU8ArrDyn from 'wsemi/src/getDataFromExcelFileU8ArrDyn.mjs'
import str2md5 from 'wsemi/src/str2md5.mjs'
import delay from 'wsemi/src/delay.mjs'
import replace from 'wsemi/src/replace.mjs'
import debounce from 'wsemi/src/debounce.mjs'
import domDetect from 'wsemi/src/domDetect.mjs'
import domTooltip from 'wsemi/src/domTooltip.mjs'
import * as agv from 'ag-grid-vue' //會再引用vue-class-component與vue-property-decorator, 因無法被rollup編譯, 故須由外部引入cdn
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-balham.css'
// import { AllModules } from '@ag-grid-enterprise/all-modules' //ag-gird-enterprise雖可使用modules擴充支援剪貼簿貼上Excel range數據, 不過由Excel複製的數據會有換行字元, 此導致ag-grid解析多一列的空數據而覆蓋到原數據, 無法用
import getLangText from './getLangText.mjs'


//vcAgGridVue, vue-cli4引用可取到AgGridVue
let vcAgGridVue = get(agv, 'AgGridVue')
// console.log('vcAgGridVue',vcAgGridVue)


//wdAgGridVue, 因rollup無法編譯ag-grid-vue故動態加載時只能由外部引用cdn
let wdAgGridVue = get(window, 'agGridVue.AgGridVue')
// console.log('wdAgGridVue',wdAgGridVue)


//useAgGridVue
let useAgGridVue = vcAgGridVue || wdAgGridVue
// console.log('useAgGridVue',useAgGridVue)


//tooltip, 通過key查msg避免特殊html符號無法顯示
let dtmsg = {}
window.ttWAgGridVue = function(ele, kmsg) {
    if (!isestr(kmsg)) {
        return
    }
    let msg = dtmsg[kmsg]
    domTooltip(ele, msg)
}


function parseText(contentPaste) {
    contentPaste = trim(contentPaste)
    contentPaste = replace(contentPaste, '\r\n', '\n')
    contentPaste = replace(contentPaste, '\r', '\n')
    let pRows = sep(contentPaste, '\n')
    let pData = []
    each(pRows, (v) => {
        if (trim(v) !== '') {
            let s = split(v, '\t')
            pData.push(s)
        }
    })
    return pData
}


/**
 * @vue-prop {Object} opt 輸入資料設定物件
 * @vue-prop {Array} opt.keys 輸入資料各欄位keys
 * @vue-prop {Array} opt.rows 輸入資料列，各列為物件，內含各欄位keys之值，例[{},{},...,{}]
 * @vue-prop {Object} [opt.kpHead={}] 輸入key對應head物件，預設各key值為本身key值
 * @vue-prop {Number} [opt.defHeadMinWidth=null] 輸入cell預設最小寬度數字，預設為null
 * @vue-prop {Number} [opt.defHeadMaxWidth=null] 輸入cell預設最小寬度數字，預設為null
 * @vue-prop {Object} [opt.kpHeadWidth={}] 輸入key對應cell之寬度物件，預設各key值為undefined
 * @vue-prop {Object} [opt.kpHeadTooltip={}] 輸入key對應需tooltip的html字串物件，於各head處滑鼠移入時觸發，預設各key值為undefined
 * @vue-prop {String} [opt.defHeadAlignH='center'] 輸入head預設之左右對齊字串，預設為'center'
 * @vue-prop {Object} [opt.kpHeadAlignH={}] 輸入key對應head之左右對齊字串物件，預設各key值為defHeadAlignH
 * @vue-prop {Boolean} [opt.defHeadSort=true] 輸入head預設之是否允許排序布林值，預設為true
 * @vue-prop {Object} [opt.kpHeadSort={}] 輸入key對應head之是否允許排序物件，預設各key值為defHeadSort
 * @vue-prop {Function|String} [opt.defHeadSortMethod=null] 輸入head預設之排序方式函數或字串，若需自行定義則給予函數，若需使用內建的自動轉型判斷方式則給予'auto'字串，預設為null
 * @vue-prop {Object} [opt.kpHeadSortMethod={}] 輸入key對應head之排序方式函數或字串，若需自行定義則給予函數，若需使用內建的自動轉型判斷方式則給予'auto'字串，預設各key值為defHeadSortMethod
 * @vue-prop {Object} [opt.kpHeadFixLeft={}] 輸入key對應head之是否固定於左側物件，預設各key值為false
 * @vue-prop {Boolean} [opt.defHeadFilter=true] 輸入head預設之是否允許過濾布林值，預設為true
 * @vue-prop {Object} [opt.kpHeadFilter={}] 輸入key對應head之是否允許過濾物件，預設各key值為defHeadFilter
 * @vue-prop {String} [opt.defHeadFilterType='num'] 輸入head預設過濾器字串，可選'num'、'text'、'time'、'set'，預設為'num'
 * @vue-prop {Object} [opt.kpHeadFilterType={}] 輸入key對應head之過濾器物件，可使用'num'、'text'、'time'、'set'，預設各key值為'num'
 * @vue-prop {Object} [opt.kpHeadRender={}] 輸入key對應head之渲染函數物件，預設各key值為undefined
 * @vue-prop {Boolean} [opt.defHeadDrag=true] 輸入head預設之是否允許拖曳布林值，預設為true
 * @vue-prop {Object} [opt.kpHeadDrag={}] 輸入key對應head之是否允許拖曳物件，預設各key值為defHeadDrag
 * @vue-prop {Object} [opt.kpHeadCheckBox={}] 輸入key對應head與key的各列是否使用核選方塊物件，預設各key值為false
 * @vue-prop {Object} [opt.kpHeadFocusHighlight={}] 輸入key對應key的各列於獲得焦點時是否高亮顯示物件，預設各key值為true
 * @vue-prop {Object} [opt.kpHeadHide={}] 輸入key對應head是否隱藏物件，預設各key值為false
 * @vue-prop {Object} [opt.kpRowStyle={}] 輸入key對應row style之物件，可設定各key欄之函數，函數給予cell值需回傳之row style，預設各key值為undefined
 * @vue-prop {Object} [opt.kpRowDrag={}] 輸入key對應col之是否能拖曳排序物件，預設各key值為false
 * @vue-prop {Function} [opt.genRowsPinnTop=null] 輸入產生置頂rows函數，輸入為表內全部數據，預設為null
 * @vue-prop {Function} [opt.genRowsPinnBottom=null] 輸入產生置底rows函數，輸入為表內全部數據，預設為null
 * @vue-prop {Object} [opt.kpColStyle={}] 輸入key對應col style之物件，可設定各key欄之col style，預設各key值為undefined
 * @vue-prop {Object} [opt.kpColSpan={}] 輸入key對應col span之物件，可設定各key欄之col span，預設各key值為undefined
 * @vue-prop {Object} [opt.kpCellRender={}] 輸入key對應cell之渲染函數物件，預設各key值為undefined
 * @vue-prop {Object} [opt.kpCellTooltip={}] 輸入key對應cell之tooltip的html字串物件，於各cell處滑鼠移入時觸發，預設各key值為undefined
 * @vue-prop {String} [opt.defCellAlignH='center'] 輸入cell預設之左右對齊字串，預設為'center'
 * @vue-prop {Object} [opt.kpCellAlignH={}] 輸入key對應cell之左右對齊字串物件，預設各key值為defCellAlignH
 * @vue-prop {Boolean} [opt.defCellEditable=false] 輸入cell預設之是否可編輯布林值，預設為false
 * @vue-prop {Object} [opt.kpCellEditable={}] 輸入key對應cell之是否可編輯物件，預設各key值為defCellEditable
 * @vue-prop {Object} [opt.kpConvertKeysWhenUploadData={}] 輸入上傳Excel檔案時，當key轉會成對應新key值物件，預設{}
 * @vue-prop {Function} [opt.rowsChange=()=>{}] 輸入rows change之觸發事件，預設為()=>{}
 * @vue-prop {Function} [opt.rowClick=()=>{}] 輸入row click之觸發事件，預設為()=>{}
 * @vue-prop {Function} [opt.rowDbClick=()=>{}] 輸入row double click之觸發事件，預設為()=>{}
 * @vue-prop {Function} [opt.rowChange=()=>{}] 輸入row change之觸發事件，預設為()=>{}
 * @vue-prop {Function} [opt.rowChecked=()=>{}] 輸入row checked之觸發事件，需使用kpHeadCheckBox開啟指定key的head與對應rows使用checkbox，預設為()=>{}
 * @vue-prop {Function} [opt.rowMouseEnter=()=>{}] 輸入row mouseenter之觸發事件，預設為()=>{}
 * @vue-prop {Function} [opt.rowMouseLeave=()=>{}] 輸入row mouseleave之觸發事件，預設為()=>{}
 * @vue-prop {Function} [opt.cellClick=()=>{}] 輸入cell click之觸發事件，預設為()=>{}
 * @vue-prop {Function} [opt.cellDbClick=()=>{}] 輸入cell double click之觸發事件，預設為()=>{}
 * @vue-prop {Function} [opt.cellChange=()=>{}] 輸入cell change之觸發事件，預設為()=>{}
 * @vue-prop {Function} [opt.cellMouseEnter=()=>{}] 輸入cell mouseenter之觸發事件，預設為()=>{}
 * @vue-prop {Function} [opt.cellMouseLeave=()=>{}] 輸入cell mouseleave之觸發事件，預設為()=>{}
 * @vue-prop {Function} [opt.filterChange=()=>{}] 輸入filter change之觸發事件，預設為()=>{}
 * @vue-prop {Boolean} [opt.autoFitColumn=false] 輸入當表格尺寸變更時自動調整欄寬布林值，預設false
 * @vue-prop {String} [opt.language='en'] 輸入指定語系字串，可選'en'、'zh-tw'、'zh-cn'，預設為'en'
 * @vue-prop {Number} [height=300] 表格高度，單位為px，預設300
 * @vue-prop {String} [filterall=''] 輸入對全表數據進行過濾之字串，預設為''
 */
export default {
    components: {
        AgGridVue: useAgGridVue,
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
            dbc: debounce(),
            de: null,

            evPaste: null,
            dataPasted: '',

            width: 100,
            opacity: 0,

            autoFitColumn: false,

            language: '',

            rows: [],
            keys: [],
            columns: [],

            kpHead: {},
            defHeadMinWidth: null,
            defHeadMaxWidth: null,
            kpHeadWidth: {},
            kpHeadTooltip: {},
            defHeadAlignH: null,
            kpHeadAlignH: {},
            defHeadSort: null,
            kpHeadSort: {},
            defHeadSortMethod: null,
            kpHeadSortMethod: {},
            kpHeadFixLeft: {},
            defHeadFilter: null,
            kpHeadFilter: {},
            defHeadFilterType: null,
            kpHeadFilterType: {},
            defHeadDrag: null,
            kpHeadRender: {},
            kpHeadDrag: {},
            kpHeadCheckBox: {},
            kpHeadFocusHighlight: {},
            kpHeadHide: {},
            kpRowStyle: {},
            kpRowDrag: {},
            kpColStyle: {},
            kpColSpan: {},
            kpCellRender: {},
            kpCellTooltip: {},
            defCellAlignH: null,
            kpCellAlignH: {},
            defCellEditable: null,
            kpCellEditable: {},
            kpConvertKeysWhenUploadData: null,

            tableClickEnable: false,
            rowsChange: function() {},
            rowChange: function() {},
            rowChecked: function() {},
            rowMouseEnter: function() {},
            rowMouseLeave: function() {},
            rowClick: function() {},
            rowDbClick: function() {},
            rowDragEnter: function() {},
            rowDragEnd: function() {},
            rowDragMove: function() {},
            rowDragLeave: function() {},
            rowDragChange: function() {},
            cellClick: function() {},
            cellDbClick: function() {},
            cellChange: function() {},
            cellMouseEnter: function() {},
            cellMouseLeave: function() {},
            filterChange: function() {},

            //因ag-grid只提供mouseout沒有mouseleave, 導致會因為內元素而觸發mouseout, 得通過暫存機制產生mouseleave事件
            vRowMouseEnter: null,
            vRowMouseLeave: null,
            eRowMouseLeaves: [],
            vCellMouseEnter: null,
            vCellMouseLeave: null,
            eCellMouseLeaves: [],
            iRowDragEnter: null,

            genRowsPinnTop: null,
            genRowsPinnBottom: null,

            // AllModules,
            gridOptions: {

                animateRows: true,

                suppressMenuHide: true, //預設為false, 代表標題右側的漢堡按鈕預先隱藏, 滑鼠移入時才顯示

                // rowHoverHighlight: true,
                suppressRowHoverHighlight: false, //ag-grid 25.3.0已由rowHoverHighlight改為suppressRowHoverHighlight

                // suppressColumnHoverHighlight: false,
                columnHoverHighlight: false, //ag-grid 26.2.0已由suppressColumnHoverHighlight改為columnHoverHighlight

                // floatingFilter: true, //ag-grid 23.1.0已改為由column給予floatingFilter

                rowDragManaged: true,

                suppressRowClickSelection: true, //若開啟checkboxSelection

                singleClickEdit: true, //單點即可變更

                // stopEditingWhenGridLosesFocus: true,
                stopEditingWhenCellsLoseFocus: true, //失去焦點則停止編輯, ag-grid 25.2.2改為stopEditingWhenCellsLoseFocus

                // suppressCellFocus: true, //點擊因cell獲得焦點會出現邊框, 若關閉(suppressCellFocus=true)會導致全部cell都關閉, 另用賦予class處理

                // localeText: null,
                getLocaleText: vo.agGetLocaleText,

                getRowStyle: vo.agGetRowStyle,

                // debounceVerticalScrollbar: true,

                pinnedTopRowData: [],
                pinnedBottomRowData: [],

            },

            ag: null,

            pathItems: [
                'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js',
            ],

        }
    },
    mounted: function() {

        let vo = this

        //監聽dom
        vo.de = domDetect(() => {
            return get(vo, '$refs.shell', null)
        })
        vo.de.on('resize', (s) => {
            // console.log('resize', s)
            if (vo.autoFitColumn) {
                vo.fitColumns()
            }
        })
        vo.de.on('display', (s) => {
            // console.log('display', s)
            if (vo.autoFitColumn) {
                vo.fitColumns()
            }
        })

        //paste
        vo.evPaste = (e) => {
            //console.log('paste', e)

            //clipboardData
            let clipboardData = event.clipboardData || window.clipboardData

            //save dataPasted
            vo.dataPasted = clipboardData.getData('Text')

        }
        window.addEventListener('paste', vo.evPaste)

    },
    beforeDestroy: function() {
        //console.log('beforeMount')

        let vo = this

        //釋放監聽
        vo.de.clear()

        //removeEventListener
        window.removeEventListener('paste', vo.evPaste)

    },
    computed: {

        changeParam: function() {
            //console.log('computed changeParam')

            let vo = this

            //trigger
            let opt = vo.opt
            vo.__temp__ = { opt }

            //changeOpt
            vo.changeOpt()

            return ''
        },

        changeFilterall: function() {
            // console.log('computed changeFilterall')

            let vo = this

            //trigger
            let filterall = vo.filterall
            vo.__temp__ = { filterall }

            //triggerFilterChange
            vo.triggerFilterChange('filterall')

            return ''
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

            //trigger
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

        getGridOptions: function() {
            //console.log('methods getGridOptions')

            let vo = this

            return vo.gridOptions
        },

        getApi: function() {
            // console.log('getApi')

            let vo = this

            //api, ag-grid 31.1.0的gridOptions.api已改為須由組件ref取得
            let api = get(vo, '$refs.agv.api', null)

            return api
        },

        agGetLocaleText: function(params) {
            // console.log('agGetLocaleText', params)

            let vo = this

            //getLangText
            let t = getLangText(vo.language, params.key, params.defaultValue)

            return t
        },

        agGetRowStyle: function(params) {
            //console.log('agGetRowStyle', params) //由各row呼叫

            let vo = this

            //style
            let style = {}
            each(vo.kpRowStyle, function(v, k) {
                let f = v
                let d = get(params.data, k)
                if (isfun(f)) {
                    style = merge(style, f(d))
                }
            })

            return style
        },

        triggerRowDragChange: function(indFrom, indTo, row, rows) {

            let vo = this

            //check
            if (indFrom !== indTo) {
                vo.iRowDragEnter = indTo

                //需使用set強制更新外部opt物件的rows並再同步更新至內部rows, 否則外面數據會沒更動
                set(vo, `opt.rows`, rows)

                //rowDragChange
                vo.rowDragChange(indFrom, indTo, row, rows)

                //rowsChange, rows是內部已更新數據, 直接用於回傳函數
                vo.rowsChange(rows)

            }

        },

        agRowDragEnter: function(param) {
            // console.log('methods agRowDragEnter', param)

            let vo = this

            //ind
            let ind = get(param, 'node.rowIndex', '')
            // console.log('agRowDragEnter ind', ind)

            //iRowDragEnter
            vo.iRowDragEnter = ind

            //row
            let row = get(param, 'node.data', null)

            // //rows
            // let rows = vo.getNowData()
            // // console.log('agRowDragEnd rows', cloneDeep(rows))

            //rowDragEnter
            vo.rowDragEnter(ind, -1, row)

        },

        agRowDragEnd: function(param) {
            // console.log('methods agRowDragEnd', param)

            let vo = this

            //ind
            let ind = get(param, 'node.rowIndex', '')
            // console.log('agRowDragEnd ind', ind)

            //row
            let row = get(param, 'node.data', null)

            //rows
            let rows = vo.getNowData()
            // console.log('agRowDragEnd rows', cloneDeep(rows))

            //rowDragEnd
            vo.rowDragEnd(vo.iRowDragEnter, ind, row, rows)

            //triggerRowDragChange
            vo.triggerRowDragChange(vo.iRowDragEnter, ind, row, rows)

        },

        agRowDragMove: function(param) {
            // console.log('methods agRowDragMove', param)

            let vo = this

            //ind
            let ind = get(param, 'node.rowIndex', '')
            // console.log('agRowDragMove ind', ind)

            //row
            let row = get(param, 'node.data', null)

            // //rows
            // let rows = vo.getNowData()
            // // console.log('agRowDragMove rows', cloneDeep(rows))

            //rowDragMove
            vo.rowDragMove(vo.iRowDragEnter, ind, row)

        },

        agRowDragLeave: function(param) {
            // console.log('methods agRowDragLeave', param)

            //先move再leave至表格外, 拖曳排序依然有效, 但僅觸發DragLeave不觸發DragEnd, 得聯合處理

            let vo = this

            //ind
            let ind = get(param, 'node.rowIndex', '')
            // console.log('agRowDragLeave ind', ind)

            //row
            let row = get(param, 'node.data', null)

            //rows
            let rows = vo.getNowData()
            // console.log('agRowDragLeave rows', cloneDeep(rows))

            //rowDragLeave
            vo.rowDragLeave(vo.iRowDragEnter, ind, row, rows)

            //triggerRowDragChange
            vo.triggerRowDragChange(vo.iRowDragEnter, ind, row, rows)

        },

        agRowSelect: function(params) {
            // console.log('agRowSelect', params)

            let vo = this

            //rn
            let rn = params.api.getSelectedNodes() //params.api已是vo.getApi()

            //rs
            let rs = map(rn, (r) => {
                return {
                    rowInd: cint(r.id),
                    rowIndShow: r.rowIndex,
                    data: r.data,
                }
            })

            //rowChecked
            vo.rowChecked(cloneDeep(rs))

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
            // console.log('methods agCellChange', param)

            let vo = this

            //check值變化
            if (param.oldValue !== param.newValue) {
                //值變化因為記憶體同址vo.rows會出現變更, 故使用vo.rows

                //refresh
                vo.refresh()

                //cellChange
                vo.cellChange(param.colDef.field, param.data, vo.rows)

                //rowChange
                vo.rowChange(param.colDef.field, param.data, vo.rows)

                //rowsChange, 因為記憶體同址vo.rows會出現變更, 故直接用於回傳函數
                vo.rowsChange(vo.rows)

                //setRowsPinnBottom
                vo.setRowsPinnBottom(vo.rows)

            }

        },

        agFilterChanged: function(params) {
            // console.log('methods agFilterChanged', params)

            let vo = this

            //triggerFilterChange
            vo.triggerFilterChange('heads')

        },

        agReady: function(params) {
            //console.log('methods agReady', params)

            let vo = this

            //ag
            vo.ag = params

            if (vo.autoFitColumn) {

                //fitColumns
                vo.fitColumns(false)

            }

            //setRowsPinnTop
            vo.setRowsPinnTop(vo.rows)

            //setRowsPinnBottom
            vo.setRowsPinnBottom(vo.rows)

            //show
            vo.opacity = 1

        },

        leaveTable: function() {
            //console.log('methods leaveTable')

            let vo = this

            //emitCellMouseLeaves
            vo.emitCellMouseLeaves()

            //emitRowMouseLeaves
            vo.emitRowMouseLeaves()

            //clear
            vo.vRowMouseEnter = null
            vo.vRowMouseLeave = null
            vo.vCellMouseEnter = null
            vo.vCellMouseLeave = null

        },

        emitCellMouseLeaves: function() {
            //console.log('methods emitCellMouseLeaves')

            let vo = this

            //cellMouseLeave
            each(vo.eCellMouseLeaves, (v) => {
                vo.cellMouseLeave(cloneDeep(v.field), cloneDeep(v.data))
                //console.log('cellMouseLeave', cloneDeep(v.field), cloneDeep(v.data))
            })

            //clear
            vo.eCellMouseLeaves = []

        },

        emitRowMouseLeaves: function() {
            //console.log('methods emitRowMouseLeaves')

            let vo = this

            //rowMouseLeave
            each(vo.eRowMouseLeaves, (v) => {
                vo.rowMouseLeave(cloneDeep(v.field), cloneDeep(v.data))
                //console.log('rowMouseLeave', cloneDeep(v.field), cloneDeep(v.data))
            })

            //clear
            vo.eRowMouseLeaves = []

        },

        agCellMouseEnter: function(param) {
            //console.log('methods agCellMouseEnter', param)

            let vo = this

            //tvCellMouseEnter, tvRowMouseEnter
            let tvCellMouseEnter = {
                field: param.colDef.field,
                data: param.data,
            }
            let tvRowMouseEnter = {
                data: param.data, //紀錄資料只會比對data, data不一樣才觸發
            }

            //cellMouseEnter
            if (!isEqual(vo.vCellMouseEnter, tvCellMouseEnter)) {

                //emitCellMouseLeaves, 要觸發enter前先觸發leave, 避免cell leave偵測失效或過慢導致連發
                vo.emitCellMouseLeaves()

                //field, data
                let field = cloneDeep(param.colDef.field)
                let data = cloneDeep(param.data)

                //update vCellMouseEnter
                vo.vCellMouseEnter = tvCellMouseEnter

                //cellMouseEnter
                vo.cellMouseEnter(field, data)

                //push, 儲存需離開事件資訊
                vo.eCellMouseLeaves.push({
                    field,
                    data,
                })

            }

            //rowMouseEnter
            if (!isEqual(vo.vRowMouseEnter, tvRowMouseEnter)) {

                //emitRowMouseLeaves, 要觸發enter前先觸發leave, 避免row leave偵測失效或過慢導致連發
                vo.emitRowMouseLeaves()

                //field, data
                let field = cloneDeep(param.colDef.field)
                let data = cloneDeep(param.data)

                //update vRowMouseEnter
                vo.vRowMouseEnter = tvRowMouseEnter

                //rowMouseEnter
                vo.rowMouseEnter(field, data) //滑鼠最初移入的欄位依然作為資料emit出去

                //push, 儲存需離開事件資訊
                vo.eRowMouseLeaves.push({
                    field,
                    data,
                })

                //update vRowMouseLeave, 因一進列可能在同列儲存格間移動, 故需先儲存更新列數據, 若移動到相鄰儲存格時, 則可判斷因數據相同故不用觸發rowLeave
                vo.vRowMouseLeave = {
                    data: cloneDeep(param.data),
                }

            }

        },

        agCellMouseLeave: function(param) {
            //console.log('methods agCellMouseLeave', param)

            let vo = this

            //check
            if (param.event.target.contains(param.event.relatedTarget)) { //離開元素包含進入元素時則跳出, 因可能為父元素進入內元素而觸發
                //console.log('進入元素包含離開元素時則跳出')
                return
            }

            //role
            let role = null
            try {
                role = param.event.target.getAttribute('role') //離開元素的role
            }
            catch (err) {
                //console.log(err)
            }

            //check
            if (role !== 'gridcell') { //離開元素的role不是gridcell則跳出, 因有可能是cell內元素觸發
                //console.log('離開元素的role不是gridcell則跳出', param.event.target)
                return
            }

            //tvCellMouseLeave
            let tvCellMouseLeave = {
                field: cloneDeep(param.colDef.field),
                data: cloneDeep(param.data),
            }

            //tvRowMouseLeave
            let tvRowMouseLeave = {
                data: cloneDeep(param.data),
            }

            //emitCellMouseLeaves
            if (!isEqual(vo.vCellMouseLeave, tvCellMouseLeave)) {
                vo.vCellMouseLeave = tvCellMouseLeave
                vo.emitCellMouseLeaves()
            }

            //emitRowMouseLeaves
            if (!isEqual(vo.vRowMouseLeave, tvRowMouseLeave)) {
                vo.vRowMouseLeave = tvRowMouseLeave
                vo.emitRowMouseLeaves()
            }

        },

        agCellKeyDown: function(param) {
            //console.log('methods agCellKeyDown', param)

            let vo = this

            //check, 由剪貼簿貼上
            if (!(param.event.ctrlKey && param.event.code === 'KeyV')) {
                return
            }
            //console.log('param', param)

            //showRowIndNow
            let showRowIndNow = param.rowIndex
            // console.log('showRowIndNow', showRowIndNow)

            //showColKeyNow
            let showColKeyNow = param.column.colId
            // console.log('showColKeyNow', showColKeyNow)

            //stopEditing, 停止cell的編輯狀態
            vo.getApi().stopEditing()

            //pasteText
            vo.pasteText(vo.dataPasted, showRowIndNow, showColKeyNow)

        },

        pasteText: function(text, showRowIndNow = null, showColKeyNow = null) {
            // console.log('methods pasteText', text, showRowIndNow, showColKeyNow)

            let vo = this

            //mShowRowInds
            let mShowRowInds = []
            let mData = []
            vo.getApi().forEachNodeAfterFilterAndSort(function(node, k) {
                //console.log('node', node)
                mShowRowInds.push(node.id)
                mData.push(node.data)
            })
            // console.log('mShowRowInds', mShowRowInds)
            // console.log('mData', mData)

            //check
            if (size(mShowRowInds) === 0) {
                //console.log('無有效之當前顯示數據')
                return
            }

            //mShowColKeys
            // let mShowColKeys = vo.gridOptions.columnApi.getAllGridColumns()
            let mShowColKeys = vo.getApi().getAllGridColumns() //gridOptions.columnApi已歸入api, 並須通過ref取得
            mShowColKeys = map(mShowColKeys, (v, k) => {
                // console.log('v', v, v.getId)
                return v.getId()
            })
            // console.log('mShowColKeys', mShowColKeys)

            //check
            if (size(mShowColKeys) === 0) {
                //console.log('無有效之當前顯示數據')
                return
            }

            //cs
            // let cs = vo.gridOptions.columnApi.getColumnState()
            let cs = vo.getApi().getColumnState() //gridOptions.columnApi已歸入api, 並須通過ref取得
            // console.log('cs', cs)

            //kpHide, kpPinned
            let kpHide = {}
            let kpPinned = {}
            each(cs, (v) => {
                kpHide[v.colId] = v.hide
                kpPinned[v.colId] = v.pinned !== null
            })
            //console.log('kpHide', kpHide)
            //console.log('kpPinned', kpPinned)

            //check
            if (kpHide[showColKeyNow]) {
                //console.log('貼於禁止編輯的儲存格, 強制取消')
                return
            }

            //pasteOnPinned
            let pasteOnPinned = null
            if (kpPinned[showColKeyNow]) {
                pasteOnPinned = showColKeyNow
            }
            //console.log('pasteOnPinned', pasteOnPinned)

            //kpEditable
            // let cd = vo.gridOptions.columnDefs
            let cd = vo.getApi().getColumnDefs() //gridOptions.columnDefs已歸入api, 並須通過ref取得
            // console.log('cd', cd)
            let kpEditable = {}
            each(cd, (v) => {
                kpEditable[v.field] = v.editable
            })
            //console.log('kpEditable', kpEditable)

            //dataPaste
            let dataPaste = parseText(text)
            //console.log('dataPaste', dataPaste)

            //default
            if (showRowIndNow === null) {
                showRowIndNow = 0
            }
            if (showColKeyNow === null) {
                showColKeyNow = mShowColKeys[0]
            }

            //pasteRowMax, pasteColMax
            let pasteRowMax = null
            let pasteColMax = null
            try {
                pasteRowMax = size(dataPaste)
            }
            catch (err) {
                //console.log('無法計算貼上數據列的總量', err)
                return
            }
            try {
                pasteColMax = size(dataPaste[0])
            }
            catch (err) {
                //console.log('無法計算貼上數據行的總量', err)
                return
            }

            //paste
            let i = -1
            // let rowsTemp = cloneDeep(vo.rows)
            let rows = vo.rows //記憶體得用原始記憶體, 否則applyTransaction會無法找到原始數據物件進行更新
            let updateRows = []
            for (let ii = 0; ii < size(mShowColKeys); ii++) {
                let v = mShowColKeys[ii]
                //console.log('v', v)

                //check
                if (kpHide[v]) {
                    continue //數據貼到隱藏欄位故跳過
                }

                //check
                if (pasteOnPinned) { //貼於固定欄位時
                    if (kpPinned[v]) {
                        if (pasteOnPinned === v) { //v !== pasteOnPinned
                            //console.log('已貼到固定欄位')
                            pasteOnPinned = true //已貼到固定欄位, 強制修改為true
                        }
                        else if (pasteOnPinned === true) {
                            //console.log('已貼過固定欄位, 允許貼至其他固定欄位')
                        }
                        else {
                            //console.log('雖然是貼到固定欄位, 但尚未貼到原本固定欄位, 強制取消')
                            continue
                        }
                    }
                    else {
                        //console.log('貼於固定欄位時, 數據只允許貼到該固定欄位上', pasteOnPinned, v)
                        continue //貼於固定欄位時, 數據只允許貼到該固定欄位上
                    }
                }
                else { //不是貼於固定欄位時
                    if (kpPinned[v]) {
                        //console.log('不是貼於固定欄位時, 數據貼到固定欄位則跳過', pasteOnPinned, v, kpPinned[v])
                        continue //不是貼於固定欄位時, 數據貼到固定欄位則跳過
                    }
                }

                //add i
                if (v === showColKeyNow) {
                    i = 0
                }
                else if (i >= 0) { //當出現>=0就代表已經找到showColKey
                    i += 1
                }

                //modify data
                if (i >= 0 && i < pasteColMax) {
                    let pasteColInd = i
                    let trueColKey = v
                    // console.log('pasteColInd', pasteColInd, 'trueColKey', trueColKey)

                    //check
                    if (!kpEditable[trueColKey]) {
                        continue //禁止編輯欄位故跳過, i的增加還是得照常處理, 也就是只有不能編輯欄位的數據不變更
                    }

                    for (let j = 0; j < pasteRowMax; j++) {
                        let pasteRowInd = j
                        if (showRowIndNow + j < size(mShowRowInds)) {
                            let trueRowInd = mShowRowInds[showRowIndNow + j]
                            // console.log('pasteRowInd', pasteRowInd, 'trueRowInd', trueRowInd)

                            // //pasteValue
                            // let pasteValue = dataPaste[pasteRowInd][pasteColInd]
                            // console.log('pasteValue', pasteValue)

                            // //trueValue
                            // let trueValue = rowsTemp[trueRowInd][trueColKey]
                            // console.log('trueValue', trueValue)

                            //save
                            rows[trueRowInd][trueColKey] = dataPaste[pasteRowInd][pasteColInd]

                            //push, 只紀錄需變更的rows
                            updateRows.push(rows[trueRowInd])

                        }

                    }
                }

            }

            //applyTransaction, 只變更必要資料加速, 注意記憶體得用原始記憶體, 也就是updateRows得使用原始vo.rows來給予欲變更之rows, 否則applyTransaction會無法找到原始數據物件進行更新
            vo.getApi().applyTransaction({ update: updateRows })
            // console.log('applyTransaction', cloneDeep(updateRows))

            //需使用set強制更新外部opt物件的rows並再同步更新至內部rows, 否則外面數據會沒更動
            set(vo, `opt.rows`, rows)

            //rowsChange, rows是內部已更新數據, 直接用於回傳函數
            vo.rowsChange(rows)

        },

        refresh: async function() {
            //console.log('methods refresh')

            let vo = this

            //delay
            await delay(1)

            //redrawRows, 因資料變更不會觸發getRowStyle, 給自行redrawRows
            //可能因使用者切換組件被destroy, 故需try catch
            try {
                vo.getApi().redrawRows()
            }
            catch (err) {
                //console.log(err)
            }

        },

        keys2columns: function(keys) {
            //console.log('methods keys2columns')

            let vo = this

            //cs
            let cs = map(keys, function(key) {
                let o = {}

                //key
                o.field = key

                //text
                o.headerName = vo.kpHead[key]

                //sort
                o.sortable = vo.kpHeadSort[key]

                //comparator
                let funHeadSortMethod = vo.kpHeadSortMethod[key]
                if (isfun(funHeadSortMethod)) {
                    o.comparator = funHeadSortMethod
                }
                else if (funHeadSortMethod === 'auto') {
                    o.comparator = function(valueA, valueB, nodeA, nodeB, isInverted) {

                        //若值無效
                        let sA = iser(valueA)
                        let sB = iser(valueB)
                        if (sA && sB) {
                            return 0
                        }
                        if (sA) {
                            return -1
                        }
                        if (sB) {
                            return 1
                        }

                        //若值為數字
                        if (isnum(valueA) && isnum(valueB)) {
                            return cdbl(valueA) - cdbl(valueB)
                        }

                        //若值為字串, 先比長度越小越前面, 長度相同則用localeCompare比較
                        if (isestr(valueA) && isestr(valueB)) {
                            let lenA = size(valueA)
                            let lenB = size(valueB)
                            if (lenA !== lenB) {
                                return lenA - lenB
                            }
                            else {
                                return valueA.localeCompare(valueB)
                            }
                        }

                        return 0 //不比較
                    }
                }

                //filter, 欄位標題右邊的選單按鈕, 可使用數字過濾器'agNumberColumnFilter'或文字過濾器'agTextColumnFilter'
                if (vo.kpHeadFilter[key]) {
                    let t = vo.kpHeadFilterType[key]
                    if (t === 'text') {
                        o.filter = 'agTextColumnFilter'
                    }
                    else if (t === 'time') {
                        o.filter = 'agDateColumnFilter'
                    }
                    else if (t === 'set') {
                        o.filter = 'agSetColumnFilter'
                    }
                    else { //其他皆為num
                        o.filter = 'agNumberColumnFilter'
                    }
                }
                else {
                    o.filter = false
                }

                //floatingFilter, 欄位標題下方的文字過濾輸入區, 因ag-grid 23.1.0已改為由column給予floatingFilter, 若全部column都false, 則標題下方查詢區就會自動清除騰出空間
                o.floatingFilter = vo.kpHeadFilter[key]

                //suppressMenu
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
                //filter plus, 欄位標題下方加入文字過濾輸入框
                // o.floatingFilterComponentParams = { suppressFilterButton: true }
                o.suppressFloatingFilterButton = true //關閉文字過濾輸入框右邊按鈕, 需suppressFloatingFilterButton=true, 因ag-grid 31.1.0已廢棄floatingFilterComponentParams.suppressFilterButton, 須改用suppressFloatingFilterButton

                //lockPosition, 若不拖曳而設定欄位lockPosition為true時, 該欄位會強制置左, 故不使用
                //o.lockPosition = !vo.kpHeadDrag[key]

                //suppressMovable, 指定欄位不能拖曳, 但會被其他欄位拖曳而改變位置
                o.suppressMovable = !vo.kpHeadDrag[key]

                //resizable
                o.resizable = true

                //editable
                o.editable = vo.kpCellEditable[key]

                //row selection
                if (vo.kpHeadCheckBox[key]) {
                    o.headerCheckboxSelection = true
                    o.headerCheckboxSelectionFilteredOnly = true //若有使用過濾filter, 點header的全選全取消核選方塊時, 僅針對過濾的rows來操作
                    o.checkboxSelection = true
                }

                //cell highlight when focused
                if (!vo.kpHeadFocusHighlight[key]) {
                    o.cellClass = 'no-border'
                }

                //flex
                // o.flex = 1

                //funHeadTooltip
                let funHeadTooltip = vo.kpHeadTooltip[key]

                //header onmouseenter
                let headerMouseenter = ''
                if (isfun(funHeadTooltip)) {

                    //tooltip
                    let t = funHeadTooltip(vo.kpHead[key], key)

                    //cstr
                    t = cstr(t)

                    //kmsg
                    let kmsg = str2md5(t)

                    //add dtmsg
                    dtmsg[kmsg] = t

                    //onmouseenter
                    headerMouseenter = `onmouseenter="ttWAgGridVue(this,'${kmsg}')"`

                }

                //text-align
                let cTextAlign = vo.kpHeadAlignH[key]

                //justify-content
                let kpTA2JC = {
                    'left': 'flex-start',
                    'center': 'center',
                    'right': 'flex-end',
                }
                let cJustifyContent = kpTA2JC[cTextAlign]

                //headTemplate, 基於ref=eText來尋覓與給予head字串, 但會限於純文字而不能給予html
                let headTemplate = `
                    <div class="ag-cell-label-container" role="presentation"" ${headerMouseenter}>
                        <span ref="eMenu" class="ag-header-icon ag-header-cell-menu-button"></span>
                        <div ref="eLabel" class="ag-header-cell-label" style="justify-content:${cJustifyContent};" role="presentation">
                            <span ref="eText" class="ag-header-cell-text" role="columnheader"></span>
                            <span ref="eSortOrder" class="ag-header-icon ag-sort-order ag-hidden" ></span>
                            <span ref="eSortAsc" class="ag-header-icon ag-sort-ascending-icon ag-hidden" ></span>
                            <span ref="eSortDesc" class="ag-header-icon ag-sort-descending-icon ag-hidden" ></span>
                            <span ref="eSortMixed" class="ag-header-icon ag-sort-mixed-icon ag-hidden"></span>
                            <span ref="eSortNone" class="ag-header-icon ag-sort-none-icon ag-hidden" ></span>
                            <span ref="eFilter" class="ag-header-icon ag-filter-icon"></span>
                        </div>
                    </div>
                `

                //kpHeadRender
                if (iseobj(vo.kpHeadRender)) {
                    let head = o.headerName
                    if (haskey(vo.kpHeadRender, key)) {
                        let funRender = vo.kpHeadRender[key]
                        if (isfun(funRender)) {
                            head = funRender(o.headerName, key, keys)
                        }
                    }
                    headTemplate = `
                        <div class="ag-cell-label-container" role="presentation"" ${headerMouseenter}>
                            <span ref="eMenu" class="ag-header-icon ag-header-cell-menu-button"></span>
                            <div ref="eLabel" class="ag-header-cell-label" style="justify-content:${cJustifyContent};" role="presentation">
                                <span class="ag-header-cell-text" role="columnheader">${head}</span>
                                <span ref="eSortOrder" class="ag-header-icon ag-sort-order" ></span>
                                <span ref="eSortAsc" class="ag-header-icon ag-sort-ascending-icon" ></span>
                                <span ref="eSortDesc" class="ag-header-icon ag-sort-descending-icon" ></span>
                                <span ref="eSortNone" class="ag-header-icon ag-sort-none-icon" ></span>
                                <span ref="eFilter" class="ag-header-icon ag-filter-icon"></span>
                            </div>
                        </div>
                    `
                }

                //複寫header template
                o.headerComponentParams = {
                    template: headTemplate,
                }

                //funColSpan
                let funColSpan = vo.kpColSpan[key]

                //colSpan
                if (isfun(funColSpan)) {
                    o.colSpan = function(params) {
                        // console.log('colSpan', params)

                        //row
                        let row = get(params, 'data', {})

                        //value
                        let value = get(row, key)

                        //funColSpan
                        let i = funColSpan(value, key, row, params)

                        //check
                        if (!isnum(i)) {
                            i = 1
                        }

                        //cint
                        i = cint(i)

                        //check
                        if (i < 1) {
                            i = 1
                        }

                        return i
                    }
                }

                //funCellTooltip
                let funCellTooltip = vo.kpCellTooltip[key]

                //funCellRender
                let funCellRender = vo.kpCellRender[key]

                //cellRenderer
                o.cellRenderer = function(params) {
                    //console.log('cellRenderer', params)

                    //待加入於編輯cell後可顯示編輯後值的tooltip
                    // console.log('trueRowId', params.node.id, 'trueColKey', params.column.colId)

                    //funCellTooltip
                    if (isfun(funCellTooltip)) {

                        //tooltip
                        let t = funCellTooltip(params.value, params.colDef.field, cloneDeep(params.data))

                        //cstr
                        t = cstr(t)

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
                        h = funCellRender(params.value, params.colDef.field, cloneDeep(params.data))
                    }

                    return h
                }

                //cellStyle
                let cellStyle = {
                    'text-align': vo.kpCellAlignH[key] //add align
                }
                let funColStyle = vo.kpColStyle[key]
                if (isfun(funColStyle)) {
                    cellStyle = merge(cellStyle, funColStyle()) //add col style
                }
                o.cellStyle = cellStyle

                //fix
                if (isbol(vo.kpHeadFixLeft[key])) {

                    //pinned
                    o.pinned = vo.kpHeadFixLeft[key] ? 'left' : ''

                    // //suppressSizeToFit, true代表禁止欄位被sizeColumnsToFit, 因有pinned也需能resize與自動調整寬度, 故取消此功能
                    // if (vo.kpHeadFixLeft[key]) {
                    //     o.suppressSizeToFit = true
                    // }

                }

                //width, 內容物超過width不會自動撐開
                if (isnum(vo.kpHeadWidth[key])) {
                    let w = cdbl(vo.kpHeadWidth[key])
                    o.width = w
                }

                //minWidth, ag-grid設定minWidth還是會自動被處理調整成寬度, 例如minWidth給150, 實際會依照內容長度轉成width如200, 而內容物超過轉換後的width不會自動撐開
                if (isnum(vo.defHeadMinWidth)) {
                    o.minWidth = vo.defHeadMinWidth
                }

                //maxWidth
                if (isnum(vo.defHeadMaxWidth)) {
                    o.maxWidth = vo.defHeadMaxWidth
                }

                //rowDrag
                let rowDrag = false //default
                if (isbol(vo.kpRowDrag[key])) {
                    rowDrag = vo.kpRowDrag[key]
                }
                o.rowDrag = rowDrag

                //hide
                let hide = false //default
                if (isbol(vo.kpHeadHide[key])) {
                    hide = vo.kpHeadHide[key]
                }
                o.hide = hide

                return o
            })

            return cs
        },

        changeOpt: function() {
            //console.log('methods changeOpt')

            let vo = this

            //check
            if (!iseobj(vo.opt)) {
                return
            }

            //check keys
            let tKeys = get(vo, 'opt.keys')
            if (!isearr(tKeys)) {
                console.log('invalid opt.keys')
                return
            }

            //check rows
            let tRows = get(vo, 'opt.rows')
            if (!isarr(tRows)) {
                console.log('invalid opt.rows')
                return
            }

            //setobj
            function setobj(keys, def, kpobj) {
                let o = {}
                each(keys, function(key) {
                    let h = def(key)
                    if (isobj(kpobj)) {
                        if (haskey(kpobj, key)) {
                            h = kpobj[key]
                        }
                    }
                    o[key] = h
                })
                return o
            }

            //autoFitColumn, ag-grid僅有
            let autoFitColumn = false
            if (isbol(vo.opt.autoFitColumn)) {
                autoFitColumn = vo.opt.autoFitColumn
            }
            vo.autoFitColumn = autoFitColumn

            //keys
            vo.keys = vo.opt.keys

            //kpHead
            vo.kpHead = setobj(vo.keys,
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

            //defHeadAlignH
            vo.defHeadAlignH = 'center'
            if (arrHas(vo.opt.defHeadAlignH, ['left', 'center', 'right'])) {
                vo.defHeadAlignH = vo.opt.defHeadAlignH
            }

            //kpHeadAlignH
            vo.kpHeadAlignH = setobj(vo.keys,
                function(key) {
                    return vo.defHeadAlignH
                },
                vo.opt.kpHeadAlignH
            )

            //defHeadSort
            vo.defHeadSort = true
            if (isbol(vo.opt.defHeadSort)) {
                vo.defHeadSort = vo.opt.defHeadSort
            }

            //kpHeadSort
            vo.kpHeadSort = setobj(vo.keys,
                function(key) {
                    return vo.defHeadSort
                },
                vo.opt.kpHeadSort
            )

            //defHeadSortMethod
            vo.defHeadSortMethod = null
            if (isfun(vo.opt.defHeadSortMethod) || isestr(vo.opt.defHeadSortMethod)) {
                vo.defHeadSortMethod = vo.opt.defHeadSortMethod
            }

            //kpHeadSortMethod
            vo.kpHeadSortMethod = setobj(vo.keys,
                function(key) {
                    return vo.defHeadSortMethod
                },
                vo.opt.kpHeadSortMethod
            )

            //kpHeadFixLeft
            vo.kpHeadFixLeft = {}
            if (iseobj(vo.opt.kpHeadFixLeft)) {
                vo.kpHeadFixLeft = vo.opt.kpHeadFixLeft
            }

            //defHeadFilter
            vo.defHeadFilter = true
            if (isbol(vo.opt.defHeadFilter)) {
                vo.defHeadFilter = vo.opt.defHeadFilter
            }

            //kpHeadFilter
            vo.kpHeadFilter = setobj(vo.keys,
                function(key) {
                    return vo.defHeadFilter
                },
                vo.opt.kpHeadFilter
            )

            //defHeadFilterType
            vo.defHeadFilterType = 'num'
            if (arrHas(vo.opt.defHeadFilterType, ['num', 'text', 'time', 'set'])) {
                vo.defHeadFilterType = vo.opt.defHeadFilterType
            }

            //kpHeadFilterType
            vo.kpHeadFilterType = setobj(vo.keys,
                function(key) {
                    return vo.defHeadFilterType
                },
                vo.opt.kpHeadFilterType
            )

            //kpHeadRender
            vo.kpHeadRender = {}
            if (iseobj(vo.opt.kpHeadRender)) {
                vo.kpHeadRender = vo.opt.kpHeadRender
            }

            //defHeadDrag
            vo.defHeadDrag = true
            if (isbol(vo.opt.defHeadDrag)) {
                vo.defHeadDrag = vo.opt.defHeadDrag
            }

            //kpHeadDrag
            vo.kpHeadDrag = setobj(vo.keys,
                function(key) {
                    return vo.defHeadDrag
                },
                vo.opt.kpHeadDrag
            )

            //kpHeadCheckBox
            vo.kpHeadCheckBox = setobj(vo.keys,
                function(key) {
                    return false //每個col皆預設false
                },
                vo.opt.kpHeadCheckBox
            )

            //kpHeadFocusHighlight
            vo.kpHeadFocusHighlight = setobj(vo.keys,
                function(key) {
                    return true //每個col皆預設true
                },
                vo.opt.kpHeadFocusHighlight
            )

            //kpHeadHide
            vo.kpHeadHide = {}
            if (iseobj(vo.opt.kpHeadHide)) {
                vo.kpHeadHide = vo.opt.kpHeadHide
            }

            //kpRowStyle
            vo.kpRowStyle = {}
            if (iseobj(vo.opt.kpRowStyle)) {
                vo.kpRowStyle = vo.opt.kpRowStyle
            }

            //kpRowDrag
            vo.kpRowDrag = {}
            if (iseobj(vo.opt.kpRowDrag)) {
                vo.kpRowDrag = vo.opt.kpRowDrag
            }

            //genRowsPinnTop
            vo.genRowsPinnTop = null
            if (isfun(vo.opt.genRowsPinnTop)) {
                vo.genRowsPinnTop = vo.opt.genRowsPinnTop
            }

            //genRowsPinnBottom
            vo.genRowsPinnBottom = null
            if (isfun(vo.opt.genRowsPinnBottom)) {
                vo.genRowsPinnBottom = vo.opt.genRowsPinnBottom
            }

            //kpColStyle
            vo.kpColStyle = {}
            if (iseobj(vo.opt.kpColStyle)) {
                vo.kpColStyle = vo.opt.kpColStyle
            }

            //kpColSpan
            vo.kpColSpan = {}
            if (iseobj(vo.opt.kpColSpan)) {
                vo.kpColSpan = vo.opt.kpColSpan
            }

            //defHeadMinWidth
            vo.defHeadMinWidth = null
            if (isnum(vo.opt.defHeadMinWidth)) {
                vo.defHeadMinWidth = vo.opt.defHeadMinWidth
            }

            //defHeadMaxWidth
            vo.defHeadMaxWidth = null
            if (isnum(vo.opt.defHeadMaxWidth)) {
                vo.defHeadMaxWidth = vo.opt.defHeadMaxWidth
            }

            //kpHeadWidth
            vo.kpHeadWidth = {}
            if (iseobj(vo.opt.kpHeadWidth)) {
                vo.kpHeadWidth = vo.opt.kpHeadWidth
            }

            //kpCellRender
            vo.kpCellRender = {}
            if (iseobj(vo.opt.kpCellRender)) {
                vo.kpCellRender = vo.opt.kpCellRender
            }

            //kpCellTooltip
            vo.kpCellTooltip = {}
            if (iseobj(vo.opt.kpCellTooltip)) {
                vo.kpCellTooltip = vo.opt.kpCellTooltip
            }

            //defCellAlignH
            vo.defCellAlignH = 'center'
            if (arrHas(vo.opt.defCellAlignH, ['left', 'center', 'right'])) {
                vo.defCellAlignH = vo.opt.defCellAlignH
            }

            //kpCellAlignH
            vo.kpCellAlignH = setobj(vo.keys,
                function(key) {
                    return vo.defCellAlignH
                },
                vo.opt.kpCellAlignH
            )

            //defCellEditable
            vo.defCellEditable = false
            if (isbol(vo.opt.defCellEditable)) {
                vo.defCellEditable = vo.opt.defCellEditable
            }

            //kpCellEditable
            vo.kpCellEditable = setobj(vo.keys,
                function(key) {
                    return vo.defCellEditable
                },
                vo.opt.kpCellEditable
            )

            //tableClickEnable
            vo.tableClickEnable = false

            //rowsChange
            vo.rowsChange = function() {}
            if (isfun(vo.opt.rowsChange)) {
                vo.rowsChange = vo.opt.rowsChange
            }

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

            //rowChecked
            vo.rowChecked = function() {}
            if (isfun(vo.opt.rowChecked)) {
                vo.rowChecked = vo.opt.rowChecked
            }

            //rowMouseEnter
            vo.rowMouseEnter = function() {}
            if (isfun(vo.opt.rowMouseEnter)) {
                vo.rowMouseEnter = vo.opt.rowMouseEnter
            }

            //rowMouseLeave
            vo.rowMouseLeave = function() {}
            if (isfun(vo.opt.rowMouseLeave)) {
                vo.rowMouseLeave = vo.opt.rowMouseLeave
            }

            //rowDragEnter
            vo.rowDragEnter = function() {}
            if (isfun(vo.opt.rowDragEnter)) {
                vo.rowDragEnter = vo.opt.rowDragEnter
            }

            //rowDragEnd
            vo.rowDragEnd = function() {}
            if (isfun(vo.opt.rowDragEnd)) {
                vo.rowDragEnd = vo.opt.rowDragEnd
            }

            //rowDragMove
            vo.rowDragMove = function() {}
            if (isfun(vo.opt.rowDragMove)) {
                vo.rowDragMove = vo.opt.rowDragMove
            }

            //rowDragLeave
            vo.rowDragLeave = function() {}
            if (isfun(vo.opt.rowDragLeave)) {
                vo.rowDragLeave = vo.opt.rowDragLeave
            }

            //rowDragChange
            vo.rowDragChange = function() {}
            if (isfun(vo.opt.rowDragChange)) {
                vo.rowDragChange = vo.opt.rowDragChange
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

            //cellMouseEnter
            vo.cellMouseEnter = function() {}
            if (isfun(vo.opt.cellMouseEnter)) {
                vo.cellMouseEnter = vo.opt.cellMouseEnter
            }

            //cellMouseLeave
            vo.cellMouseLeave = function() {}
            if (isfun(vo.opt.cellMouseLeave)) {
                vo.cellMouseLeave = vo.opt.cellMouseLeave
            }

            //filterChange
            vo.filterChange = function() {}
            if (isfun(vo.opt.filterChange)) {
                vo.filterChange = vo.opt.filterChange
            }

            //kpConvertKeysWhenUploadData
            vo.kpConvertKeysWhenUploadData = {}
            if (iseobj(vo.opt.kpConvertKeysWhenUploadData)) {
                vo.kpConvertKeysWhenUploadData = vo.opt.kpConvertKeysWhenUploadData
            }

            //language
            vo.language = 'en' //'en', 'zh-tw', 'zh-cn'
            if (isestr(vo.opt.language)) {
                vo.language = vo.opt.language
            }

            //columns, 需放在給予rows之前, 避免給予rows沒有column設定
            vo.columns = vo.keys2columns(vo.keys)

            //rows
            vo.rows = vo.opt.rows

        },

        setRowsPinnTop: function(rows) {
            // console.log('methods setRowsPinnTop', rows)

            let vo = this

            //check
            if (isfun(vo.genRowsPinnTop)) {

                //pinnedTopRowData
                let pinnedTopRowData = vo.genRowsPinnTop(rows)
                // console.log('pinnedTopRowData', pinnedTopRowData)

                //update
                // vo.getApi().setPinnedTopRowData(pinnedBottomRowData)
                vo.getApi().setGridOption('pinnedTopRowData', pinnedTopRowData) //setPinnedTopRowData已統一改為setGridOption('pinnedTopRowData',newValue)

            }

        },

        setRowsPinnBottom: function(rows) {
            // console.log('methods setRowsPinnBottom', rows)

            let vo = this

            //check
            if (isfun(vo.genRowsPinnBottom)) {

                //pinnedBottomRowData
                let pinnedBottomRowData = vo.genRowsPinnBottom(rows)
                // console.log('pinnedBottomRowData', pinnedBottomRowData)

                //update
                // vo.getApi().setPinnedBottomRowData(pinnedBottomRowData)
                vo.getApi().setGridOption('pinnedBottomRowData', pinnedBottomRowData) //setPinnedBottomRowData已統一改為setGridOption('pinnedBottomRowData',newValue)

            }

        },

        showKeys: function(keys_new) {
            // console.log('methods showKeys', keys_new)

            let vo = this

            //keys_old
            let keys_old = cloneDeep(vo.keys)
            // console.log('keys_old', keys_old)

            //keys_nouse
            let keys_nouse = difference(keys_old, keys_new)
            // console.log('keys_nouse', keys_nouse)

            //cs
            // let cs = vo.gridOptions.columnApi.getColumnState()
            let cs = vo.getApi().getColumnState() //gridOptions.columnApi已歸入api, 並須通過ref取得
            // console.log('cs', cs)

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
            // console.log('csn', csn)

            //applyColumnState
            // vo.gridOptions.columnApi.applyColumnState({
            //     state: csn,
            //     applyOrder: true, //要依照csn調整欄位順序
            // })
            vo.getApi().applyColumnState({ //gridOptions.columnApi已歸入api, 並須通過ref取得
                state: csn,
                applyOrder: true, //要依照csn調整欄位順序
            })

        },

        getFilters: async function() {
            // console.log('methods getFilters')

            let vo = this

            //keys
            let keys = cloneDeep(vo.keys)
            // console.log('keys_old', keys_old)

            //flts
            let flts = []
            await pmSeries(keys, async (key) => {

                //md
                let md = null
                try {

                    //ft
                    // let ft = vo.getApi().getFilterInstance(key)
                    let ft = await vo.getApi().getColumnFilterInstance(key) //ag-grid 31.1.0準備廢棄getFilterInstance, 改用getColumnFilterInstance, 此回傳為promise
                    // console.log(key, 'ft', ft)

                    //md
                    // md = ft.getModel()
                    md = ft.appliedModel //已改用getColumnFilterInstance, 此時直接用appliedModel為model
                    // console.log(key, 'md', md)

                }
                catch (err) {
                    console.log(err)
                }

                //check
                if (iseobj(md)) {

                    //push
                    flts.push(md)

                }

            })

            return flts
        },

        clearHeadFilterAll: async function() {
            //console.log('methods clearHeadFilterAll')

            let vo = this

            //reset all filters
            vo.getApi().setFilterModel(null)

            //fire onFilterChanged
            vo.getApi().onFilterChanged()

        },

        clearHeadFilter: async function(key) {
            //console.log('methods clearHeadFilter', key)

            let vo = this

            //setModel
            // ft.setModel(null)
            await vo.getApi().setColumnFilterModel(key, null) //setModel改為setColumnFilterModel

            //fire onFilterChanged
            vo.getApi().onFilterChanged()

        },

        setHeadFilter: async function(key, value, type = 'contains') {
            //console.log('methods setHeadFilter', key, value, type)

            let vo = this

            // let tpsText = [
            //     'empty',
            //     'equals',
            //     'notEqual',
            //     'lessThan',
            //     'lessThanOrEqual',
            //     'greaterThan',
            //     'greaterThanOrEqual',
            //     'inRange',
            //     'contains',
            //     'notContains',
            //     'startsWith',
            //     'endsWith',
            //     'blank',
            //     'notBlank',
            // ]

            // let tpsNumber = [
            //     'empty',
            //     'equals',
            //     'notEqual',
            //     'lessThan',
            //     'lessThanOrEqual',
            //     'greaterThan',
            //     'greaterThanOrEqual',
            //     'inRange',
            //     'contains',
            //     'notContains',
            //     'startsWith',
            //     'endsWith',
            //     'blank',
            //     'notBlank',
            // ]

            //m
            let m = {
                type,
                // filter: cstr(value), //ag-grid 23版有修改filter判斷式, 其內使用trim故限定value需為字串
                filter: value, //ag-grid 31.1.0已修復
            }

            //setModel
            // ft.setModel(m)
            await vo.getApi().setColumnFilterModel(key, m) //setModel改為setColumnFilterModel

            //fire onFilterChanged
            vo.getApi().onFilterChanged()

        },

        getDisplayDataKeys: function() {
            //console.log('methods getDisplayDataKeys')

            let vo = this

            //cs
            // let cs = vo.gridOptions.columnApi.getColumnState()
            let cs = vo.getApi().getColumnState() //gridOptions.columnApi已歸入api, 並須通過ref取得
            // console.log('cs', cs)

            //show keys
            let keys = map(filter(cs, { 'hide': false }), 'colId')

            return keys
        },

        getDisplayData: function() {
            //console.log('methods getDisplayData')

            let vo = this

            //rs
            let rs = []
            vo.getApi().forEachNodeAfterFilterAndSort((node) => {
                rs.push(cloneDeep(node.data))
            })

            //show keys
            let keys = vo.getDisplayDataKeys()

            //ltdtmapping
            let data = ltdtmapping(rs, keys)

            return data
        },

        getNowData: function() {
            //console.log('methods getNowData')

            let vo = this

            //rs
            let rs = []
            vo.getApi().forEachNode((node) => {
                rs.push(cloneDeep(node.data))
            })

            //ltdtmapping
            let data = ltdtmapping(rs, vo.keys)

            return data
        },

        fitColumns: function(bDebounce = true) {
            // console.log('methods fitColumns', bDebounce)

            let vo = this

            //fit
            async function fit(w) {
                // console.log('call fit', w)
                try {

                    //width
                    vo.width = w

                    // //delay
                    // await delay(30)

                    //api
                    let api = vo.getApi()

                    //sizeColumnsToFit, 有可能於高頻初始化與解構時, 例如切換分頁, 導致可能取不到sizeColumnsToFit
                    let funSizeColumnsToFit = get(api, 'sizeColumnsToFit')
                    if (isfun(funSizeColumnsToFit)) {
                        api.sizeColumnsToFit()
                    }

                }
                catch (err) {
                    console.log('fitColumns error', err)
                }
            }

            //core
            async function core() {
                // console.log('call core')

                //ag-grid 24.1.0已能正常fit至100%, 不會因微小差距而出現水平捲軸, 故關閉先縮小再還原機制, 但縮放第3次時有些欄位header會爆版, 故還是得使用先縮小再還原機制

                // //先微縮小fit
                // await fit(99.5)

                // //delay
                // await delay(30) //不能過短, 否則先縮小再還原機制會失效, header會爆版

                //還原fit, ag-grid 27.3.0已能正常fit至100%
                await fit(100)

            }

            //core
            if (bDebounce) {
                vo.dbc(() => {
                    core()
                })
            }
            else {
                core()
            }

        },

        downloadDisplayData: function(opt = {}) {
            //console.log('methods downloadDisplayData', opt)

            let vo = this

            //spread
            let {
                funGetKeysHook,
                funGetLtdtHook,
                funGetMatHook,
                useHead,
                fileName,
                sheetName,
                pathItems
            } = opt

            //default useHead
            if (!isbol(useHead)) {
                useHead = false
            }

            //default fileName
            if (!isestr(fileName)) {
                fileName = 'data.xlsx'
            }

            //default pathItems
            if (!isearr(pathItems)) {
                pathItems = vo.pathItems
            }

            //show keys
            let keys = vo.getDisplayDataKeys()

            //useKeys
            let useKeys = cloneDeep(keys)
            if (isfun(funGetKeysHook)) {
                useKeys = funGetKeysHook(useKeys)
            }
            if (!isearr(useKeys)) {
                useKeys = cloneDeep(keys)
            }

            //check
            if (!isearr(useKeys)) {
                console.log('invalid useKeys')
                return
            }

            //data, 僅組件顯示資料
            let data = vo.getDisplayData()

            //funGetLtdtHook
            if (isfun(funGetLtdtHook)) {
                data = funGetLtdtHook(data)
            }

            //ltdtkeys2mat
            let mat = ltdtkeys2mat(data, useKeys) //依照funGetKeysHook回傳的keys再次提取數據

            //heads
            let heads = keys
            if (useHead) {
                heads = map(keys, (v) => {
                    return vo.kpHead[v]
                })
            }

            //concat
            mat = concat([heads], mat)

            //funGetMatHook
            if (isfun(funGetMatHook)) {
                mat = funGetMatHook(mat)
            }

            //downloadExcelFileFromDataDyn
            downloadExcelFileFromDataDyn(fileName, sheetName, mat, pathItems)
                .catch((err) => {
                    console.log(err)
                })

            return mat
        },

        downloadData: function(opt = {}) {
            //console.log('methods downloadData', opt)

            let vo = this

            //spread
            let {
                funGetKeysHook,
                funGetLtdtHook,
                funGetMatHook,
                useHead,
                fileName,
                sheetName,
                pathItems
            } = opt

            //default useHead
            if (!isbol(useHead)) {
                useHead = false
            }

            //default fileName
            if (!isestr(fileName)) {
                fileName = 'data.xlsx'
            }

            //default pathItems
            if (!isearr(pathItems)) {
                pathItems = vo.pathItems
            }

            //keys
            let keys = vo.keys

            //useKeys
            let useKeys = cloneDeep(keys)
            if (isfun(funGetKeysHook)) {
                useKeys = funGetKeysHook(useKeys) //依照funGetKeysHook回傳的keys再次提取數據
            }
            if (!isearr(useKeys)) {
                useKeys = cloneDeep(keys)
            }

            //check
            if (!isearr(useKeys)) {
                console.log('invalid useKeys')
                return
            }

            //ltdtmapping
            let data = ltdtmapping(vo.rows, useKeys)

            //funGetLtdtHook
            if (isfun(funGetLtdtHook)) {
                data = funGetLtdtHook(data)
            }

            //ltdtkeys2mat
            let mat = ltdtkeys2mat(data, useKeys)

            //heads
            let heads = useKeys
            if (useHead) {
                heads = map(useKeys, (v) => {
                    return vo.kpHead[v]
                })
            }

            //concat
            mat = concat([heads], mat)

            //funGetMatHook
            if (isfun(funGetMatHook)) {
                mat = funGetMatHook(mat)
            }

            //downloadExcelFileFromDataDyn
            downloadExcelFileFromDataDyn(fileName, sheetName, mat, pathItems)
                .catch((err) => {
                    console.log(err)
                })

            return mat
        },

        uploadData: async function(opt = {}) {
            //console.log('methods uploadData', opt)

            let vo = this

            //params
            let { pathItems = null, beforeUpload = null, parseSheetInd = 0, uploadMode = 'replace' } = opt

            //parseSheetInd
            if (!isp0int(parseSheetInd)) {
                parseSheetInd = 0
            }
            parseSheetInd = cint(parseSheetInd)
            // console.log('parseSheetInd', parseSheetInd)

            //pathItems
            if (!isearr(pathItems)) {
                pathItems = vo.pathItems
            }

            //domShowInputAndGetFilesU8Arrs
            let d = await domShowInputAndGetFilesU8Arrs()
            // console.log('d', d)

            //取第一個檔案
            let file = d[0]

            //getDataFromExcelFileU8ArrDyn
            let r = await getDataFromExcelFileU8ArrDyn(file.u8a, 'ltdt', false, pathItems)

            //sh
            let sh = null
            try {
                sh = r[parseSheetInd] //取第parseSheetInd個sheet
            }
            catch (err) {
                return Promise.reject({
                    msg: 'invalid parseSheetInd',
                    err,
                })
            }
            // console.log('data', sh.data)

            //rows
            let rows = []
            try {
                rows = sh.data
            }
            catch (err) {
                return Promise.reject({
                    msg: 'can not get data from sheet',
                    err,
                })
            }

            //kpConvertKeysWhenUploadData
            if (iseobj(vo.kpConvertKeysWhenUploadData)) {
                rows = map(rows, (row) => {
                    let t = {}
                    each(row, (v, k) => {
                        let rk = k
                        let rv = v
                        if (haskey(vo.kpConvertKeysWhenUploadData, k)) {
                            rk = vo.kpConvertKeysWhenUploadData[k]
                        }
                        t[rk] = rv
                    })
                    return t
                })
            }

            //beforeUpload
            if (isfun(beforeUpload)) {
                let r = beforeUpload(rows)
                if (ispm(r)) {
                    rows = await r
                }
                else {
                    rows = r
                }
            }

            //ltdtmapping
            rows = ltdtmapping(rows, vo.keys)

            //uploadMode
            if (uploadMode === 'replace') {
                // rows=rows
            }
            else if (uploadMode === 'append') {

                //rowsTemp
                let rowsTemp = get(vo, 'opt.rows', [])
                rowsTemp = cloneDeep(rowsTemp)

                //push
                each(rows, (v) => {
                    rowsTemp.push(v)
                })

                //save
                rows = rowsTemp

                // //setTimeout, 變更數據後頁面會先渲染, delay後才能調捲軸, 否則太快執行會被頁面渲染蓋掉
                // setTimeout(() => {

                //     //getGridOptions
                //     let o = vo.getGridOptions()

                //     //ensureIndexVisible, scrollTo(index)
                //     o.api.ensureIndexVisible(size(rowsTemp) - 1, 'bottom') //捲到最下

                // }, 1)

            }

            //需使用set強制更新外部opt物件的rows並再同步更新至內部rows, 否則外面數據會沒更動
            set(vo, `opt.rows`, rows)

            //rowsChange, rows是內部已更新數據, 直接用於回傳函數
            vo.rowsChange(rows)

            return rows
        },

        triggerFilterChange: async function(from) {
            //console.log('methods triggerFilterChange', from)

            let vo = this

            //filterall
            let filterall = vo.filterall

            //flts
            let flts = await vo.getFilters()

            //isFilter
            let isFilter = isestr(filterall) || size(flts) > 0

            //filterChange
            vo.filterChange({
                from,
                filterall,
                flts,
                isFilter,
                // ev,
            })

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
.CompCssWAgGridVue .ag-header-cell .ag-input-field-input, .ag-filter .ag-input-field-input {
    transition: all 0.5s;
    padding: 3px 8px;
    box-shadow: inherit !important;
    background-color: #fff;
    border: 1px solid #ccc;
    border-radius: 5px;
}
.CompCssWAgGridVue .ag-input-field-input:focus {
    border: 1px solid #777;
}
.CompCssWAgGridVue .no-border.ag-cell:focus{
  border-color: transparent !important;
  outline: none;
}
</style>
