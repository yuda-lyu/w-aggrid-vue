<template>
    <div
        style=""
        :changeMenus="changeMenus"
    >


        <template v-if="!isNarrow">
            <a href="https://github.com/yuda-lyu/w-plot-vue" class="github-corner" style="position:fixed; top:0; right:0; border:0; z-index:10000;" aria-label="View source on GitHub" target="_blank" rel="noreferrer noopener">
                <svg width="80" height="80" viewBox="0 0 250 250" style="fill:rgba(0,0,0,0.25); color:#fff; position: absolute; top: 0; border: 0; right: 0;" aria-hidden="true"><path d="M0,0 L115,115 L130,115 L142,142 L250,250 L250,0 Z"></path><path d="M128.3,109.0 C113.8,99.7 119.0,89.6 119.0,89.6 C122.0,82.7 120.5,78.6 120.5,78.6 C119.2,72.0 123.4,76.3 123.4,76.3 C127.3,80.9 125.5,87.3 125.5,87.3 C122.9,97.6 130.6,101.9 134.4,103.2" fill="currentColor" style="transform-origin: 130px 106px;" class="octo-arm"></path><path d="M115.0,115.0 C114.9,115.1 118.7,116.5 119.8,115.4 L133.7,101.6 C136.9,99.2 139.9,98.4 142.2,98.6 C133.8,88.0 127.5,74.4 143.8,58.0 C148.5,53.4 154.0,51.2 159.7,51.0 C160.3,49.4 163.2,43.6 171.4,40.1 C171.4,40.1 176.1,42.5 178.8,56.2 C183.1,58.6 187.2,61.8 190.9,65.4 C194.5,69.0 197.7,73.2 200.1,77.6 C213.8,80.2 216.3,84.9 216.3,84.9 C212.7,93.1 206.9,96.0 205.4,96.6 C205.1,102.4 203.0,107.8 198.3,112.5 C181.9,128.9 168.3,122.5 157.7,114.1 C157.9,116.9 156.7,120.9 152.7,124.9 L141.0,136.5 C139.8,137.7 141.6,141.9 141.8,141.8 Z" fill="currentColor" class="octo-body"></path></svg>
            </a>
        </template>


        <div style="background:#f5f5f5;">

            <div style="width:calc( 100vw - 20px ); overflow-x:auto;" v-if="cmpsL1 && cmpsL1.length>0">
                <WListHorizontal
                    :items="cmpsL1"
                    :itemActive.sync="cmpP1"
                    :itemBackgroundColor="'transparent'"
                    :itemBackgroundColorHover="'#eee'"
                    :itemBackgroundColorActive="'#eee'"
                    :keyText="'name'"
                    :paddingStyle="{v:12,h:20}"
                    @update:itemActive="(v)=>{indP3=0;indP2=0;indP1=getInd(v,cmpsL1)}"
                >
                    <template v-slot:item="props">
                        <div style="">
                            {{props.item.name}}
                        </div>
                    </template>
                </WListHorizontal>
                <div style="height:1px; background:#ddd;"></div>
            </div>


            <div style="width:calc( 100vw - 20px ); overflow-x:auto;" v-if="cmpsL2 && cmpsL2.length>0">
                <div style="height:3px; background:#fff;"></div>
                <WListHorizontal
                    :items="cmpsL2"
                    :itemActive.sync="cmpP2"
                    :itemBackgroundColor="'transparent'"
                    :itemBackgroundColorHover="'#eee'"
                    :itemBackgroundColorActive="'#eee'"
                    :keyText="'name'"
                    :paddingStyle="{v:12,h:20}"
                    @update:itemActive="(v)=>{indP3=0;indP2=getInd(v,cmpsL2)}"
                >
                    <template v-slot:item="props">
                        <div style="">
                            {{props.item.name}}
                        </div>
                    </template>
                </WListHorizontal>
                <div style="height:1px; background:#ddd;"></div>
            </div>

            <div style="width:calc( 100vw - 20px ); overflow-x:auto;" v-if="cmpsL3 && cmpsL3.length>0">
                <div style="height:3px; background:#fff;"></div>
                <WListHorizontal
                    :items="cmpsL3"
                    :itemActive.sync="cmpP3"
                    :itemBackgroundColor="'transparent'"
                    :itemBackgroundColorHover="'#eee'"
                    :itemBackgroundColorActive="'#eee'"
                    :keyText="'name'"
                    :paddingStyle="{v:12,h:20}"
                    @update:itemActive="(v)=>{indP3=getInd(v,cmpsL3)}"
                >
                    <template v-slot:item="props">
                        <div style="">
                            {{props.item.name}}
                        </div>
                    </template>
                </WListHorizontal>
                <div style="height:1px; background:#ddd;"></div>
            </div>

        </div>


        <div class="bkh">

            <AppCellChange v-if="cmpPick==='cellChange'"></AppCellChange>

            <AppCellMouseEnter v-if="cmpPick==='cellMouseEnter'"></AppCellMouseEnter>

            <AppCellMouseLeave v-if="cmpPick==='cellMouseLeave'"></AppCellMouseLeave>

            <AppCellClick v-if="cmpPick==='cellClick'"></AppCellClick>

            <AppCellDbClick v-if="cmpPick==='cellDbClick'"></AppCellDbClick>

            <AppClearHeadFilter v-if="cmpPick==='clearHeadFilter'"></AppClearHeadFilter>

            <AppClearHeadFilterAll v-if="cmpPick==='clearHeadFilterAll'"></AppClearHeadFilterAll>

            <AppDefCellAlignH v-if="cmpPick==='defCellAlignH'"></AppDefCellAlignH>

            <AppDefCellEditable v-if="cmpPick==='defCellEditable'"></AppDefCellEditable>

            <AppDefCellMinWidth v-if="cmpPick==='defCellMinWidth'"></AppDefCellMinWidth>

            <AppDefHeadAlignH v-if="cmpPick==='defHeadAlignH'"></AppDefHeadAlignH>

            <AppDefHeadDrag v-if="cmpPick==='defHeadDrag'"></AppDefHeadDrag>

            <AppDefHeadFilter v-if="cmpPick==='defHeadFilter'"></AppDefHeadFilter>

            <AppDefHeadFilterType v-if="cmpPick==='defHeadFilterType'"></AppDefHeadFilterType>

            <AppDefHeadSort v-if="cmpPick==='defHeadSort'"></AppDefHeadSort>

            <AppDefHeadSortMethod v-if="cmpPick==='defHeadSortMethod'"></AppDefHeadSortMethod>

            <AppFilterAllData v-if="cmpPick==='filterAllData'"></AppFilterAllData>

            <AppGetDisplayData v-if="cmpPick==='getDisplayData'"></AppGetDisplayData>

            <AppDownloadData v-if="cmpPick==='downloadData'"></AppDownloadData>

            <AppDownloadDisplayData v-if="cmpPick==='downloadDisplayData'"></AppDownloadDisplayData>

            <AppUploadData v-if="cmpPick==='uploadData'"></AppUploadData>

            <AppUploadDataWithConvertKeys v-if="cmpPick==='uploadDataWithkpConvertKeys'"></AppUploadDataWithConvertKeys>

            <AppPasteText v-if="cmpPick==='pasteText'"></AppPasteText>

            <AppFitColumns v-if="cmpPick==='fitColumns'"></AppFitColumns>

            <AppAutoFitColumns v-if="cmpPick==='autoFitColumns'"></AppAutoFitColumns>

            <AppGenRowsPinnBottom v-if="cmpPick==='genRowsPinnBottom'"></AppGenRowsPinnBottom>

            <AppGenRowsPinnTop v-if="cmpPick==='genRowsPinnTop'"></AppGenRowsPinnTop>

            <AppGetInstance v-if="cmpPick==='getInstance'"></AppGetInstance>

            <AppHighlight v-if="cmpPick==='highlight'"></AppHighlight>

            <AppKpCellAlignH v-if="cmpPick==='kpCellAlignH'"></AppKpCellAlignH>

            <AppKpCellEditable v-if="cmpPick==='kpCellEditable'"></AppKpCellEditable>

            <AppKpCellRender v-if="cmpPick==='kpCellRender'"></AppKpCellRender>

            <AppKpCellTooltip v-if="cmpPick==='kpCellTooltip'"></AppKpCellTooltip>

            <AppKpCellWidth v-if="cmpPick==='kpCellWidth'"></AppKpCellWidth>

            <AppKpHead v-if="cmpPick==='kpHead'"></AppKpHead>

            <AppKpHeadAlignH v-if="cmpPick==='kpHeadAlignH'"></AppKpHeadAlignH>

            <AppKpHeadRender v-if="cmpPick==='kpHeadRender'"></AppKpHeadRender>

            <AppKpHeadDrag v-if="cmpPick==='kpHeadDrag'"></AppKpHeadDrag>

            <AppKpHeadCheckBox v-if="cmpPick==='kpHeadCheckBox'"></AppKpHeadCheckBox>

            <AppKpHeadHide v-if="cmpPick==='kpHeadHide'"></AppKpHeadHide>

            <AppKpHeadFilter v-if="cmpPick==='kpHeadFilter'"></AppKpHeadFilter>

            <AppKpHeadFilterType v-if="cmpPick==='kpHeadFilterType'"></AppKpHeadFilterType>

            <AppKpHeadFixLeft v-if="cmpPick==='kpHeadFixLeft'"></AppKpHeadFixLeft>

            <AppKpHeadSort v-if="cmpPick==='kpHeadSort'"></AppKpHeadSort>

            <AppKpHeadSortMethod v-if="cmpPick==='kpHeadSortMethod'"></AppKpHeadSortMethod>

            <AppKpHeadTooltip v-if="cmpPick==='kpHeadTooltip'"></AppKpHeadTooltip>

            <AppKpRowStyle v-if="cmpPick==='kpRowStyle'"></AppKpRowStyle>

            <AppKpRowDrag v-if="cmpPick==='kpRowDrag'"></AppKpRowDrag>

            <AppKpColStyle v-if="cmpPick==='kpColStyle'"></AppKpColStyle>

            <AppKpColSpan v-if="cmpPick==='kpColSpan'"></AppKpColSpan>

            <AppLargeData v-if="cmpPick==='largeData'"></AppLargeData>

            <AppOperateData v-if="cmpPick==='operateData'"></AppOperateData>

            <AppRowsChange v-if="cmpPick==='rowsChange'"></AppRowsChange>

            <AppRowChange v-if="cmpPick==='rowChange'"></AppRowChange>

            <AppRowChecked v-if="cmpPick==='rowChecked'"></AppRowChecked>

            <AppRowMouseEnter v-if="cmpPick==='rowMouseEnter'"></AppRowMouseEnter>

            <AppRowMouseLeave v-if="cmpPick==='rowMouseLeave'"></AppRowMouseLeave>

            <AppRowClick v-if="cmpPick==='rowClick'"></AppRowClick>

            <AppRowDbClick v-if="cmpPick==='rowDbClick'"></AppRowDbClick>

            <AppSetHeadFilter v-if="cmpPick==='setHeadFilter'"></AppSetHeadFilter>

            <AppFilterChange v-if="cmpPick==='filterChange'"></AppFilterChange>

            <AppShowKeys v-if="cmpPick==='showKeys'"></AppShowKeys>

            <AppSimpleData v-if="cmpPick==='simpleData'"></AppSimpleData>

            <AppTableHeight v-if="cmpPick==='tableHeight'"></AppTableHeight>

            <AppTableWidth v-if="cmpPick==='tableWidth'"></AppTableWidth>

            <AppTableWidthFull v-if="cmpPick==='tableWidthFull'"></AppTableWidthFull>

        </div>


    </div>
