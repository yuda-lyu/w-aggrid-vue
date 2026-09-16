<template>
    <div>

        <div class="bkh">
            <div style="font-size:1.5rem;">slot: cell-render (align)</div>
            <a href="//yuda-lyu.github.io/w-aggrid-vue/examples/ex-slotCellRenderAlign.html" target="_blank" class="item-link">example</a>
            <a href="//github.com/yuda-lyu/w-aggrid-vue/blob/master/docs/examples/ex-slotCellRenderAlign.html" target="_blank" class="item-link">code</a>
        </div>

        <div class="bkp">

            <div style="display:flex; padding-bottom:40px; overflow-x:auto;">

                <div style="position:relative;">

                    <WAggridVue
                        style="width:620px;"
                        ref="rftable"
                        :opt="opt"
                    >
                        <template v-slot:cell-render="props">
                            <!-- 無wrapper: 固定高度控制項以行內排版放入儲存格, 垂直位置會偏下 -->
                            <span v-if="props.key==='noWrap'" style="display:inline-block; vertical-align:middle; width:56px; height:22px; line-height:20px; text-align:center; box-sizing:border-box; border:1px solid #bbb; border-radius:4px;">{{ props.value }}</span>
                            <!-- 有wrapper: 於slot內包一層display:flex與height:100%之容器, align-items控制上下, justify-content控制左右, 左右須與該欄kpCellAlignH一致 -->
                            <span v-else-if="props.key==='center'" style="display:flex; align-items:center; justify-content:center; height:100%;"><span style="display:inline-block; width:56px; height:22px; line-height:20px; text-align:center; box-sizing:border-box; border:1px solid #bbb; border-radius:4px;">{{ props.value }}</span></span>
                            <span v-else-if="props.key==='top'" style="display:flex; align-items:flex-start; justify-content:center; height:100%;"><span style="display:inline-block; width:56px; height:22px; line-height:20px; text-align:center; box-sizing:border-box; border:1px solid #bbb; border-radius:4px;">{{ props.value }}</span></span>
                            <span v-else-if="props.key==='bottom'" style="display:flex; align-items:flex-end; justify-content:center; height:100%;"><span style="display:inline-block; width:56px; height:22px; line-height:20px; text-align:center; box-sizing:border-box; border:1px solid #bbb; border-radius:4px;">{{ props.value }}</span></span>
                            <span v-else-if="props.key==='left'" style="display:flex; align-items:center; justify-content:flex-start; height:100%;"><span style="display:inline-block; width:56px; height:22px; line-height:20px; text-align:center; box-sizing:border-box; border:1px solid #bbb; border-radius:4px;">{{ props.value }}</span></span>
                            <span v-else-if="props.key==='right'" style="display:flex; align-items:center; justify-content:flex-end; height:100%;"><span style="display:inline-block; width:56px; height:22px; line-height:20px; text-align:center; box-sizing:border-box; border:1px solid #bbb; border-radius:4px;">{{ props.value }}</span></span>
                            <span v-else>{{ props.value }}</span>
                        </template>
                    </WAggridVue>

                    <pre id="ckmsg"></pre>

                </div>

                <div style="padding:0px 20px;">

                    <div :style="`border:1px solid #ddd; width:600px; min-width:600px; height:300px; overflow-y:auto;`">
                        <div style="padding-left:5px;">
                            <div id="optjson" style="font-size:10pt;"></div>
                        </div>
                    </div>

                </div>

            </div>

        </div>

    </div>
</template>

<script>
import WAggridVue from './components/WAggridVue.vue'
import jv from 'w-jsonview-tree'

export default {
    components: {
        WAggridVue,
    },
    data: function() {
        return {
            'opt': {
                keys: ['noWrap', 'center', 'top', 'bottom', 'left', 'right'],
                kpHead: {
                    'noWrap': 'no wrap',
                    'center': 'center',
                    'top': 'top',
                    'bottom': 'bottom',
                    'left': 'left',
                    'right': 'right',
                },
                kpHeadWidth: {
                    'noWrap': 100,
                    'center': 100,
                    'top': 100,
                    'bottom': 100,
                    'left': 100,
                    'right': 100,
                },
                kpCellAlignH: { //wrapper之justify-content須與此一致
                    'left': 'left',
                    'right': 'right',
                },
                kpHeadFilterType: { //default: num (num,text,time,set)
                    'noWrap': 'text',
                    'center': 'text',
                    'top': 'text',
                    'bottom': 'text',
                    'left': 'text',
                    'right': 'text',
                },
                rows: [
                    { 'noWrap': 'OR', 'center': 'OR', 'top': 'OR', 'bottom': 'OR', 'left': 'OR', 'right': 'OR' },
                    { 'noWrap': 'AND', 'center': 'AND', 'top': 'AND', 'bottom': 'AND', 'left': 'AND', 'right': 'AND' },
                    { 'noWrap': 'OR', 'center': 'OR', 'top': 'OR', 'bottom': 'OR', 'left': 'OR', 'right': 'OR' },
                ],
            },
            'action': [
            ],
        }
    },
    mounted: function() {
        let vo = this
        jv(vo.opt, document.querySelector('#optjson'), { expanded: true })
    },
}
</script>

<style>
</style>
