<template>
    <div
        ref="shell"
        class="CompCssWAgGridVue"
        :changeParam="changeParam"
    >

        <div
            :style="`width:${width}%; height:${height}px; transition:all 0.5s; opacity:${opacity};`"
            @mouseleave="leaveTable"
        >

            <ag-grid-vue
                style="width:100%; height:100%;"
                class="ag-theme-balham"
                :columnDefs="columns"
                :rowData="filterRows"
                :rowStyle="getRowsStyle"
                :gridOptions="gridOptions"
                _enableRangeSelection="true"
                _copyHeadersToClipboard="true"
                _rowSelection="'multiple'"
                _modules="AllModules"
                @cellClicked="agCellClick"
                @cellDoubleClicked="agCellDbClick"
                @cellValueChanged="agCellChange"
                @cellMouseOver="agCellMouseEnter"
                @cellMouseOut="agCellMouseLeave"
                @grid-ready="onGridReady"

                @cell-key-down="agCellKeyDown"
            ></ag-grid-vue>

        </div>

    </div>
</template>

<script>
import map from 'lodash/map'
import each from 'lodash/each'
import size from 'lodash/size'
import filter from 'lodash/filter'
import isEqual from 'lodash/isEqual'
import find from 'lodash/find'
import merge from 'lodash/merge'
import get from 'lodash/get'
import join from 'lodash/join'
import split from 'lodash/split'
import values from 'lodash/values'
import cloneDeep from 'lodash/cloneDeep'
import difference from 'lodash/difference'
import trim from 'lodash/trim'
import genID from 'wsemi/src/genID.mjs'
import haskey from 'wsemi/src/haskey.mjs'
import arrhas from 'wsemi/src/arrhas.mjs'
import sep from 'wsemi/src/sep.mjs'
import iser from 'wsemi/src/iser.mjs'
import isobj from 'wsemi/src/isobj.mjs'
import iseobj from 'wsemi/src/iseobj.mjs'
import isearr from 'wsemi/src/isearr.mjs'
import isestr from 'wsemi/src/isestr.mjs'
import isnum from 'wsemi/src/isnum.mjs'
import isfun from 'wsemi/src/isfun.mjs'
import isbol from 'wsemi/src/isbol.mjs'
import cdbl from 'wsemi/src/cdbl.mjs'
import cstr from 'wsemi/src/cstr.mjs'
import binstr from 'wsemi/src/binstr.mjs'
import ltdtmapping from 'wsemi/src/ltdtmapping.mjs'
import str2md5 from 'wsemi/src/str2md5.mjs'
import delay from 'wsemi/src/delay.mjs'
import replace from 'wsemi/src/replace.mjs'
import debounce from 'wsemi/src/debounce.mjs'
import domDetect from 'wsemi/src/domDetect.mjs'
import onTooltip from 'wsemi/src/onTooltip.mjs'
import { AgGridVue } from 'ag-grid-vue' //會再引用vue-class-component與vue-property-decorator
import 'ag-grid-community/dist/styles/ag-grid.css'
import 'ag-grid-community/dist/styles/ag-theme-balham.css'
// import { AllModules } from '@ag-grid-enterprise/all-modules' //ag-gird-enterprise雖可使用modules擴充支援剪貼簿貼上excel range數據, 不過由excel複製的數據會有換行字元, 此導致ag-grid解析多一列的空數據而覆蓋到原數據, 無法用