</template>

<script>
import get from 'lodash-es/get.js'
import each from 'lodash-es/each.js'
// import cloneDeep from 'lodash-es/cloneDeep.js'
import urlParse from 'wsemi/src/urlParse.mjs'
import WListHorizontal from 'w-component-vue/src/components/WListHorizontal.vue'
import AppCellChange from './AppCellChange.vue'
import AppCellMouseEnter from './AppCellMouseEnter.vue'
import AppCellMouseLeave from './AppCellMouseLeave.vue'
import AppCellClick from './AppCellClick.vue'
import AppCellDbClick from './AppCellDbClick.vue'
import AppClearHeadFilter from './AppClearHeadFilter.vue'
import AppClearHeadFilterAll from './AppClearHeadFilterAll.vue'
import AppDefCellAlignH from './AppDefCellAlignH.vue'
import AppDefCellEditable from './AppDefCellEditable.vue'
import AppDefCellMinWidth from './AppDefCellMinWidth.vue'
import AppDefHeadAlignH from './AppDefHeadAlignH.vue'
import AppDefHeadDrag from './AppDefHeadDrag.vue'
import AppDefHeadFilter from './AppDefHeadFilter.vue'
import AppDefHeadFilterType from './AppDefHeadFilterType.vue'
import AppDefHeadSort from './AppDefHeadSort.vue'
import AppDefHeadSortMethod from './AppDefHeadSortMethod.vue'
import AppFilterAllData from './AppFilterAllData.vue'
import AppGetDisplayData from './AppGetDisplayData.vue'
import AppDownloadData from './AppDownloadData.vue'
import AppDownloadDisplayData from './AppDownloadDisplayData.vue'
import AppUploadData from './AppUploadData.vue'
import AppUploadDataWithConvertKeys from './AppUploadDataWithConvertKeys.vue'
import AppPasteText from './AppPasteText.vue'
import AppFitColumns from './AppFitColumns.vue'
import AppAutoFitColumns from './AppAutoFitColumns.vue'
import AppGenRowsPinnBottom from './AppGenRowsPinnBottom.vue'
import AppGenRowsPinnTop from './AppGenRowsPinnTop.vue'
import AppGetInstance from './AppGetInstance.vue'
import AppHighlight from './AppHighlight.vue'
import AppKpCellAlignH from './AppKpCellAlignH.vue'
import AppKpCellEditable from './AppKpCellEditable.vue'
import AppKpCellRender from './AppKpCellRender.vue'
import AppKpCellTooltip from './AppKpCellTooltip.vue'
import AppKpCellWidth from './AppKpCellWidth.vue'
import AppKpHead from './AppKpHead.vue'
import AppKpHeadAlignH from './AppKpHeadAlignH.vue'
import AppKpHeadRender from './AppKpHeadRender.vue'
import AppKpHeadDrag from './AppKpHeadDrag.vue'
import AppKpHeadCheckBox from './AppKpHeadCheckBox.vue'
import AppKpHeadHide from './AppKpHeadHide.vue'
import AppKpHeadFilter from './AppKpHeadFilter.vue'
import AppKpHeadFilterType from './AppKpHeadFilterType.vue'
import AppKpHeadFixLeft from './AppKpHeadFixLeft.vue'
import AppKpHeadSort from './AppKpHeadSort.vue'
import AppKpHeadSortMethod from './AppKpHeadSortMethod.vue'
import AppKpHeadTooltip from './AppKpHeadTooltip.vue'
import AppKpRowStyle from './AppKpRowStyle.vue'
import AppKpRowDrag from './AppKpRowDrag.vue'
import AppKpColStyle from './AppKpColStyle.vue'
import AppKpColSpan from './AppKpColSpan.vue'
import AppLargeData from './AppLargeData.vue'
import AppOperateData from './AppOperateData.vue'
import AppRowsChange from './AppRowsChange.vue'
import AppRowChange from './AppRowChange.vue'
import AppRowChecked from './AppRowChecked.vue'
import AppRowMouseEnter from './AppRowMouseEnter.vue'
import AppRowMouseLeave from './AppRowMouseLeave.vue'
import AppRowClick from './AppRowClick.vue'
import AppRowDbClick from './AppRowDbClick.vue'
import AppSetHeadFilter from './AppSetHeadFilter.vue'
import AppFilterChange from './AppFilterChange.vue'
import AppShowKeys from './AppShowKeys.vue'
import AppSimpleData from './AppSimpleData.vue'
import AppTableHeight from './AppTableHeight.vue'
import AppTableWidth from './AppTableWidth.vue'
import AppTableWidthFull from './AppTableWidthFull.vue'


