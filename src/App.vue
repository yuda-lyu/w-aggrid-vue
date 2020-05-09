<template>
    <div id="app">


        <template v-if="!isNarrow">
            <a href="https://github.com/yuda-lyu/w-aggrid-vue" class="github-corner" style="position:fixed; top:0; right:0; border:0; z-index:10000;" aria-label="View source on GitHub" target="_blank">
                <svg width="80" height="80" viewBox="0 0 250 250" style="fill:rgba(0,0,0,0.25); color:#fff; position: absolute; top: 0; border: 0; right: 0;" aria-hidden="true"><path d="M0,0 L115,115 L130,115 L142,142 L250,250 L250,0 Z"></path><path d="M128.3,109.0 C113.8,99.7 119.0,89.6 119.0,89.6 C122.0,82.7 120.5,78.6 120.5,78.6 C119.2,72.0 123.4,76.3 123.4,76.3 C127.3,80.9 125.5,87.3 125.5,87.3 C122.9,97.6 130.6,101.9 134.4,103.2" fill="currentColor" style="transform-origin: 130px 106px;" class="octo-arm"></path><path d="M115.0,115.0 C114.9,115.1 118.7,116.5 119.8,115.4 L133.7,101.6 C136.9,99.2 139.9,98.4 142.2,98.6 C133.8,88.0 127.5,74.4 143.8,58.0 C148.5,53.4 154.0,51.2 159.7,51.0 C160.3,49.4 163.2,43.6 171.4,40.1 C171.4,40.1 176.1,42.5 178.8,56.2 C183.1,58.6 187.2,61.8 190.9,65.4 C194.5,69.0 197.7,73.2 200.1,77.6 C213.8,80.2 216.3,84.9 216.3,84.9 C212.7,93.1 206.9,96.0 205.4,96.6 C205.1,102.4 203.0,107.8 198.3,112.5 C181.9,128.9 168.3,122.5 157.7,114.1 C157.9,116.9 156.7,120.9 152.7,124.9 L141.0,136.5 C139.8,137.7 141.6,141.9 141.8,141.8 Z" fill="currentColor" class="octo-body"></path></svg>
            </a>
        </template>


        <div
            style="position:fixed; left:0; top:0; z-index:10;"
            @mouseenter="showMenu=true"
            @mouseleave="showMenu=false"
        >
            <div :class="`${showMenu?'item-shadow':''}`" :style="`transition:all 0.1s; padding:20px 0px 0px 0px; background-color:#fff; width:${showMenu?'100vw':'80px'}; ${showMenu?'':'overflow-x:hidden;'}`">
                <template v-for="(mcmp,kmcmp) in mcmps">
                    <div style="display:table; width:98.75vw;" :key="kmcmp">
                        <div :style="`display:table-cell; padding-right:10px; width:65px; text-align:right; color:${showMenu?'#e7c':'#444'}; font-size:0.9rem; transition:all 0.2s; opacity:${showMenu?1:0.7};`">{{kmcmp}}</div>
                        <div :style="`display:table-cell; padding-left:10px; transition:all 0.2s; opacity:${showMenu?1:0};`">
                            <template v-for="(cmp,kcmp) in mcmp">
                                <div
                                    :class="`item ${cmp===showCmp?'item-active':'item-inactive'}`"
                                    style="position:relative;"
                                    :key="kcmp"
                                    @click="showCmp=cmp;showMenu=false;"
                                >

                                    <span>{{cmp}}</span>

                                    <div
                                        style="position:absolute; top:-5px; right:-10px; padding:1px 7px; opacity:0.8; font-size:0.5rem; color:#fff; background-color:#f26; border-radius:10px;"
                                        v-if="cmp[0]==='d'"
                                    >
                                        def
                                    </div>

                                </div>
                            </template>
                        </div>
                    </div>
                </template>
            </div>
        </div>


        <div style="display:flex;">

            <div
                style="padding:0px 40px;"
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

                    <AppDefCellAlighH v-if="showCmp==='defCellAlighH'"></AppDefCellAlighH>

                    <AppDefCellEditable v-if="showCmp==='defCellEditable'"></AppDefCellEditable>

                    <AppDefCellMinWidth v-if="showCmp==='defCellMinWidth'"></AppDefCellMinWidth>

                    <AppDefHeadAlighH v-if="showCmp==='defHeadAlighH'"></AppDefHeadAlighH>

                    <AppDefHeadDrag v-if="showCmp==='defHeadDrag'"></AppDefHeadDrag>

                    <AppDefHeadFilter v-if="showCmp==='defHeadFilter'"></AppDefHeadFilter>

                    <AppDefHeadSort v-if="showCmp==='defHeadSort'"></AppDefHeadSort>

                    <AppFilterAllData v-if="showCmp==='filterAllData'"></AppFilterAllData>

                    <AppGetDisplayData v-if="showCmp==='getDisplayData'"></AppGetDisplayData>

                    <AppFitColumns v-if="showCmp==='fitColumns'"></AppFitColumns>

                    <AppAutoFitColumns v-if="showCmp==='autoFitColumns'"></AppAutoFitColumns>

                    <AppGetInstance v-if="showCmp==='getInstance'"></AppGetInstance>

                    <AppHighlight v-if="showCmp==='highlight'"></AppHighlight>

                    <AppKpCellAlighH v-if="showCmp==='kpCellAlighH'"></AppKpCellAlighH>

                    <AppKpCellEditable v-if="showCmp==='kpCellEditable'"></AppKpCellEditable>

                    <AppKpCellRender v-if="showCmp==='kpCellRender'"></AppKpCellRender>

                    <AppKpCellTooltip v-if="showCmp==='kpCellTooltip'"></AppKpCellTooltip>

                    <AppKpCellWidth v-if="showCmp==='kpCellWidth'"></AppKpCellWidth>

                    <AppKpHead v-if="showCmp==='kpHead'"></AppKpHead>

                    <AppKpHeadAlighH v-if="showCmp==='kpHeadAlighH'"></AppKpHeadAlighH>

                    <AppKpHeadDrag v-if="showCmp==='kpHeadDrag'"></AppKpHeadDrag>

                    <AppKpHeadFilter v-if="showCmp==='kpHeadFilter'"></AppKpHeadFilter>

                    <AppKpHeadFixLeft v-if="showCmp==='kpHeadFixLeft'"></AppKpHeadFixLeft>

                    <AppKpHeadSort v-if="showCmp==='kpHeadSort'"></AppKpHeadSort>

                    <AppKpHeadTooltip v-if="showCmp==='kpHeadTooltip'"></AppKpHeadTooltip>

                    <AppKpRowDrag v-if="showCmp==='kpRowDrag'"></AppKpRowDrag>

                    <AppKpRowStyle v-if="showCmp==='kpRowStyle'"></AppKpRowStyle>

                    <AppLargeData v-if="showCmp==='largeData'"></AppLargeData>

                    <AppOperateData v-if="showCmp==='operateData'"></AppOperateData>

                    <AppRowChange v-if="showCmp==='rowChange'"></AppRowChange>

                    <AppRowMouseEnter v-if="showCmp==='rowMouseEnter'"></AppRowMouseEnter>

                    <AppRowMouseLeave v-if="showCmp==='rowMouseLeave'"></AppRowMouseLeave>

                    <AppRowClick v-if="showCmp==='rowClick'"></AppRowClick>

                    <AppRowDbClick v-if="showCmp==='rowDbClick'"></AppRowDbClick>

                    <AppSetHeadFilter v-if="showCmp==='setHeadFilter'"></AppSetHeadFilter>

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
import AppDefCellAlighH from './AppDefCellAlighH.vue'
import AppDefCellEditable from './AppDefCellEditable.vue'
import AppDefCellMinWidth from './AppDefCellMinWidth.vue'
import AppDefHeadAlighH from './AppDefHeadAlighH.vue'
import AppDefHeadDrag from './AppDefHeadDrag.vue'
import AppDefHeadFilter from './AppDefHeadFilter.vue'
import AppDefHeadSort from './AppDefHeadSort.vue'
import AppFilterAllData from './AppFilterAllData.vue'
import AppGetDisplayData from './AppGetDisplayData.vue'
import AppFitColumns from './AppFitColumns.vue'
import AppAutoFitColumns from './AppAutoFitColumns.vue'
import AppGetInstance from './AppGetInstance.vue'
import AppHighlight from './AppHighlight.vue'
import AppKpCellAlighH from './AppKpCellAlighH.vue'
import AppKpCellEditable from './AppKpCellEditable.vue'
import AppKpCellRender from './AppKpCellRender.vue'
import AppKpCellTooltip from './AppKpCellTooltip.vue'
import AppKpCellWidth from './AppKpCellWidth.vue'
import AppKpHead from './AppKpHead.vue'
import AppKpHeadAlighH from './AppKpHeadAlighH.vue'
import AppKpHeadDrag from './AppKpHeadDrag.vue'
import AppKpHeadFilter from './AppKpHeadFilter.vue'
import AppKpHeadFixLeft from './AppKpHeadFixLeft.vue'
import AppKpHeadSort from './AppKpHeadSort.vue'
import AppKpHeadTooltip from './AppKpHeadTooltip.vue'
import AppKpRowDrag from './AppKpRowDrag.vue'
import AppKpRowStyle from './AppKpRowStyle.vue'
import AppLargeData from './AppLargeData.vue'
import AppOperateData from './AppOperateData.vue'
import AppRowChange from './AppRowChange.vue'
import AppRowMouseEnter from './AppRowMouseEnter.vue'
import AppRowMouseLeave from './AppRowMouseLeave.vue'
import AppRowClick from './AppRowClick.vue'
import AppRowDbClick from './AppRowDbClick.vue'
import AppSetHeadFilter from './AppSetHeadFilter.vue'
import AppShowKeys from './AppShowKeys.vue'
import AppSimpleData from './AppSimpleData.vue'
import AppTableHeight from './AppTableHeight.vue'
import AppTableWidth from './AppTableWidth.vue'
import AppTableWidthFull from './AppTableWidthFull.vue'


