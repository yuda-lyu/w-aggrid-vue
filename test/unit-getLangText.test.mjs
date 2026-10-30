//內建字典 getLangText 之新增鍵 noRowsToShowFiltered(Gitea issue #26; 規則帳本 R24)
//unit 層: 純函式, 於 node 直接載入 src/components/getLangText.mjs, 不起瀏覽器
import assert from 'assert'
import getLangText from '../src/components/getLangText.mjs'

describe('unit-getLangText:內建字典之過濾 0 筆文字', function() {

    it('UG1 三語系皆有 noRowsToShowFiltered 且為指定之內建文字', function() {
        //spec: 三語系之內建預設文字(zh-tw 例「無符合過濾條件之資料」)
        assert.strictEqual(getLangText('zh-tw', 'noRowsToShowFiltered'), '無符合過濾條件之資料')
        assert.strictEqual(getLangText('en', 'noRowsToShowFiltered'), 'No Rows Match The Filter')
        assert.strictEqual(getLangText('zh-cn', 'noRowsToShowFiltered'), '无符合过滤条件的数据')
    })

    it('UG2 noRowsToShowFiltered 與 noRowsToShow 為不同文字(才能區分「無資料」與「過濾 0 筆」); 空表之 noRowsToShow 維持原文字', function() {
        for (const lang of ['zh-tw', 'en', 'zh-cn']) {
            const a = getLangText(lang, 'noRowsToShow')
            const b = getLangText(lang, 'noRowsToShowFiltered')
            assert.ok(a !== '' && b !== '' && a !== b, `${lang}: ${a} / ${b}`)
        }
        //未給 localeText 時行為不變: 修前 golden
        assert.strictEqual(getLangText('zh-tw', 'noRowsToShow'), '無資料可顯示')
        assert.strictEqual(getLangText('en', 'noRowsToShow'), 'No Rows To Show')
        assert.strictEqual(getLangText('zh-cn', 'noRowsToShow'), '无数据可显示')
    })

    it('UG3 語系大小寫不敏感; 未知語系回傳呼叫端給的預設值', function() {
        assert.strictEqual(getLangText('ZH-TW', 'noRowsToShowFiltered'), '無符合過濾條件之資料')
        assert.strictEqual(getLangText('fr', 'noRowsToShowFiltered', 'DEF'), 'DEF')
        assert.strictEqual(getLangText('zh-tw', 'zzUnknownKey', 'DEF'), 'DEF')
    })
})