export default {
    components: {
        WListHorizontal,
        AppCellChange,
        AppCellMouseEnter,
        AppCellMouseLeave,
        AppCellClick,
        AppCellDbClick,
        AppClearHeadFilter,
        AppClearHeadFilterAll,
        AppDefCellAlignH,
        AppDefCellEditable,
        AppDefCellMinWidth,
        AppDefHeadAlignH,
        AppDefHeadDrag,
        AppDefHeadFilter,
        AppDefHeadFilterType,
        AppDefHeadSort,
        AppDefHeadSortMethod,
        AppFilterAllData,
        AppGetDisplayData,
        AppDownloadData,
        AppDownloadDisplayData,
        AppUploadData,
        AppUploadDataWithConvertKeys,
        AppPasteText,
        AppFitColumns,
        AppAutoFitColumns,
        AppGenRowsPinnBottom,
        AppGenRowsPinnTop,
        AppGetInstance,
        AppHighlight,
        AppKpCellAlignH,
        AppKpCellEditable,
        AppKpCellRender,
        AppKpCellTooltip,
        AppKpCellWidth,
        AppKpHead,
        AppKpHeadAlignH,
        AppKpHeadRender,
        AppKpHeadDrag,
        AppKpHeadCheckBox,
        AppKpHeadHide,
        AppKpHeadFilter,
        AppKpHeadFilterType,
        AppKpHeadFixLeft,
        AppKpHeadSort,
        AppKpHeadSortMethod,
        AppKpHeadTooltip,
        AppKpRowStyle,
        AppKpRowDrag,
        AppKpColStyle,
        AppKpColSpan,
        AppLargeData,
        AppOperateData,
        AppRowsChange,
        AppRowChange,
        AppRowChecked,
        AppRowMouseEnter,
        AppRowMouseLeave,
        AppRowClick,
        AppRowDbClick,
        AppSetHeadFilter,
        AppFilterChange,
        AppShowKeys,
        AppSimpleData,
        AppTableHeight,
        AppTableWidth,
        AppTableWidthFull,
    },
    data: function() {
        let cmps = [
            {
                name: 'data',
                cmps: [
                    { name: 'simpleData' },
                    { name: 'largeData' },
                ],
            },
            {
                name: 'size',
                cmps: [
                    { name: 'tableHeight' },
                    { name: 'tableWidth' },
                    { name: 'tableWidthFull' },
                ],
            },
            {
                name: 'cell',
                cmps: [
                    { name: 'cellChange' },
                    { name: 'cellMouseEnter' },
                    { name: 'cellMouseLeave' },
                    { name: 'cellClick' },
                    { name: 'cellDbClick' },
                ],
            },
            {
                name: 'row',
                cmps: [
                    { name: 'rowsChange' },
                    { name: 'rowChange' },
                    { name: 'rowChecked' },
                    { name: 'rowMouseEnter' },
                    { name: 'rowMouseLeave' },
                    { name: 'rowClick' },
                    { name: 'rowDbClick' },
                ],
            },
            {
                name: 'kpCell',
                cmps: [
                    {
                        name: 'kp',
                        cmps: [
                            { name: 'kpCellAlignH' },
                            { name: 'kpCellEditable' },
                            { name: 'kpCellRender' },
                            { name: 'kpCellTooltip' },
                            { name: 'kpCellWidth' },
                        ],
                    },
                    {
                        name: 'def',
                        cmps: [
                            { name: 'defCellAlignH' },
                            { name: 'defCellEditable' },
                            { name: 'defCellMinWidth' },
                        ],
                    },
                ],
            },
            {
                name: 'kpHead',
                cmps: [
                    {
                        name: 'kp',
                        cmps: [
                            { name: 'kpHead' },
                            { name: 'kpHeadAlignH' },
                            { name: 'kpHeadRender' },
                            { name: 'kpHeadDrag' },
                            { name: 'kpHeadCheckBox' },
                            { name: 'kpHeadHide' },
                            { name: 'kpHeadFilter' },
                            { name: 'kpHeadFilterType' },
                            { name: 'kpHeadFixLeft' },
                            { name: 'kpHeadSort' },
                            { name: 'kpHeadSortMethod' },
                            { name: 'kpHeadTooltip' },
                        ],
                    },
                    {
                        name: 'def',
                        cmps: [
                            { name: 'defHeadAlignH' },
                            { name: 'defHeadDrag' },
                            { name: 'defHeadFilter' },
                            { name: 'defHeadFilterType' },
                            { name: 'defHeadSort' },
                            { name: 'defHeadSortMethod' },
                        ],
                    },
                ],
            },
            {
                name: 'kpRow',
                cmps: [
                    {
                        name: 'kp',
                        cmps: [
                            { name: 'kpRowStyle' },
                            { name: 'kpRowDrag' },
                        ],
                    },
                ],
            },
            {
                name: 'kpCol',
                cmps: [
                    {
                        name: 'kp',
                        cmps: [
                            { name: 'kpColStyle' },
                            { name: 'kpColSpan' },
                        ],
                    },
                ],
            },
            {
                name: 'filter',
                cmps: [
                    { name: 'filterAllData' },
                    { name: 'getDisplayData' },
                    { name: 'clearHeadFilter' },
                    { name: 'clearHeadFilterAll' },
                    { name: 'setHeadFilter' },
                    { name: 'filterChange' },
                    { name: 'highlight' },
                ],
            },
            {
                name: 'funcs',
                cmps: [
                    {
                        name: 'fit',
                        cmps: [
                            { name: 'fitColumns' },
                            { name: 'autoFitColumns' },
                        ],
                    },
                    {
                        name: 'gen',
                        cmps: [
                            { name: 'genRowsPinnBottom' },
                            { name: 'genRowsPinnTop' },
                        ],
                    },
                    {
                        name: 'operate',
                        cmps: [
                            { name: 'pasteText' },
                            { name: 'showKeys' },
                            { name: 'operateData' },
                        ],
                    },
                    {
                        name: 'download',
                        cmps: [
                            { name: 'downloadData' },
                            { name: 'downloadDisplayData' },
                        ],
                    },
                    {
                        name: 'upload',
                        cmps: [
                            { name: 'uploadData' },
                            { name: 'uploadDataWithkpConvertKeys' },
                        ],
                    },
                    { name: 'getInstance' },
                ],
            },
        ]
        return {

            cmpsL1: cmps,
            indP1: null,
            cmpP1: null,

            cmpsL2: null,
            indP2: null,
            cmpP2: null,

            cmpsL3: null,
            indP3: null,
            cmpP3: null,

            cmpsL4: null,

            cmpPick: '',

        }
    },
    mounted: function() {
        let vo = this

        //default
        vo.indP1 = 0
        vo.indP2 = 0
        vo.indP3 = 0

        //urlParse, http://localhost:8080/?cmp=w-set-multi
        let p = urlParse(location.href)
        // console.log('p', p)

        //viewPick
        vo.viewPick(get(p, 'cmp', ''))

    },
    computed: {

        changeMenus: function() {
            let vo = this
            vo.modifyMenus(vo.indP1, vo.indP2, vo.indP3)
            return ''
        },

        isNarrow: function() {
            return window.innerWidth < 1000
        },

    },
    methods: {

        modifyMenus: function() {
            let vo = this

            let cmpPick = ''

            setTimeout(() => {

                // console.log('call P1')
                vo.cmpP1 = get(vo.cmpsL1, vo.indP1, {})
                vo.cmpsL2 = get(vo.cmpP1, `cmps`, [])
                let _cmpPick = get(vo.cmpP1, `name`, '')
                if (_cmpPick) {
                    cmpPick = _cmpPick
                }
                // console.log('vo.cmpP1', cloneDeep(vo.cmpP1))
                // console.log('vo.cmpsL2', cloneDeep(vo.cmpsL2))

            }, 50)

            setTimeout(() => {

                // console.log('call P2')
                let cmps = get(vo.cmpP1, `cmps`, [])
                vo.cmpP2 = get(cmps, vo.indP2, {})
                vo.cmpsL3 = get(vo.cmpP2, `cmps`, [])
                let _cmpPick = get(vo.cmpP2, `name`, '')
                if (_cmpPick) {
                    cmpPick = _cmpPick
                }
                // console.log('vo.cmpP2', cloneDeep(vo.cmpP2))
                // console.log('vo.cmpsL3', cloneDeep(vo.cmpsL3))

            }, 100)

            setTimeout(() => {

                // console.log('call P3')
                let cmps = get(vo.cmpP2, `cmps`, [])
                vo.cmpP3 = get(cmps, vo.indP3, {})
                vo.cmpsL4 = get(vo.cmpP3, `cmps`, [])
                let _cmpPick = get(vo.cmpP3, `name`, '')
                if (_cmpPick) {
                    cmpPick = _cmpPick
                }
                // console.log('vo.cmpP3', cloneDeep(vo.cmpP3))
                // console.log('vo.cmpsL4', cloneDeep(vo.cmpsL4))

                //update
                vo.cmpPick = cmpPick
                // console.log('cmpPick', cmpPick)

            }, 150)

        },

        getInd: function(item, items) {
            // let vo = this
            let ind = -1
            each(items, (v, k) => {
                if (item.name === v.name) {
                    ind = k
                    return false //跳出
                }
            })
            return ind
        },

        viewPick: function(cmpPick) {
            let vo = this
            let _cmpPick = cmpPick
            let r = ''
            let rs = []
            let ls = []
            let pv = (ts) => {
                each(ts, (v, k) => {
                    ls.push(k)

                    //name, _name
                    let name = get(v, `name`, '')
                    let _name = name

                    //cmps
                    let cmps = get(v, `cmps`, [])

                    //push
                    let cls = ls.join('.')
                    let b = _name === _cmpPick
                    rs.push({
                        cls,
                        name,
                        b,
                    })

                    //save
                    if (b) {
                        r = JSON.parse(JSON.stringify(ls))
                    }

                    //遞迴pv
                    if (cmps.length > 0) {
                        pv(cmps)
                    }

                    ls.pop()
                })
            }
            pv(vo.cmpsL1)
            // console.log('rs', rs)
            // console.log('r', r)
            vo.indP1 = get(r, 0, 0)
            vo.indP2 = get(r, 1, 0)
            vo.indP3 = get(r, 2, 0)
        },

    },
}
</script>

<style>
.item-link {
    display: inline-block;
    margin: 10px 10px 0px 0px;
    padding: 5px 10px;
    font-size: 0.8rem;
    color: #fff;
    background-color: #443a65;
    cursor: pointer;
    text-decoration: none;
}
.bkh { /* 寬 */
    padding:20px;
}
@media screen and (max-width:800px){ /* 中 */
    .bkh {
        padding:10px;
    }
}
@media screen and (max-width:400px){ /* 窄 */
    .bkh {
        padding:5px;
    }
}
.bkp { /* 寬 */
    padding:0px 20px;
}
@media screen and (max-width:800px){ /* 中 */
    .bkp {
        padding:0px 10px;
    }
}
@media screen and (max-width:400px){ /* 窄 */
    .bkp {
        padding:0px 5px;
    }
}
</style>