export default {
    name: 'app',
    components: {
        AppCellChange,
        AppCellMouseEnter,
        AppCellMouseLeave,
        AppCellClick,
        AppCellDbClick,
        AppClearHeadFilter,
        AppClearHeadFilterAll,
        AppDefCellAlighH,
        AppDefCellEditable,
        AppDefCellMinWidth,
        AppDefHeadAlighH,
        AppDefHeadDrag,
        AppDefHeadFilter,
        AppDefHeadSort,
        AppFilterAllData,
        AppGetDisplayData,
        AppFitColumns,
        AppAutoFitColumns,
        AppGetInstance,
        AppHighlight,
        AppKpCellAlighH,
        AppKpCellEditable,
        AppKpCellRender,
        AppKpCellTooltip,
        AppKpCellWidth,
        AppKpHead,
        AppKpHeadAlighH,
        AppKpHeadDrag,
        AppKpHeadFilter,
        AppKpHeadFixLeft,
        AppKpHeadSort,
        AppKpHeadTooltip,
        AppKpRowDrag,
        AppKpRowStyle,
        AppLargeData,
        AppOperateData,
        AppRowChange,
        AppRowMouseEnter,
        AppRowMouseLeave,
        AppRowClick,
        AppRowDbClick,
        AppSetHeadFilter,
        AppShowKeys,
        AppSimpleData,
        AppTableHeight,
        AppTableWidth,
        AppTableWidthFull,
    },
    data: function() {
        return {
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
                    'rowChange',
                    'rowMouseEnter',
                    'rowMouseLeave',
                    'rowClick',
                    'rowDbClick',
                ],
                kpCell: [
                    'kpCellAlighH',
                    'kpCellEditable',
                    'kpCellRender',
                    'kpCellTooltip',
                    'kpCellWidth',
                    'defCellAlighH',
                    'defCellEditable',
                    'defCellMinWidth',
                ],
                kpHead: [
                    'kpHead',
                    'kpHeadAlighH',
                    'kpHeadDrag',
                    'kpHeadFilter',
                    'kpHeadFixLeft',
                    'kpHeadSort',
                    'kpHeadTooltip',
                    'defHeadAlighH',
                    'defHeadDrag',
                    'defHeadFilter',
                    'defHeadSort',
                ],
                kpRow: [
                    'kpRowDrag',
                    'kpRowStyle',
                ],
                funcs: [
                    'filterAllData',
                    'getDisplayData',
                    'fitColumns',
                    'autoFitColumns',
                    'operateData',
                    'getInstance',
                    'highlight',
                    'setHeadFilter',
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
    margin: 0px 15px 20px 0px;
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
.item-shadow {
    box-shadow:0 3px 1px -2px rgba(0,0,0,.2),0 2px 2px 0 rgba(0,0,0,.14),0 1px 5px 0 rgba(0,0,0,.12);
}
</style>