//tooltip, 通過key查msg避免特殊html符號無法顯示
let dtmsg = {}
window.ttWAgGridVue = function(ele, kmsg) {
    let msg = dtmsg[kmsg]
    onTooltip(ele, msg)
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
 * @vue-prop {Object} [opt.kpHead={}] 輸入key對應head物件，預設為keys
 * @vue-prop {Object} [opt.kpHeadTooltip={}] 輸入key對應需tooltip的html字串物件，於各head處滑鼠移入時觸發，預設為{}
 * @vue-prop {String} [opt.defHeadAlighH='center'] 輸入head預設之左右對齊字串，預設為'center'
 * @vue-prop {Object} [opt.kpHeadAlighH={}] 輸入key對應head之左右對齊字串物件，預設為各key值為defHeadAlighH
 * @vue-prop {Boolean} [opt.defHeadSort=true] 輸入head預設之是否允許排序布林值，預設為true
 * @vue-prop {Object} [opt.kpHeadSort={}] 輸入key對應head之是否允許排序物件，預設為各key值為defHeadSort
 * @vue-prop {Function|String} [opt.defHeadSortMethod=null] 輸入head預設之排序方式函數或字串，若需自行定義則給予函數，若需使用內建的自動轉型判斷方式則給予'auto'字串，預設為null
 * @vue-prop {Object} [opt.kpHeadSortMethod={}] 輸入key對應head之排序方式函數或字串，若需自行定義則給予函數，若需使用內建的自動轉型判斷方式則給予'auto'字串，預設為各key值為defHeadSortMethod
 * @vue-prop {Object} [opt.kpHeadFixLeft={}] 輸入key對應head之是否固定於左側物件，預設為各key值為false
 * @vue-prop {Boolean} [opt.defHeadFilter=true] 輸入head預設之是否允許過濾布林值，預設為true
 * @vue-prop {Object} [opt.kpHeadFilter={}] 輸入key對應head之是否允許過濾物件，預設為各key值為defHeadFilter
 * @vue-prop {Boolean} [opt.defHeadDrag=true] 輸入head預設之是否允許拖曳布林值，預設為true
 * @vue-prop {Object} [opt.kpHeadDrag={}] 輸入key對應head之是否允許拖曳物件，預設為各key值為defHeadDrag
 * @vue-prop {Object} [opt.kpRowStyle={}] 輸入key對應row style之物件，可設定key欄之cell值所需對應之row style，預設為{}
 * @vue-prop {Object} [opt.kpRowDrag={}] [專有:ag-grid] 輸入key對應row之是否能拖曳排序物件，預設為各key值為false
 * @vue-prop {Number} [opt.defCellMinWidth=null] 輸入cell預設最小寬度數字，預設為null
 * @vue-prop {Object} [opt.kpCellWidth=null] 輸入key對應cell之寬度物件，預設為各key值為null
 * @vue-prop {Object} [opt.kpCellRender={}] 輸入key對應cell之渲染函數物件，預設為{}
 * @vue-prop {Object} [opt.kpCellTooltip={}] 輸入key對應cell之tooltip的html字串物件，於各cell處滑鼠移入時觸發，預設為{}
 * @vue-prop {String} [opt.defCellAlighH='center'] 輸入cell預設之左右對齊字串，預設為'center'
 * @vue-prop {Object} [opt.kpCellAlighH={}] 輸入key對應cell之左右對齊字串物件，預設為各key值為defCellAlighH
 * @vue-prop {Boolean} [opt.defCellEditable=false] 輸入cell預設之是否可編輯布林值，預設為false
 * @vue-prop {Object} [opt.kpCellEditable={}] 輸入key對應cell之是否可編輯物件，預設為各key值為defCellEditable
 * @vue-prop {Function} [opt.rowClick={}] 輸入row click之觸發事件，預設為function(){}
 * @vue-prop {Function} [opt.rowDbClick={}] 輸入row double click之觸發事件，預設為function(){}
 * @vue-prop {Function} [opt.rowChange={}] 輸入row change之觸發事件，預設為function(){}
 * @vue-prop {Function} [opt.rowMouseEnter={}] 輸入row mouseenter之觸發事件，預設為function(){}
 * @vue-prop {Function} [opt.rowMouseLeave={}] 輸入row mouseleave之觸發事件，預設為function(){}
 * @vue-prop {Function} [opt.cellClick={}] 輸入cell click之觸發事件，預設為function(){}
 * @vue-prop {Function} [opt.cellDbClick={}] 輸入cell double click之觸發事件，預設為function(){}
 * @vue-prop {Function} [opt.cellChange={}] 輸入cell change之觸發事件，預設為function(){}
 * @vue-prop {Function} [opt.cellMouseEnter={}] 輸入cell mouseenter之觸發事件，預設為function(){}
 * @vue-prop {Function} [opt.cellMouseLeave={}] 輸入cell mouseleave之觸發事件，預設為function(){}
 * @vue-prop {Boolean} [opt.autoFitColumn=false] 輸入當表格尺寸變更時自動調整欄寬，預設false
 * @vue-prop {Number} [height=300] 表格高度，單位為px，預設300
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
            mmkey: null,
            de: null,

            evPaste: null,
            dataPasted: '',

            width: 100,
            opacity: 0,

            autoFitColumn: false,

            rows: [],
            keys: [],
            columns: [],

            kpHead: {},
            kpHeadTooltip: {},
            defHeadAlighH: null,
            kpHeadAlighH: {},
            defHeadSort: null,
            kpHeadSort: {},
            defHeadSortMethod: null,
            kpHeadSortMethod: {},
            kpHeadFixLeft: {},
            defHeadFilter: null,
            kpHeadFilter: {},
            defHeadDrag: null,
            kpHeadDrag: {},
            kpHeadHide: {},
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
            rowMouseEnter: function() {},
            rowMouseLeave: function() {},
            rowClick: function() {},
            rowDbClick: function() {},
            cellClick: function() {},
            cellDbClick: function() {},
            cellChange: function() {},
            cellMouseEnter: function() {},
            cellMouseLeave: function() {},

            //因ag-grid只提供mouseout沒有mouseleave, 導致會因為內元素而觸發mouseout, 得通過暫存機制產生mouseleave事件
            vRowMouseEnter: null,
            vRowMouseLeave: null,
            eRowMouseLeaves: [],
            vCellMouseEnter: null,
            vCellMouseLeave: null,
            eCellMouseLeaves: [],

            // AllModules,
            gridOptions: {
                animateRows: true,
                // floatingFilter: true, //ag-grid 23.1已改為由column給予floatingFilter
                rowDragManaged: true,
                singleClickEdit: true, //單點即可變更
                localeText: { noRowsToShow: '無數據' },
                getRowStyle: vo.agGetRowStyle,
            },

            ag: null,

        }
    },
    mounted: function() {

        let vo = this

        //mmkey
        if (vo.mmkey === null) {
            vo.mmkey = genID()
        }

        //監聽dom
        vo.de = domDetect(() => {
            return get(vo, '$refs.shell', null)
        })
        vo.de.on('resize', (s) => {
            //console.log('resize', s)
            if (vo.autoFitColumn) {
                vo.fitColumns()
            }
        })
        vo.de.on('display', (s) => {
            //console.log('display', s)
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

            //opt for trigger
            let opt = vo.opt
            vo.__temp__ = { opt }

            //changeOpt
            vo.changeOpt()

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
                let d = get(params.data, k)
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

            //showRowIndNow , showColKeyNow
            let showRowIndNow = param.rowIndex
            // console.log('showRowIndNow', showRowIndNow)

            //showColKeyNow
            let showColKeyNow = param.column.colId
            // console.log('showColKeyNow', showColKeyNow)

            //pasteText
            vo.pasteText(vo.dataPasted, showRowIndNow, showColKeyNow)

        },

        pasteText: function(text, showRowIndNow = null, showColKeyNow = null) {
            //console.log('methods pasteText', text, showRowIndNow, showColKeyNow)

            let vo = this

            //mShowRowInds
            let mShowRowInds = []
            let mData = []
            vo.gridOptions.api.forEachNodeAfterFilterAndSort(function(node, k) {
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
            let mShowColKeys = vo.gridOptions.columnApi.getAllGridColumns()
            mShowColKeys = map(mShowColKeys, (v, k) => {
                return v.getId()
            })
            //console.log('mShowColKeys', mShowColKeys)

            //check
            if (size(mShowColKeys) === 0) {
                //console.log('無有效之當前顯示數據')
                return
            }

            //kpHide, kpPinned
            let cs = vo.gridOptions.columnApi.getColumnState()
            //console.log('cs', cs)
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
            let cd = vo.gridOptions.columnDefs
            //console.log('cd', cd)
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
            let rowsTemp = cloneDeep(vo.rows)
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
                            rowsTemp[trueRowInd][trueColKey] = dataPaste[pasteRowInd][pasteColInd]

                        }

                    }
                }

            }

            //update
            vo.rows = rowsTemp

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
                console.log('invalid opt.keys')
                return
            }
            if (!isearr(get(vo, 'opt.rows'))) {
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

            //defHeadAlighH
            vo.defHeadAlighH = 'center'
            if (arrhas(vo.opt.defHeadAlighH, ['left', 'center', 'right'])) {
                vo.defHeadAlighH = vo.opt.defHeadAlighH
            }

            //kpHeadAlighH
            vo.kpHeadAlighH = setobj(vo.keys,
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
            vo.kpHeadFixLeft = setobj(vo.keys,
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
                function(key) {
                    return vo.defHeadFilter
                },
                vo.opt.kpHeadFilter
            )

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

            //kpHeadHide
            vo.kpHeadHide = setobj(vo.keys,
                function(key) {
                    return false //預設false
                },
                vo.opt.kpHeadHide
            )

            //kpRowStyle
            vo.kpRowStyle = {}
            if (isobj(vo.opt.kpRowStyle)) {
                vo.kpRowStyle = vo.opt.kpRowStyle
            }

            //kpRowDrag, ag-grid才有
            vo.kpRowDrag = setobj(vo.keys,
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

                //filter
                o.filter = vo.kpHeadFilter[key] //欄位標題右邊的選單按鈕, 可使用文字過濾器'agTextColumnFilter'
                o.floatingFilter = vo.kpHeadFilter[key] //欄位標題下方的文字過濾輸入區, 因ag-grid 23.1已改為由column給予floatingFilter, 若全部column都false, 則標題下方查詢區就會自動清除騰出空間
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

                //lockPosition, 若不拖曳而設定欄位lockPosition為true時, 該欄位會強制置左, 故不使用
                //o.lockPosition = !vo.kpHeadDrag[key]

                //suppressMovable, 指定欄位不能拖曳, 但會被其他欄位拖曳而改變位置
                o.suppressMovable = !vo.kpHeadDrag[key]

                //resizable
                o.resizable = true

                //editable
                o.editable = vo.kpCellEditable[key]

                //flex
                // o.flex = 1

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
                if (isbol(vo.kpHeadFixLeft[key])) {

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
                if (isbol(vo.kpHeadHide[key])) {
                    o.hide = vo.kpHeadHide[key]
                }

                return o
            })

            return r
        },

        onGridReady: function(params) {
            //console.log('methods onGridReady', params)

            let vo = this

            //ag
            vo.ag = params

            if (vo.autoFitColumn) {

                //fitColumns
                vo.fitColumns(false)

            }

            //show
            vo.opacity = 1

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
                filter: cstr(value), //ag-grid 23版有修改filter判斷式, 其內使用trim故限定value需為字串
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

        fitColumns: async function(bDebounce = true) {
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
                catch (err) {
                    console.log('fitColumns error', err)
                }
            }

            //core
            async function core() {

                //先微縮小fit
                await fit(99.5)

                //delay
                await delay(50) //不能過短, 否則先縮小再還原機制會失效

                //還原fit
                await fit(100)

            }

            //core
            if (bDebounce) {
                //debounce, 避免高頻觸發
                debounce(`${vo.mmkey}|fitColumns`, () => {
                    core()
                })
            }
            else {
                core()
            }

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
</style>
