<template>
    <div>

        <div class="bkh">
            <div style="font-size:1.5rem;">showOverlayWhenFilteredEmpty</div>
            <a href="//yuda-lyu.github.io/w-aggrid-vue/examples/ex-showOverlayWhenFilteredEmpty.html" target="_blank" class="item-link">example</a>
            <a href="//github.com/yuda-lyu/w-aggrid-vue/blob/master/docs/examples/ex-showOverlayWhenFilteredEmpty.html" target="_blank" class="item-link">code</a>
        </div>

        <div class="bkp">

            <div id="ckdesc" style="max-width:1240px; padding-bottom:20px; font-size:10pt; line-height:1.6;">
                <div>opt.showOverlayWhenFilteredEmpty(預設 true)：數據不為空而過濾(表頭過濾或 filterall)使顯示列數為 0 時，顯示 localeText 之 noRowsToShowFiltered 提示覆蓋層(language 為 zh-tw 之內建文字為「無符合過濾條件之資料」)，顯示列數回到大於 0 時隱藏；數據本身為空(opt.rows 為空陣列)時仍顯示 noRowsToShow，呼叫端以 getApi().showLoadingOverlay() 顯示之載入中覆蓋層不會被蓋掉。文字可由 opt.localeText 覆寫(見 localeText 範例)。</div>
                <div>本範例左右兩表同樣數據、同樣於 1 秒時以表頭過濾使顯示列數為 0、3 秒時清除過濾；左表為預設(true)，右表設為 false。</div>
                <div style="padding-top:10px; color:#f26;">破壞性變更：此提示覆蓋層預設開啟。以往表頭過濾使顯示列數為 0 時，表格只剩表頭與空白而無提示(右表即為舊行為)；filterall 使數據為空時，顯示的是 noRowsToShow(與數據本身為空無法區分)。現在兩者皆改為顯示 noRowsToShowFiltered。欲恢復舊行為請設 opt.showOverlayWhenFilteredEmpty = false。</div>
            </div>

            <div style="display:flex; padding-bottom:20px; overflow-x:auto;">

                <div id="tblOn" style="position:relative; padding-right:20px;">

                    <div style="padding-bottom:5px; font-size:10pt;">showOverlayWhenFilteredEmpty: true(default)</div>

                    <WAggridVue
                        style="width:620px;"
                        ref="rftableOn"
                        :opt="optOn"
                    ></WAggridVue>

                </div>

                <div id="tblOff" style="position:relative;">

                    <div style="padding-bottom:5px; font-size:10pt;">showOverlayWhenFilteredEmpty: false</div>

                    <WAggridVue
                        style="width:620px;"
                        ref="rftableOff"
                        :opt="optOff"
                    ></WAggridVue>

                </div>

            </div>

            <div style="padding-bottom:40px;">

                <pre id="ckmsg"></pre>

                <div :style="`border:1px solid #ddd; width:600px; min-width:600px; height:300px; overflow-y:auto;`">
                    <div style="padding-left:5px;">
                        <div id="optjson" style="font-size:10pt;"></div>
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
            'optOn': {
                keys: ['make', 'model', 'price'],
                kpHeadFilterType: { //default: num (num,text,time,set)
                    'make': 'text',
                    'model': 'text',
                    'price': 'num',
                },
                language: 'zh-tw',
                rows: JSON.parse(JSON.stringify(window.dataEasy)),
            },
            'optOff': {
                keys: ['make', 'model', 'price'],
                kpHeadFilterType: { //default: num (num,text,time,set)
                    'make': 'text',
                    'model': 'text',
                    'price': 'num',
                },
                language: 'zh-tw',
                showOverlayWhenFilteredEmpty: false,
                rows: JSON.parse(JSON.stringify(window.dataEasy)),
            },
            'action': [
            ],
        }
    },
    mounted: function() {
        let vo = this
        jv({ optOn: vo.optOn, optOff: vo.optOff }, document.querySelector('#optjson'), { expanded: true })

        //msg
        let msg = function(s) {
            document.querySelector('#ckmsg').innerText = s
        }
        msg('0s: rows has data, no overlay')

        //setHeadFilter, displayed rows is 0, left table shows noRowsToShowFiltered, right table (false) shows nothing
        setTimeout(function() {
            try {
                msg('1s: setHeadFilter make=zzz, displayed rows is 0, left shows the overlay, right (false) shows nothing')
                vo.$refs.rftableOn.setHeadFilter('make', 'zzz')
                    .catch(() => {})
                vo.$refs.rftableOff.setHeadFilter('make', 'zzz')
                    .catch(() => {})
            }
            catch (err) {
                console.log(err)
            }
        }, 1000)

        //clearHeadFilter, overlay hidden
        setTimeout(function() {
            try {
                msg('3s: clearHeadFilter make, overlay hidden')
                vo.$refs.rftableOn.clearHeadFilter('make')
                    .catch(() => {})
                vo.$refs.rftableOff.clearHeadFilter('make')
                    .catch(() => {})
            }
            catch (err) {
                console.log(err)
            }
        }, 3000)

    },
}
</script>

<style>
</style>
