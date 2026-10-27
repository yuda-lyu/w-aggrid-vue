//使用者貼上(Ctrl+V)之正常路徑(規則帳本 R13: 列依畫面列序、略過隱藏欄與不可編輯欄)
//每案之使用者路徑(6 步, 全案相同, 差異見各案說明):
//  ①開宿主頁 test/pages/pasteText.html(p1 一般、p2 供點表頭排序、p3 之 b 隱藏、p4 之 b 不可編輯; 頁內沒有貼上按鈕)
//  ②需要時先在畫面上排序(真滑鼠點表頭)
//  ③真滑鼠單擊起點儲存格(取得焦點; 可編輯格 singleClickEdit 會開編輯器, 按 Escape 離開編輯器而保留焦點)
//  ④剪貼簿為 Tab/換行分隔之文字(headless 瀏覽器之剪貼簿與作業系統隔離, 授權後以頁面剪貼簿 API 寫入, 屬 setup) ⑤真鍵盤 Ctrl+V
//  ⑥觀察: 畫面各欄儲存格文字(主)、宿主 opt.rows(同步更新)、元件數據(getNowData)、console 與 pageerror
//觸發貼上之入口: 只有 agCellKeyDown(Ctrl+KeyV), 見 e2e-pasteEditable.test.mjs 首註解
//公開方法 pasteText 之程式呼叫契約(宿主按鈕呼叫, 不經使用者貼上動作)見 api-pasteText.test.mjs(PA1–PA4); 函數型 kpCellEditable 見 e2e-pasteEditable.test.mjs
//未涵蓋: 固定欄之貼上規則, 記於規則帳本 R13 為未驗
//標準圖: 本套件未產製標準圖(規則帳本 7.4/9, 待使用者裁示), 本檔不新增; 視覺面以畫面儲存格文字之語意斷言代替
import assert from 'assert'
import { openPage, pageUrl, columnTexts, waitColumnTexts, assertNoErrors, pasteByKeyboard, hostRows, nowRows, waitRows } from './tools/e2e-setup.mjs'
import { waitGridIdle, waitUntilExist } from './tools/e2eLib.mjs'

//pre: 貼上前使用者先做的畫面操作(真滑鼠)
let pre = {
    //點 c 欄表頭兩次: 升冪 → 降冪(第一次點後等排序生效再點第二次, 避免被當成雙擊; 升冪時列序與原序相同, 以表頭格之 aria-sort 為訊號)
    sortDescByC: async (page, sel) => {
        let head = `${sel} .ag-header-row-column .ag-header-cell[col-id="c"]`
        await page.locator(head).click()
        await waitUntilExist(page, `${sel} c 欄升冪`, (s) => document.querySelector(s).getAttribute('aria-sort') === 'ascending', { timeout: 10000, arg: head })
        await page.locator(head).click()
        await waitUntilExist(page, `${sel} c 欄降冪`, (s) => document.querySelector(s).getAttribute('aria-sort') === 'descending', { timeout: 10000, arg: head })
        await waitColumnTexts(page, sel, 'c', ['c1', 'c0'])
    },
}

//每案: { id, title, sel, text(剪貼簿), start(起點格: 畫面列序、欄 id), pre, optRows(預期宿主 opt.rows), screen(預期畫面各欄文字,依畫面列序) }
//opt.rows 與元件數據(getNowData)在本檔之列只有 a、b、c 三個 keys, 故兩者相同
let cases = [
    {
        id: 'PT1_plain',
        title: '自第 0 列 a 欄貼上 2×2:依序寫入 a、b 兩欄兩列',
        sel: '#p1',
        text: '1\t2\n3\t4',
        start: [0, 'a'],
        optRows: [{ a: '1', b: '2', c: 'c0' }, { a: '3', b: '4', c: 'c1' }],
        screen: { a: ['1', '3'], b: ['2', '4'], c: ['c0', 'c1'] },
    },
    {
        id: 'PT2_sorted',
        title: '點 c 表頭排成降冪後自畫面第 0 列貼上:寫入畫面上第 0 列(原第 1 列)',
        sel: '#p2',
        text: '9',
        start: [0, 'a'],
        pre: 'sortDescByC',
        optRows: [{ a: 'a0', b: 'b0', c: 'c0' }, { a: '9', b: 'b1', c: 'c1' }],
        screen: { a: ['9', 'a0'], b: ['b1', 'b0'], c: ['c1', 'c0'] },
    },
    {
        id: 'PT3_hiddenCol',
        title: 'b 隱藏時貼上 2 欄:略過 b,寫入 a、c',
        sel: '#p3',
        text: '1\t2',
        start: [0, 'a'],
        optRows: [{ a: '1', b: 'b0', c: '2' }, { a: 'a1', b: 'b1', c: 'c1' }],
        screen: { a: ['1', 'a1'], c: ['2', 'c1'] },
    },
    {
        id: 'PT4_readonlyCol',
        title: 'b 不可編輯時貼上 3 欄:b 不變,a、c 依位置寫入',
        sel: '#p4',
        text: '1\t2\t3',
        start: [0, 'a'],
        optRows: [{ a: '1', b: 'b0', c: '3' }, { a: 'a1', b: 'b1', c: 'c1' }],
        screen: { a: ['1', 'a1'], b: ['b0', 'b1'], c: ['3', 'c1'] },
    },
]

describe('e2e-pasteText:使用者貼上(Ctrl+V)', function() {
    let ctx = null

    beforeEach(async function() {
        ctx = await openPage(pageUrl('pasteText.html'), { minCells: 20 })
        //setup: 授權頁面讀寫(headless 瀏覽器之)剪貼簿
        await ctx.page.context().grantPermissions(['clipboard-read', 'clipboard-write'])
    })

    afterEach(async function() {
        if (ctx) {
            await ctx.close()
        }
        ctx = null
    })

    for (let c of cases) {
        it(`${c.id} ${c.title}`, async function() {
            let { page } = ctx
            let key = c.sel.slice(1)
            //宿主頁含多張表, 開頁之等待不保證目標表已渲染, 故先等目標表靜止
            await waitGridIdle(page, { scope: c.sel })
            if (c.pre) {
                await pre[c.pre](page, c.sel)
                await waitGridIdle(page, { scope: c.sel })
            }
            //貼上前之畫面操作不得有錯
            assertNoErrors(ctx)

            //act: 真滑鼠單擊起點格 + 真鍵盤 Ctrl+V
            await pasteByKeyboard(page, c.sel, c.text, c.start[0], c.start[1])

            //assert: 等宿主 opt.rows 達預期終態, 靜止後再確認未有後續變動
            await waitRows(page, key, c.optRows)
            await waitGridIdle(page, { scope: c.sel })
            assert.deepStrictEqual(await hostRows(page, key), c.optRows, '宿主之 opt.rows')
            assert.deepStrictEqual(await nowRows(page, key), c.optRows, '元件之數據')
            //使用者看得到的結果: 畫面各欄儲存格文字
            for (let col of Object.keys(c.screen)) {
                assert.deepStrictEqual(await columnTexts(page, c.sel, col), c.screen[col], `畫面 ${col} 欄`)
            }
            assertNoErrors(ctx)
        })
    }

})
