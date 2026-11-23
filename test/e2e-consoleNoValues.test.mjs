//貼上時 kpCellEditable 函數拋錯之 console 輸出不印使用者函數之錯誤訊息原文(規則帳本 R28; R22.3; 依跨套件規格〈診斷輸出與遮罩〉D2)
//其餘站點之輸出由 api-consoleNoValues 驗(宿主按鈕呼叫元件方法); 本檔只驗使用者可操作到之路徑: 貼上
//每案之使用者路徑(6 步): ①開宿主頁 test/pages/consoleNoValues.html(表 tp: b 欄 editable 為函數, 第 1 列之該函數拋出含 CANARY 之錯誤) ②無前置操作
//  ③真滑鼠單擊起點儲存格(第 0 列 a 欄, 可編輯格 singleClickEdit 會開編輯器, Escape 離開而保留焦點) ④剪貼簿為 Tab/換行分隔之 2×2 文字(setup: headless 瀏覽器之剪貼簿與作業系統隔離, 授權後以頁面剪貼簿 API 寫入)
//  ⑤真鍵盤 Ctrl+V ⑥觀察: 畫面各欄儲存格文字、console 輸出(各引數之 JSON 與 text)、opt.funLog 所收
//標準圖: 本套件未產製標準圖(規則帳本 7.4/9, 待使用者裁示), 本檔不新增
import assert from 'assert'
import { openPage, pageUrl, columnTexts, waitColumnTexts, assertNoErrors, pasteByKeyboard } from './tools/e2e-setup.mjs'
import { waitGridIdle } from './tools/e2eLib.mjs'
import { captureConsole, own, hasText, PREFIX } from './tools/consoleCapture.mjs'

const TEXT = 'p1\tp2\np3\tp4'
const LABEL = `${PREFIX} pasteText: kpCellEditable threw, the cell is treated as not editable`

describe('e2e-consoleNoValues:貼上時 kpCellEditable 拋錯之 console 輸出(R28)', function() {
    let ctx = null

    afterEach(async function() {
        if (ctx) {
            await ctx.close()
        }
        ctx = null
    })

    //paste, 開頁、真滑鼠單擊起點格 + 真鍵盤 Ctrl+V、等畫面終態; 回傳 console 擷取與 funLog 收集
    async function paste(query) {
        ctx = await openPage(pageUrl('consoleNoValues.html') + query, { minCells: 4 })
        let { page } = ctx
        await page.context().grantPermissions(['clipboard-read', 'clipboard-write'])
        await waitGridIdle(page, { scope: '#tp' })
        let cap = captureConsole(page)
        ctx.logs.length = 0
        ctx.pageErrors.length = 0
        //act
        await pasteByKeyboard(page, '#tp', TEXT, 0, 'a')
        //assert: 第 1 列 b 之 editable 函數拋錯 → 該格視為不可編輯(不寫), 其餘格寫入(畫面為使用者看得到之結果)
        await waitColumnTexts(page, '#tp', 'a', ['p1', 'p3'])
        await waitGridIdle(page, { scope: '#tp' })
        assert.deepStrictEqual(await columnTexts(page, '#tp', 'a'), ['p1', 'p3'])
        assert.deepStrictEqual(await columnTexts(page, '#tp', 'b'), ['p2', 'b1'], '拋錯之格不寫入、其餘寫入')
        assertNoErrors(ctx)
        return { items: await cap.items(), funLogs: await page.evaluate(() => window.__funLogs) }
    }

    it('CNV-001 預設:貼上後 console 恰一則說明, 為固定詞彙加欄位 key 與錯誤類別, 不含錯誤訊息原文、列值與堆疊', async function() {
        let { items } = await paste('')
        //spec D2: 預設只輸出固定詞彙、鍵名與型別; 錯誤訊息原文('CANARY-EDIT a1', 含該列之值)與堆疊不輸出
        assert.deepStrictEqual(own(items).map((m) => m.args), [[LABEL, { colKey: 'b', errType: 'Error' }]])
        assert.ok(!hasText(items, 'CANARY'), `console 不得含錯誤訊息原文: ${JSON.stringify(items.map((m) => m.text))}`)
        assert.ok(!items.some((m) => m.text.includes('\n    at ')), '輸出不得含堆疊')
    })

    it('CNV-002 opt.funLog 給函數:說明改交 funLog(label, safe, detail), 細節含錯誤訊息原文, console 無本套件輸出', async function() {
        let { items, funLogs } = await paste('?fl=collect')
        assert.deepStrictEqual(own(items), [], 'console 無本套件輸出')
        assert.strictEqual(funLogs.length, 1)
        assert.deepStrictEqual([funLogs[0].label, funLogs[0].safe, funLogs[0].n], [LABEL, { colKey: 'b', errType: 'Error' }, 3])
        assert.ok(funLogs[0].detail.includes('CANARY-EDIT a1'), funLogs[0].detail)
    })

    it('CNV-003 opt.funLog 為空函數:本套件 console 輸出關閉, 貼上結果不變', async function() {
        let { items } = await paste('?fl=noop')
        assert.deepStrictEqual(own(items), [], 'console 無本套件輸出')
    })

    it('CNV-004 opt.logDetail 為 true:console 改印遮罩後之細節(含錯誤訊息原文), label 不變', async function() {
        let { items } = await paste('?ld=1')
        let mine = own(items)
        assert.strictEqual(mine.length, 1)
        assert.strictEqual(mine[0].args[0], LABEL)
        assert.ok(mine[0].text.includes('CANARY-EDIT a1'), mine[0].text)
    })
})
