//pasteText 之正常路徑(規則帳本 R13: 列依畫面列序、略過隱藏欄與不可編輯欄)
//使用者路徑: ①開宿主頁(p1 一般、p2 供排序、p3 之 b 隱藏、p4 之 b 不可編輯) ②部分案例先以 grid API 排序(setup 例外, 模擬使用者先前點表頭排序)
//③點宿主按鈕以元件方法貼上 Tab 分隔之文字 ④貼上之文字 ⑤比對畫面儲存格文字、元件之數據與宿主 opt.rows ⑥副作用: 宿主 opt.rows 被改寫(每格新頁面, 無殘留)
//未涵蓋: 由鍵盤 Ctrl+V 觸發之路徑(剪貼簿與 window paste 事件)、固定欄之貼上規則,記於規則帳本 R13 為未驗
import assert from 'assert'
import { openPage, pageUrl, runHostCase, columnTexts, assertNoErrors } from './tools/e2e-setup.mjs'
import { waitGridIdle } from './tools/e2eLib.mjs'

//前置狀態(setup 例外)
let pre = {
    PT2_sorted: (page) => page.evaluate(() => window.__vm.$refs.p2.getApi().applyColumnState({ state: [{ colId: 'c', sort: 'desc' }] })),
}

//每格: [代號, 說明, 表格, 預期畫面各欄文字(依畫面列序), 預期元件數據]
let cases = [
    ['PT1_plain', '自第 0 列 a 欄貼上 2×2:依序寫入 a、b 兩欄兩列', '#p1',
        { a: ['1', '3'], b: ['2', '4'], c: ['c0', 'c1'] },
        [{ a: '1', b: '2', c: 'c0' }, { a: '3', b: '4', c: 'c1' }]],
    ['PT2_sorted', '依 c 降冪排序後自畫面第 0 列貼上:寫入畫面上第 0 列(原第 1 列)', '#p2',
        { a: ['9', 'a0'], b: ['b1', 'b0'], c: ['c1', 'c0'] },
        [{ a: 'a0', b: 'b0', c: 'c0' }, { a: '9', b: 'b1', c: 'c1' }]],
    ['PT3_hiddenCol', 'b 隱藏時貼上 2 欄:略過 b,寫入 a、c', '#p3',
        { a: ['1', 'a1'], c: ['2', 'c1'] },
        [{ a: '1', b: 'b0', c: '2' }, { a: 'a1', b: 'b1', c: 'c1' }]],
    ['PT4_readonlyCol', 'b 不可編輯時貼上 3 欄:b 不變,a、c 依位置寫入', '#p4',
        { a: ['1', 'a1'], b: ['b0', 'b1'], c: ['3', 'c1'] },
        [{ a: '1', b: 'b0', c: '3' }, { a: 'a1', b: 'b1', c: 'c1' }]],
]

describe('e2e-pasteText:貼上文字', function() {
    let ctx = null

    beforeEach(async function() {
        ctx = await openPage(pageUrl('pasteText.html'), { minCells: 20 })
    })

    afterEach(async function() {
        if (ctx) {
            await ctx.close()
        }
        ctx = null
    })

    for (let [id, title, sel, screen, now] of cases) {
        it(`${id} ${title}`, async function() {
            if (pre[id]) {
                await pre[id](ctx.page)
                await waitGridIdle(ctx.page, { scope: sel })
            }
            let r = await runHostCase(ctx, id)
            assert.ok(!r.out.threw, `不應拋錯: ${r.out.err}`)
            assert.deepStrictEqual(r.out.now, now, '元件之數據')
            assert.deepStrictEqual(r.out.optRows, now, '宿主之 opt.rows 同步更新')
            await waitGridIdle(ctx.page, { scope: sel })
            for (let col of Object.keys(screen)) {
                assert.deepStrictEqual(await columnTexts(ctx.page, sel, col), screen[col], `畫面 ${col} 欄`)
            }
            assertNoErrors(ctx)
        })
    }

})
