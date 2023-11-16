<template>
    <div>


        <template v-if="!isNarrow">
            <a href="https://github.com/yuda-lyu/w-aggrid-vue" class="github-corner" style="position:fixed; top:0; right:0; border:0; z-index:10000;" aria-label="View source on GitHub" target="_blank">
                <svg width="80" height="80" viewBox="0 0 250 250" style="fill:rgba(0,0,0,0.25); color:#fff; position: absolute; top: 0; border: 0; right: 0;" aria-hidden="true"><path d="M0,0 L115,115 L130,115 L142,142 L250,250 L250,0 Z"></path><path d="M128.3,109.0 C113.8,99.7 119.0,89.6 119.0,89.6 C122.0,82.7 120.5,78.6 120.5,78.6 C119.2,72.0 123.4,76.3 123.4,76.3 C127.3,80.9 125.5,87.3 125.5,87.3 C122.9,97.6 130.6,101.9 134.4,103.2" fill="currentColor" style="transform-origin: 130px 106px;" class="octo-arm"></path><path d="M115.0,115.0 C114.9,115.1 118.7,116.5 119.8,115.4 L133.7,101.6 C136.9,99.2 139.9,98.4 142.2,98.6 C133.8,88.0 127.5,74.4 143.8,58.0 C148.5,53.4 154.0,51.2 159.7,51.0 C160.3,49.4 163.2,43.6 171.4,40.1 C171.4,40.1 176.1,42.5 178.8,56.2 C183.1,58.6 187.2,61.8 190.9,65.4 C194.5,69.0 197.7,73.2 200.1,77.6 C213.8,80.2 216.3,84.9 216.3,84.9 C212.7,93.1 206.9,96.0 205.4,96.6 C205.1,102.4 203.0,107.8 198.3,112.5 C181.9,128.9 168.3,122.5 157.7,114.1 C157.9,116.9 156.7,120.9 152.7,124.9 L141.0,136.5 C139.8,137.7 141.6,141.9 141.8,141.8 Z" fill="currentColor" class="octo-body"></path></svg>
            </a>
        </template>


        <div
            :style="`transition:background-color 0.2s; position:fixed; left:0; top:0; z-index:10; height:100vh; width:${showMenu?'100vw':widthMenu+'px'}; overflow-x:hidden; background-color:${showMenu?'rgba(0,0,0,0.5)':'transparent'};`"
            @click="showMenu=false"
            @mouseenter="showMenu=false"
        >

            <div
                :style="`transition:all 0.2s; height:100vh; width:${showMenu?'50vw':widthMenu+'px'}; overflow-x:hidden;`"
                @click.stop="showMenu=true"
                @mouseenter="showMenu=true"
                @mouseleave="showMenu=false"
            >

                <div
                    :style="`transition:all 0.2s; height:100%; width:50vw; overflow-y:auto; background-color:#fff`"
                >

                    <div
                        :style="`transition:all 0.2s; display:table; width:100%;`"
                        :key="kmcmp"
                        v-for="(mcmp,kmcmp) in mcmps"
                    >

                        <div :style="`transition:all 0.2s; display:table-cell; padding-top:15px; padding-right:10px; width:${widthMenu-10}px; text-align:right; font-size:0.9rem; color:${showMenu?'#6A1B9A':'#888'}; background-color:${showMenu?'#eee':'#fff'}; border-bottom:1px solid ${showMenu?'#E1BEE7':'#fff'};`">{{kmcmp}}</div>

                        <div :style="`transition:all 0.2s; display:table-cell; padding-top:15px; padding-left:10px; padding-right:10px; border-bottom:1px solid ${showMenu?'#dcf':'#fff'};`">
                            <template v-for="(cmp,kcmp) in mcmp">
                                <div
                                    :class="`item ${cmp===showCmp?'item-active':'item-inactive'}`"
                                    style="position:relative;"
                                    :key="kcmp"
                                    @click="showCmp=cmp;showMenu=false;"
                                >

                                    <span>{{cmp}}</span>

                                    <div
                                        style="position:absolute; top:-9px; right:-10px; padding:0px 7px; opacity:0.8; font-size:0.7rem; color:#fff; background-color:#f26; border-radius:10px;"
                                        v-if="cmp.substring(0, 3)==='def'"
                                    >
                                        def
                                    </div>

                                </div>
                            </template>
                        </div>

                    </div>

                </div>

            </div>

        </div>


        <div style="display:flex;">

            <div
                :style="`padding-left:${widthMenu}px;`"
                @mouseenter="showMenu=true"
            ></div>

            <div
                style="width:100%;"
                @mousemove="showMenu=false"
            >

                <div style="padding:0px 30px; overflow-x:auto; border-left:1px solid #ddd;">

                    <AppCellChange v-if="showCmp==='cellChange'"></AppCellChange>

                    <AppCellMouseEnter v-if="showCmp==='cellMouseEnter'"></AppCellMouseEnter>

                    <AppCellMouseLeave v-if="showCmp==='cellMouseLeave'"></AppCellMouseLeave>

                    <AppCellClick v-if="showCmp==='cellClick'"></AppCellClick>

                    <AppCellDbClick v-if="showCmp==='cellDbClick'"></AppCellDbClick>

                    <AppClearHeadFilter v-if="showCmp==='clearHeadFilter'"></AppClearHeadFilter>

                    <AppClearHeadFilterAll v-if="showCmp==='clearHeadFilterAll'"></AppClearHeadFilterAll>

                    <AppDefCellAlignH v-if="showCmp==='defCellAlignH'"></AppDefCellAlignH>

                    <AppDefCellEditable v-if="showCmp==='defCellEditable'"></AppDefCellEditable>

                    <AppDefCellMinWidth v-if="showCmp==='defCellMinWidth'"></AppDefCellMinWidth>

                    <AppDefHeadAlignH v-if="showCmp==='defHeadAlignH'"></AppDefHeadAlignH>

                    <AppDefHeadDrag v-if="showCmp==='defHeadDrag'"></AppDefHeadDrag>

                    <AppDefHeadFilter v-if="showCmp==='defHeadFilter'"></AppDefHeadFilter>

                    <AppDefHeadFilterType v-if="showCmp==='defHeadFilterType'"></AppDefHeadFilterType>

                    <AppDefHeadSort v-if="showCmp==='defHeadSort'"></AppDefHeadSort>

                    <AppDefHeadSortMethod v-if="showCmp==='defHeadSortMethod'"></AppDefHeadSortMethod>

                    <AppFilterAllData v-if="showCmp==='filterAllData'"></AppFilterAllData>

                    <AppGetDisplayData v-if="showCmp==='getDisplayData'"></AppGetDisplayData>

                    <AppDownloadData v-if="showCmp==='downloadData'"></AppDownloadData>

                    <AppDownloadDisplayData v-if="showCmp==='downloadDisplayData'"></AppDownloadDisplayData>

                    <AppUploadData v-if="showCmp==='uploadData'"></AppUploadData>

                    <AppUploadDataWithConvertKeys v-if="showCmp==='uploadDataWithkpConvertKeys'"></AppUploadDataWithConvertKeys>

                    <AppPasteText v-if="showCmp==='pasteText'"></AppPasteText>

                    <AppFitColumns v-if="showCmp==='fitColumns'"></AppFitColumns>

                    <AppAutoFitColumns v-if="showCmp==='autoFitColumns'"></AppAutoFitColumns>

                    <AppGenRowsPinnBottom v-if="showCmp==='genRowsPinnBottom'"></AppGenRowsPinnBottom>

                    <AppGenRowsPinnTop v-if="showCmp==='genRowsPinnTop'"></AppGenRowsPinnTop>

                    <AppGetInstance v-if="showCmp==='getInstance'"></AppGetInstance>

                    <AppHighlight v-if="showCmp==='highlight'"></AppHighlight>

                    <AppKpCellAlignH v-if="showCmp==='kpCellAlignH'"></AppKpCellAlignH>

                    <AppKpCellEditable v-if="showCmp==='kpCellEditable'"></AppKpCellEditable>

                    <AppKpCellRender v-if="showCmp==='kpCellRender'"></AppKpCellRender>

                    <AppKpCellTooltip v-if="showCmp==='kpCellTooltip'"></AppKpCellTooltip>

                    <AppKpCellWidth v-if="showCmp==='kpCellWidth'"></AppKpCellWidth>

                    <AppKpHead v-if="showCmp==='kpHead'"></AppKpHead>

                    <AppKpHeadAlignH v-if="showCmp==='kpHeadAlignH'"></AppKpHeadAlignH>

                    <AppKpHeadRender v-if="showCmp==='kpHeadRender'"></AppKpHeadRender>

                    <AppKpHeadDrag v-if="showCmp==='kpHeadDrag'"></AppKpHeadDrag>

                    <AppKpHeadCheckBox v-if="showCmp==='kpHeadCheckBox'"></AppKpHeadCheckBox>

                    <AppKpHeadHide v-if="showCmp==='kpHeadHide'"></AppKpHeadHide>

                    <AppKpHeadFilter v-if="showCmp==='kpHeadFilter'"></AppKpHeadFilter>

                    <AppKpHeadFilterType v-if="showCmp==='kpHeadFilterType'"></AppKpHeadFilterType>

                    <AppKpHeadFixLeft v-if="showCmp==='kpHeadFixLeft'"></AppKpHeadFixLeft>

                    <AppKpHeadSort v-if="showCmp==='kpHeadSort'"></AppKpHeadSort>

                    <AppKpHeadSortMethod v-if="showCmp==='kpHeadSortMethod'"></AppKpHeadSortMethod>

                    <AppKpHeadTooltip v-if="showCmp==='kpHeadTooltip'"></AppKpHeadTooltip>

                    <AppKpRowStyle v-if="showCmp==='kpRowStyle'"></AppKpRowStyle>

                    <AppKpRowDrag v-if="showCmp==='kpRowDrag'"></AppKpRowDrag>

                    <AppKpColStyle v-if="showCmp==='kpColStyle'"></AppKpColStyle>

                    <AppKpColSpan v-if="showCmp==='kpColSpan'"></AppKpColSpan>

                    <AppLargeData v-if="showCmp==='largeData'"></AppLargeData>

                    <AppOperateData v-if="showCmp==='operateData'"></AppOperateData>

                    <AppRowsChange v-if="showCmp==='rowsChange'"></AppRowsChange>

                    <AppRowChange v-if="showCmp==='rowChange'"></AppRowChange>

                    <AppRowChecked v-if="showCmp==='rowChecked'"></AppRowChecked>

                    <AppRowMouseEnter v-if="showCmp==='rowMouseEnter'"></AppRowMouseEnter>

                    <AppRowMouseLeave v-if="showCmp==='rowMouseLeave'"></AppRowMouseLeave>

                    <AppRowClick v-if="showCmp==='rowClick'"></AppRowClick>

                    <AppRowDbClick v-if="showCmp==='rowDbClick'"></AppRowDbClick>

                    <AppSetHeadFilter v-if="showCmp==='setHeadFilter'"></AppSetHeadFilter>

                    <AppFilterChange v-if="showCmp==='filterChange'"></AppFilterChange>

                    <AppShowKeys v-if="showCmp==='showKeys'"></AppShowKeys>

                    <AppSimpleData v-if="showCmp==='simpleData'"></AppSimpleData>

                    <AppTableHeight v-if="showCmp==='tableHeight'"></AppTableHeight>

                    <AppTableWidth v-if="showCmp==='tableWidth'"></AppTableWidth>

                    <AppTableWidthFull v-if="showCmp==='tableWidthFull'"></AppTableWidthFull>

                </div>

            </div>

        </div>


    </div>
