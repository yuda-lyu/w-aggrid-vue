<template>
    <div v-bind:ch_param="ch_param">

        <hot-table
            ref="htcmp"
            style="margin-top:20px;"
            width="100%"
            v-bind:height="height"
            v-bind:columns="columns"
            v-bind:colHeaders="colHeaders"
            v-bind:data="filterRows"
            v-bind:settings="settings"
            v-bind:fixedColumnsLeft="kpHeadFixNumLeft"
        ></hot-table>

    </div>
</template>

<script>
import 'handsontable/dist/handsontable.full.css'
import 'handsontable/languages/zh-TW'
import Handsontable from 'handsontable'
import { HotTable } from '@handsontable/vue'

import _ from 'lodash'
import haskey from 'wsemi/src/haskey.mjs'
import isobj from 'wsemi/src/isobj.mjs'
import isnum from 'wsemi/src/isnum.mjs'
import isfun from 'wsemi/src/isfun.mjs'
import ispint from 'wsemi/src/ispint.mjs'
import binstr from 'wsemi/src/binstr.mjs'
import cstr from 'wsemi/src/cstr.mjs'
import keysmat2ltdt from 'wsemi/src/keysmat2ltdt.mjs'
import oo from 'wsemi/src/oo.mjs'
import onTooltip from 'wsemi/src/onTooltip.mjs'

//add
window.ttDTableHandson = onTooltip