</template>

<script>
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
        return {
            widthMenu: 80,
            showMenu: false,
            showCmp: 'largeData',
            mcmps: {
                data: [
                    'simpleData',
                    'largeData',
                ],
                size: [
                    'tableHeight',
                    'tableWidth',
                    'tableWidthFull',
                ],
                cell: [
                    'cellChange',
                    'cellMouseEnter',
                    'cellMouseLeave',
                    'cellClick',
                    'cellDbClick',
                ],
                row: [
                    'rowsChange',
                    'rowChange',
                    'rowChecked',
                    'rowMouseEnter',
                    'rowMouseLeave',
                    'rowClick',
                    'rowDbClick',
                ],
                kpCell: [
                    'kpCellAlignH',
                    'kpCellEditable',
                    'kpCellRender',
                    'kpCellTooltip',
                    'kpCellWidth',
                    'defCellAlignH',
                    'defCellEditable',
                    'defCellMinWidth',
                ],
                kpHead: [
                    'kpHead',
                    'kpHeadAlignH',
                    'kpHeadRender',
                    'kpHeadDrag',
                    'kpHeadCheckBox',
                    'kpHeadHide',
                    'kpHeadFilter',
                    'kpHeadFilterType',
                    'kpHeadFixLeft',
                    'kpHeadSort',
                    'kpHeadSortMethod',
                    'kpHeadTooltip',
                    'defHeadAlignH',
                    'defHeadDrag',
                    'defHeadFilter',
                    'defHeadFilterType',
                    'defHeadSort',
                    'defHeadSortMethod',
                ],
                kpRow: [
                    'kpRowStyle',
                    'kpRowDrag',
                ],
                kpCol: [
                    'kpColStyle',
                    'kpColSpan',
                ],
                funcs: [
                    'filterAllData',
                    'getDisplayData',
                    'downloadData',
                    'downloadDisplayData',
                    'uploadData',
                    'uploadDataWithkpConvertKeys',
                    'pasteText',
                    'fitColumns',
                    'autoFitColumns',
                    'genRowsPinnBottom',
                    'genRowsPinnTop',
                    'operateData',
                    'getInstance',
                    'highlight',
                    'setHeadFilter',
                    'filterChange',
                    'showKeys',
                    'clearHeadFilter',
                    'clearHeadFilterAll',
                ],
            },
        }
    },
    computed: {

        isNarrow: function() {
            return window.innerWidth < 1000
        },

    },
}
</script>

<style>
.item {
    transition: all 0.3s linear;
    display: inline-block;
    margin: 0px 15px 15px 0px;
    padding: 4px 15px;
    border-radius: 30px;
    cursor: pointer;
    font-size: 0.8rem;
    background-color:#f6f6f6;
}
.item-active {
    color: #fff;
    background-color:rgb(141, 32, 145);
}
.item-inactive:hover {
    background-color:#eaeaea;
}
.item-link {
    margin-right: 10px;
    padding: 2px 10px;
    font-size: 0.8rem;
    color:#f22;
    background-color:#fafafa;
    border-radius:10px;
    cursor:pointer;
    text-decoration:none;
}
</style>