let opt = {
    components: {
        'hot-table': HotTable,
    },
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
        let vo = this
        return {

            rows: [],
            keys: [],
            columns: [],
            colHeaders: [],

            kpHead: {},
            kpHeadTooltip: {},
            kpHeadAlighH: {},
            kpHeadSort: {},
            kpHeadFixLeft: {},
            kpHeadFixNumLeft: 0,
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

            settings: {
                licenseKey: '7c86a-405cd-99c65-84b34-5fc55', //license適用於6.2.0
                language: 'zh-TW',
                filters: true, //handsontable的過濾輸入文字框可能跟vuetify衝突而失效(2019/04/12)
                columnSorting: true,
                //headerTooltips: true, //只是單純title效果, 改採第三方tooltip替代
                manualColumnResize: true,
                manualColumnMove: true,
                rowHeaders: true,
                dropdownMenu: ['filter_by_condition', 'filter_action_bar'],
                allowInsertColumn: false, //關閉自動插入Column
                fillHandle: false, //關閉自動fill
                undo: true,
                contextMenu: ['row_above', 'row_below', 'remove_row'],
                //contextMenu: false, //關閉右鍵選單
                afterOnCellMouseUp: vo.htAfterOnCellMouseUp,
                afterChange: vo.htAfterChange,
                afterRender: vo.htRendered,
                afterGetColHeader: vo.htAfterGetColHeader,
            },

            ht: null,
            bInitialized: false,
            bDestroy: false,

        }
    },
    mounted: function() {
        let vo = this
        vo.bDestroy = false
    },
    beforeDestroy: function() {
        let vo = this
        vo.bDestroy = true
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

        getInstance: function() {
            //console.log('getInstance')

            let vo = this

            //check
            if (vo.ht) {
                return vo.ht
            }

            //ht
            vo.ht = _.get(vo.$refs, ['htcmp', 'hotInstance'])

            return vo.ht
        },

        getRowDataFromIndex: function(irow) {
            //console.log('getRowDataFromIndex', irow)

            let vo = this

            //check
            if (vo.bDestroy) {
                return
            }

            //ht
            let ht = vo.getInstance()

            if (ht && irow >= 0) {

                //iphrow
                let iphrow = ht.toPhysicalRow(irow)

                //rdata
                let rdata = vo.rows[iphrow]

                return rdata
            }

            return null
        },

        getCellDataFromIndex: function(irow, icol) {
            //console.log('getCellDataFromIndex', irow,icol)

            let vo = this

            //check
            if (vo.bDestroy) {
                return
            }

            //ht
            let ht = vo.getInstance()

            if (ht && irow >= 0 && icol >= 0) {

                //iphrow
                let iphrow = ht.toPhysicalRow(irow)

                //key
                let key = vo.columns[icol].data //要由columns取得, 因為有showKeys

                //rdata
                let rdata = vo.rows[iphrow]

                //cdata
                let cdata = rdata[key]

                return {
                    key: key,
                    rdata: rdata,
                    cdata: cdata,
                }

            }

            return null
        },

        htAfterOnCellMouseUp: function(event, coords, td) {
            //console.log('htAfterOnCellMouseUp', event, coords, td)

            let vo = this

            //now
            var now = new Date().getTime()

            if (!(td.lastClick && now - td.lastClick < 250)) {
                td.lastClick = now
                vo.htCellClickEvent('Click', event, coords, td)
                return
            }
            vo.htCellClickEvent('DbClick', event, coords, td)

        },

        htCellClickEvent: _.debounce(function(evname, event, coords, td) {
            //console.log('htCellClickEvent', evname, event, coords, td)

            let vo = this

            //r
            let r = vo.getCellDataFromIndex(coords.row, coords.col)

            if (r) {

                //click
                if (evname === 'Click') {
                    vo.cellClick(r.key, r.rdata)
                    vo.rowClick(r.key, r.rdata)
                }
                else if (evname === 'DbClick') {
                    vo.cellDbClick(r.key, r.rdata)
                    vo.rowDbClick(r.key, r.rdata)
                }

            }

        }, 300), //避免同時多次觸發

        htAfterChange: function(changes, source) {
            //console.log('htAfterChange', changes, source)

            let vo = this

            if (source === 'edit' || source === 'CopyPaste.paste' || source === 'UndoRedo.undo') {

                _.each(changes, function (v, k) {
                    let irow = v[0]
                    let key = v[1]
                    let vold = cstr(v[2])
                    let vnew = cstr(v[3])

                    //check值變化
                    if (vold !== vnew) {

                        //rdata
                        let rdata = vo.getRowDataFromIndex(irow)

                        if (rdata) {

                            //cellChange
                            vo.cellChange(key, rdata)

                            //rowChange
                            vo.rowChange(key, rdata)

                        }

                    }

                })
            }

        },

        htRendered: _.debounce(function() {
            //console.log('htRendered')

            let vo = this

            if (vo.bInitialized) {
                return
            }

            //bInitialized
            vo.bInitialized = true

            //refresh
            vo.refresh()

        }, 300), //vuetify視窗剛渲染結束約300ms, 故還需要更久時間等handsontable初始化完

        htAfterGetColHeader: function(icol, th) {
            //console.log('methods htAfterGetColHeader', icol, th)

            let vo = this

            if (icol >= 0) {

                //key
                let key = vo.columns[icol].data //要由columns取得, 因為有showKeys

                //value
                let value = vo.kpHead[key]

                //text-align
                th.style['textAlign'] = vo.kpHeadAlighH[key]

                //funHeadTooltip
                let funHeadTooltip = vo.kpHeadTooltip[key]
                if (isfun(funHeadTooltip)) {
                    let t = funHeadTooltip(value)
                    th.setAttribute('onmouseenter', `ttDTableHandson(this,'${t}')`)
                }
                else {
                    th.setAttribute('onmouseenter', '')
                }

            }

            return th
        },

        removeLicense: function() {
            //console.log('methods removeLicense')

            //let vo = this

            //ele
            let ele = document.querySelector('#hot-display-license-info')

            //移除license提示
            if (ele) {
                ele.parentNode.removeChild(ele)
            }

        },

        refresh: function() {
            //console.log('methods refresh')

            let vo = this

            function core() {

                //check
                if (vo.bDestroy) { //有可能於delay之後才destroy
                    return
                }

                //ht
                let ht = vo.getInstance()

                //recalculate and render
                ht.getPlugin('AutoRowSize').recalculateAllRowsHeight() //需要重算欄位高度才能更新右側捲軸位置
                //ht.getPlugin('AutoColumnSize').recalculateAllColumnsWidth() //會導致計算失敗而無畫面
                ht.render()

                //移除license提示
                vo.removeLicense()

            }

            //delay, 執行緒脫勾, 至少需2次以上recalculateAllRowsHeight才能讓右邊捲軸正常貼右
            _.each(_.range(0, 2), function(s) {
                _.delay(function() {
                    core()
                }, s * 50)
            })

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

            //colHeaders
            vo.colHeaders = vo.keys2headers(vo.keys) //需要先給好vo.kpHead與vo.kpHeadTooltip

            //kpHeadSort
            vo.kpHeadSort = setobj(vo.keys,
                true,
                function(key) {
                    return true //預設true
                },
                vo.opt.kpHeadSort
            )

            //kpHeadFixLeft
            // vo.kpHeadFixLeft = setobj(vo.keys,
            //     true,
            //     function(key) {
            //         return false //預設false
            //     },
            //     vo.opt.kpHeadFixLeft
            // )
            if (isobj(vo.opt.kpHeadFixLeft)) {
                console.warn('kpHeadFixLeft: 目前 handsontable 無法支援')
            }

            //kpHeadFixNumLeft, 僅handsontable有, 只能選左側n欄位fix
            if (ispint(vo.opt.kpHeadFixNumLeft)) {
                vo.kpHeadFixNumLeft = vo.opt.kpHeadFixNumLeft
            }

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

        keys2headers: function(keys) {
            //console.log('methods keys2headers')

            let vo = this

            // let r = _.map(keys, function(key) {
            //     let v = vo.kpHead[key]
            //     let f = vo.kpHeadTooltip[key]
            //     let h = v //預設使用head
            //     if (isfun(f)) {
            //         let t = f(v)
            //         h = `<span onmouseenter="ttDTableHandson(this,'${t}')">${v}</span>`
            //     }
            //     return h
            // })
            let r = _.map(keys, function(key) {
                return vo.kpHead[key]
            })

            return r
        },

        keys2columns: function(keys) {
            //console.log('methods keys2columns')

            let vo = this

            let r = _.map(keys, function(key) {
                let o = {}

                //key
                o.data = key

                //sort, 使用全域columnSorting=true, 在於此處決定誰要關閉
                if (!vo.kpHeadSort[key]) {
                    o.columnSorting = {
                        indicator: false,
                        headerAction: false,
                        compareFunctionFactory: function compareFunctionFactory() {
                            return function comparator() {
                                return 0 //not sort
                            }
                        }
                    }
                }

                //editable
                if (vo.kpCellEditable[key]) {
                    o.editor = Handsontable.editors.TextEditor
                }
                else {
                    o.editor = false
                    o.readOnly = true
                    o.type = 'text'
                }

                // //wordWrap
                // o.wordWrap = false //無效
                // o.noWordWrapClassName = 'htNoWrap' //無效

                //align, cursor, rowstyle, render
                o.renderer = function(instance, td, irow, icol, prop, value, cellProperties) {
                    //console.log('renderer', instance, td, irow, icol, prop, value, cellProperties)

                    //td.style不能另外建立再賦予回td.style, ht無法使用

                    //text-align
                    td.style['textAlign'] = vo.kpCellAlighH[key]

                    //cursor
                    if (vo.tableClickEnable) {
                        td.style['cursor'] = 'pointer'
                    }

                    //nowrap
                    td.style['white-space'] = 'nowrap'

                    //defCellMinWidth, 內容物超過min-width會自動撐開
                    if (isnum(vo.defCellMinWidth)) {

                        //min-width
                        td.style['min-width'] = vo.defCellMinWidth + 'px'

                    }

                    //kpCellWidth, 內容物超過width會自動撐開
                    if (isnum(vo.kpCellWidth[key])) {

                        //width
                        td.style['width'] = vo.kpCellWidth[key] + 'px'

                        //有指定寬度就要設定超長文字處理情形
                        td.style['overflow'] = 'hidden'
                        td.style['text-overflow'] = 'ellipsis'

                    }

                    //rdata
                    let rdata = vo.getRowDataFromIndex(irow)

                    //kpRowStyle
                    if (rdata) {
                        _.each(vo.kpRowStyle, function(v, k) {
                            let f = v
                            let d = rdata[k]
                            if (isfun(f)) {
                                let s = f(d)
                                _.each(s, function(sv, sk) {
                                    td.style[sk] = sv
                                })
                            }
                        })
                    }

                    //funCellTooltip
                    let funCellTooltip = vo.kpCellTooltip[key]
                    if (isfun(funCellTooltip)) {
                        let t = funCellTooltip(value)
                        td.setAttribute('onmouseenter', `ttDTableHandson(this,'${t}')`)
                    }
                    else {
                        td.setAttribute('onmouseenter', '')
                    }

                    //h
                    let h = value

                    //funCellRender
                    let funCellRender = vo.kpCellRender[key]
                    if (isfun(funCellRender)) {
                        h = funCellRender(value, oo(rdata))
                    }

                    //kpCellRender
                    td.innerHTML = h

                    return td
                }

                return o
            })

            return r
        },

        showKeys: function(keys_new) {
            //console.log('methods showKeys', keys_new)

            let vo = this

            //update colHeaders
            vo.colHeaders = vo.keys2headers(keys_new)

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

            //update columns
            vo.columns = cls

            //refresh
            vo.refresh()

        },

        getDisplayData: function() {
            //console.log('methods getDisplayData')

            let vo = this

            //ht
            let ht = vo.getInstance()

            //keys
            let keys = _.map(vo.columns, 'data')

            //rows, 取得頁面上排序與過濾資料，顯隱欄位都存在
            let rows = ht.getData()

            //rs
            let rs = keysmat2ltdt(keys, rows)

            return rs
        },

    },
}
export default opt
</script>

<style scoped>
</style>
