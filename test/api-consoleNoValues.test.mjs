//診斷輸出(console)不印資料值(規則帳本 R28; 依跨套件規格〈診斷輸出與遮罩〉D1、D2、D4)
//層級 api-: 以宿主頁按鈕呼叫元件公開方法(同官方範例「按鈕呼叫元件方法」之用法), 驗各 console 站點之輸出; 不經使用者操作之路徑
//(fitColumns、triggerFilterChange、finishFade 之 catch 於表格可用時不拋錯, 以替換該實例 api 之方法造成, 屬 setup 例外; 使用者操作之貼上路徑見 e2e-consoleNoValues)
//每格以 CANARY 字樣(或獨特數字)為使用者給之值, 斷言預設輸出之全部引數(text 與各引數之 JSON)皆不含; 並逐站驗 opt.funLog、opt.logDetail 之接線
import assert from 'assert'
import { openPage, pageUrl, runHostCase } from './tools/e2e-setup.mjs'
import { captureConsole, own, hasText, PREFIX } from './tools/consoleCapture.mjs'

const P = PREFIX
let V = (shape) => ({ valueShape: shape })
let CANARIES = ['CANARY', '987654321']

//wsemiOut, 相依之 wsemi 自行寫出之診斷輸出(第 1 引數以 '[wsemi ' 起首, 為其診斷出口 label 之格式)
//wsemi 之 downloadExcelFileFromData 於寫檔器拒絕時, 未給 funLog 即預設自行 console.log 一則(固定詞彙加 { errType }); 本套件以本地 funLog 取回原生錯誤並只輸出本套件一則(R28 規則 5), 故任何情形下皆為 0 則
let wsemiOut = (items) => items.filter((m) => typeof m.args[0] === 'string' && m.args[0].startsWith('[wsemi '))

//CASES: 案例 → { desc, items: 預設(未給 funLog、logDetail)時本套件之 console 輸出, 各項為 [label, safe(可省)]; detail: 交 funLog 之細節文字須含之字串(省略者該站無細節); noOpt: opt 本身無效、無法攜帶 funLog }
let CASES = {
    //R01 logUseDefault 之各站(downloadCore 6、showKeys 2、uploadData 4)
    dl_opt: { desc: 'downloadData opt 為字串', items: [[`${P} downloadData: invalid opt, use default opt {}`, V('(string)')]], detail: ['CANARY-DL-OPT'] },
    dl_hook: { desc: 'downloadData funGetKeysHook 為字串', items: [[`${P} downloadData: invalid funGetKeysHook, use default funGetKeysHook null`, V('(string)')]], detail: ['CANARY-DL-HOOK'] },
    dl_useHead: { desc: 'downloadData useHead 為字串', items: [[`${P} downloadData: invalid useHead, use default useHead false`, V('(string)')]], detail: ['CANARY-DL-USEHEAD'] },
    dl_useFormat: { desc: 'downloadData useFormat 為字串', items: [[`${P} downloadData: invalid useFormat, use default useFormat true`, V('(string)')]], detail: ['CANARY-DL-USEFORMAT'] },
    dl_fileName: { desc: 'downloadData fileName 為數字', items: [[`${P} downloadData: invalid fileName, use default fileName 'data.xlsx'`, V('(number)')]], detail: ['987654321'] },
    dl_sheetName: { desc: 'downloadData sheetName 含 /', items: [[`${P} downloadData: invalid sheetName, use default sheetName 'data'`, V('(string)')]], detail: ['CANARY/SHEET'] },
    dd_opt: { desc: 'downloadDisplayData opt 為字串', items: [[`${P} downloadDisplayData: invalid opt, use default opt {}`, V('(string)')]], detail: ['CANARY-DD-OPT'] },
    up_opt: { desc: 'uploadData opt 為字串', items: [[`${P} uploadData: invalid opt, use default opt {}`, V('(string)')]], detail: ['CANARY-UP-OPT'] },
    up_hook: { desc: 'uploadData beforeUpload 為字串', items: [[`${P} uploadData: invalid beforeUpload, use default beforeUpload null`, V('(string)')]], detail: ['CANARY-UP-HOOK'] },
    up_mode: { desc: 'uploadData uploadMode 為字串', items: [[`${P} uploadData: invalid uploadMode, use default uploadMode 'replace'`, V('(string)')]], detail: ['CANARY-UP-MODE'] },
    up_ind: { desc: 'uploadData parseSheetInd 為字串', items: [[`${P} uploadData: invalid parseSheetInd, use default parseSheetInd 0`, V('(string)')]], detail: ['CANARY-UP-IND'] },
    sk_opt: { desc: 'showKeys opt 為字串', items: [[`${P} showKeys: invalid opt, use default opt {}`, V('(string)')]], detail: ['CANARY-SK-OPT'] },
    sk_apply: { desc: 'showKeys applyOrder 為字串', items: [[`${P} showKeys: invalid applyOrder, use default applyOrder true`, V('(string)')]], detail: ['CANARY-SK-APPLY'] },
    //元件 prop opt 之選項(logUseDefaultOpt 2 站)
    mt_localeText: {
        desc: 'prop opt.localeText 與 showOverlayWhenFilteredEmpty 為字串',
        items: [[`${P} opt.localeText is invalid, use default {}`, V('(string)')], [`${P} opt.showOverlayWhenFilteredEmpty is invalid, use default true`, V('(string)')]],
        detail: ['CANARY-MT-LT', 'CANARY-MT-SO']
    },
    mt_localeEntry: {
        desc: 'prop opt.localeText 之值為數字與陣列(有效鍵不提示)',
        items: [[`${P} opt.localeText[<key>] is invalid, use default text`, { localeKey: 'noRowsToShow', valueShape: '(number)' }], [`${P} opt.localeText[<key>] is invalid, use default text`, { localeKey: 'noRowsToShowFiltered', valueShape: '(array, length=1)' }]],
        detail: ['987654321', 'CANARY-MT-ARR']
    },
    //changeOpt 之固定詞彙站(4 站, 無細節)
    mt_optStr: { desc: 'prop opt 為字串(opt 本身無效, 無法攜帶 funLog)', items: [[`${P} opt is invalid, it must be an object with keys and rows, the table is not updated`]], noOpt: true },
    mt_keysBad: { desc: 'prop opt.keys 無效', items: [[`${P} opt.keys is invalid, it must be a non-empty array of keys, the table is not updated`]] },
    mt_rowsBad: { desc: 'prop opt.rows 無效', items: [[`${P} opt.rows is invalid, it must be an array, the table is not updated`]] },
    mt_removed: { desc: 'prop opt 含已移除之鍵 kpCellRender', items: [[`${P} opt.kpCellRender was removed in 2.0.56, use scoped slot 'cell-render' instead`]] },
    //錯誤類(摘要只含類別與代碼, 不含訊息原文)
    //寫檔失敗: wsemi 1.9.79 起 { error } 為固定詞彙字串, 寫檔器之原生錯誤只經其診斷出口(opt.funLog)交出; 本套件以本地 funLog 取回並作 logErr 之 err, 故 errType 為原生錯誤之型別(TypeError), 細節含原因
    write_fail: { desc: '寫檔失敗(mat 掛鉤之儲存格為寫檔器無法寫出之物件)', items: [[`${P} downloadData: can not write excel file`, { errType: 'TypeError' }]], detail: ['TypeError'] },
    //wsemi 於診斷出口之前即拒絕(fileName 含 NUL 字元): 無原生錯誤可取回, logErr 之 err 為 wsemi 之固定詞彙字串(errType 為 string); fileName 之內容(CANARY)不得出現在任何輸出
    write_fileNul: { desc: '寫檔前即被 wsemi 拒絕(fileName 含 NUL 字元, 不經 wsemi 之診斷出口)', items: [[`${P} downloadData: can not write excel file`, { errType: 'string' }]], detail: ['invalid fileName: must not contain a NUL character'] },
    write_reject: { desc: '觸發下載時之例外(URL.createObjectURL 拋錯, 寫檔之 Promise reject)', items: [[`${P} downloadData: can not write excel file`, { errType: 'Error' }]], detail: ['CANARY-OBJURL'] },
    fit_throw: { desc: 'fitColumns 之 catch(api.sizeColumnsToFit 拋錯)', items: [[`${P} fitColumns:`, { errType: 'Error' }]], detail: ['CANARY-FIT-ERR'] },
    filter_throw: { desc: 'triggerFilterChange 之 catch(api.getFilterModel 拋錯)', items: [[`${P} triggerFilterChange:`, { errType: 'Error' }]], detail: ['CANARY-FILTER-ERR'] },
    fade_throw: { desc: 'finishFade 之 catch(api.refreshCells 拋錯)', items: [[`${P} finishFade:`, { errType: 'Error' }]], detail: ['CANARY-FADE-ERR'] },
    paste_throw: { desc: 'pasteText 之 kpCellEditable 函數拋錯(同欄同次貼上說明一次)', items: [[`${P} pasteText: kpCellEditable threw, the cell is treated as not editable`, { colKey: 'b', errType: 'Error' }]], detail: ['CANARY-EDIT a1'] },
}
let NAMES = Object.keys(CASES)

//run, 開宿主頁(query 決定 opt.logDetail 與 opt.funLog)、執行案例、回傳 console 擷取與 funLog 收集
async function run(name, query = '') {
    let ctx = await openPage(pageUrl('consoleNoValues.html') + query)
    let cap = captureConsole(ctx.page)
    let r = await runHostCase(ctx, name, { expectDownloads: 0, noDownloadMs: 300, readFile: false })
    let items = await cap.items()
    let funLogs = await ctx.page.evaluate(() => window.__funLogs)
    return { ctx, r, items, funLogs }
}

describe('api-consoleNoValues:診斷輸出(console)不印資料值(R28)', function() {
    let ctx = null

    afterEach(async function() {
        if (ctx) {
            await ctx.close()
            ctx = null
        }
    })

    describe('預設(未給 funLog、logDetail):只印固定詞彙、鍵名、型別與形狀', function() {
        for (let name of NAMES) {
            let c = CASES[name]
            it(`D_${name} ${c.desc}:輸出恰為預期之固定詞彙與安全摘要, 不含使用者給之值與錯誤訊息原文`, async function() {
                let o = await run(name)
                ctx = o.ctx
                assert.ok(!o.r.out.threw && !o.r.out.rejected, `案例之結果不應變動(不拋錯): ${JSON.stringify(o.r.out)}`)
                assert.deepStrictEqual(o.r.pageErrors, [], 'pageerror')
                //spec D2: 逐項為 [label, safe]; label 為固定詞彙, safe 只有鍵名、型別、形狀
                assert.deepStrictEqual(own(o.items).map((m) => m.args), c.items)
                //R28 規則 5: 相依之 wsemi 不自行輸出(寫檔失敗時其預設會自行 console.log 一則; 本套件以本地 funLog 接走, 輸出只有本套件一則)
                assert.deepStrictEqual(wsemiOut(o.items).map((m) => m.args), [], '相依之 wsemi 不得自行輸出')
                //spec D2: 全部 console 輸出(含非本套件前綴者)之 text 與各引數皆不含使用者給之值、錯誤訊息原文
                for (let s of CANARIES) {
                    assert.ok(!hasText(o.items, s), `console 輸出不得含 ${s}: ${JSON.stringify(o.items.map((m) => m.text))}`)
                }
                //錯誤類不得帶堆疊(堆疊含路徑與使用者函數所在位置); 全部 console 輸出(含 wsemi 等非本套件前綴者)皆不得帶堆疊
                assert.ok(!o.items.some((m) => m.text.includes('\n    at ')), 'console 輸出不得含堆疊')
            })
        }

        //D2: 預設輸出不含寫檔器原生錯誤之訊息原文; 原文取自同案例以 funLog 取得之細節(不寫死 V8 之訊息文字, 升版後仍有鑑別力)
        for (let name of ['write_fail', 'write_reject']) {
            it(`D2_${name} ${CASES[name].desc}:預設輸出不含原生錯誤之訊息原文(原文取自同案例 funLog 之細節), 而細節確含之`, async function() {
                let a = await run(name, '?fl=collect')
                await a.ctx.close()
                assert.strictEqual(a.funLogs.length, 1, JSON.stringify(a.funLogs))
                //細節為 `<name>: <message>`, 取 message
                let detail = a.funLogs[0].detail
                let msg = detail.slice(detail.indexOf(': ') + 2)
                assert.ok(msg.length >= 8, `原生錯誤之訊息原文應可辨識: ${JSON.stringify(detail)}`)
                let o = await run(name)
                ctx = o.ctx
                assert.ok(!hasText(o.items, msg), `預設輸出不得含原生錯誤之訊息原文 ${JSON.stringify(msg)}: ${JSON.stringify(o.items.map((m) => m.text))}`)
            })
        }
    })

    describe('opt.funLog 給函數:本套件全部 console 輸出改交它(label, safe, detail), 不寫 console', function() {
        for (let name of NAMES.filter((n) => !CASES[n].noOpt)) {
            let c = CASES[name]
            it(`F_${name} ${c.desc}:funLog 收到與預設相同之 label 與 safe, 並附遮罩後之細節; console 無本套件輸出`, async function() {
                let o = await run(name, '?fl=collect')
                ctx = o.ctx
                assert.ok(!o.r.out.threw && !o.r.out.rejected, `不應拋錯: ${JSON.stringify(o.r.out)}`)
                assert.deepStrictEqual(o.r.pageErrors, [], 'pageerror')
                //spec D2: funLog 給予時診斷輸出只交給它
                assert.deepStrictEqual(own(o.items).map((m) => m.args), [], '給 funLog 後 console 不應再有本套件輸出')
                //R28 規則 5: wsemi 之診斷輸出亦不寫 console(本套件以本地 funLog 取回, 不轉交使用端之 funLog, 故 funLog 只收本套件之一則)
                assert.deepStrictEqual(wsemiOut(o.items).map((m) => m.args), [], '相依之 wsemi 不得自行輸出')
                assert.deepStrictEqual(o.funLogs.map((v) => (v.safe === null ? [v.label] : [v.label, v.safe])), c.items)
                //有細節之站: 引數 3 個且細節含該站之值(使用端藉此還原); 固定詞彙之站無細節(2 個引數)
                if (c.detail) {
                    assert.ok(o.funLogs.every((v) => v.n === 3), `應為 3 個引數: ${JSON.stringify(o.funLogs)}`)
                    c.detail.forEach((s, i) => {
                        assert.ok(o.funLogs[i].detail.includes(s), `第 ${i} 則之細節應含 ${s}: ${o.funLogs[i].detail}`)
                    })
                }
                else {
                    assert.ok(o.funLogs.every((v) => v.n === 2), `固定詞彙之站不應帶細節: ${JSON.stringify(o.funLogs)}`)
                }
            })
        }
    })

    describe('opt.logDetail 為 true:console 改印遮罩後之細節(使用端自行開啟以還原除錯資訊)', function() {
        //逐站之細節函數由 funLog 組(F_)驗; 此處驗 console 路徑之代表(logUseDefault、錯誤類、貼上)
        let reps = { dl_useHead: ['CANARY-DL-USEHEAD'], mt_localeEntry: ['987654321', 'CANARY-MT-ARR'], fit_throw: ['CANARY-FIT-ERR'], paste_throw: ['CANARY-EDIT a1'], write_fail: ['TypeError'], write_fileNul: ['invalid fileName'] }
        for (let [name, ss] of Object.entries(reps)) {
            it(`L_${name} ${CASES[name].desc}:console 之引數為細節, 含 ${ss.join('、')}`, async function() {
                let o = await run(name, '?ld=1')
                ctx = o.ctx
                assert.deepStrictEqual(o.r.pageErrors, [], 'pageerror')
                let mine = own(o.items)
                assert.strictEqual(mine.length, CASES[name].items.length, JSON.stringify(mine.map((m) => m.text)))
                //R28 規則 5: logDetail 只作用於本套件之輸出, 不傳給 wsemi(傳了則 wsemi 自行再印一則細節, 輸出變兩則)
                assert.deepStrictEqual(wsemiOut(o.items).map((m) => m.args), [], '相依之 wsemi 不得自行輸出')
                //label 不變, 第 2 引數為細節(不是 safe)
                assert.deepStrictEqual(mine.map((m) => m.args[0]), CASES[name].items.map((v) => v[0]))
                for (let s of ss) {
                    assert.ok(hasText(mine, s), `細節應含 ${s}: ${JSON.stringify(mine.map((m) => m.text))}`)
                }
                //第 2 引數不是 safe 物件(logDetail 時以細節取代 safe)
                assert.ok(mine.every((m) => !(m.args[1] && m.args[1].valueShape !== undefined)), 'logDetail 時不應仍印 safe')
            })
        }
    })

    describe('opt 於輸出時才讀取(執行中變更即時生效)', function() {
        it('X1 掛載時未給 funLog:先印 console; 執行中給予 funLog 後改交 funLog; 移除後恢復 console; 執行中開 logDetail 後 console 改印細節', async function() {
            ctx = await openPage(pageUrl('consoleNoValues.html'))
            let cap = captureConsole(ctx.page)
            let reset = async () => {
                cap.clear()
                await ctx.page.evaluate(() => {
                    window.__funLogs.length = 0
                })
            }
            let L = `${P} fitColumns:`
            //①掛載時之預設: console 一則(label, { errType })
            await runHostCase(ctx, 'fit_throw', { noDownloadMs: 100 })
            assert.deepStrictEqual(own(await cap.items()).map((m) => m.args), [[L, { errType: 'Error' }]])
            //②執行中給予 funLog: 輸出改交 funLog, console 無
            await reset()
            await ctx.page.evaluate(() => window.__setDiag('collect'))
            await runHostCase(ctx, 'fit_throw', { noDownloadMs: 100 })
            assert.deepStrictEqual(own(await cap.items()), [])
            let fl = await ctx.page.evaluate(() => window.__funLogs)
            assert.deepStrictEqual(fl.map((v) => [v.label, v.safe, v.n]), [[L, { errType: 'Error' }, 3]])
            //③移除 funLog: 恢復 console
            await reset()
            await ctx.page.evaluate(() => window.__setDiag(null))
            await runHostCase(ctx, 'fit_throw', { noDownloadMs: 100 })
            assert.deepStrictEqual(own(await cap.items()).map((m) => m.args), [[L, { errType: 'Error' }]])
            assert.deepStrictEqual(await ctx.page.evaluate(() => window.__funLogs), [], '移除後 funLog 不再收到')
            //④執行中開 logDetail: console 之第 2 引數改為細節(含錯誤訊息)
            await reset()
            await ctx.page.evaluate(() => window.__setDiag(undefined, true))
            await runHostCase(ctx, 'fit_throw', { noDownloadMs: 100 })
            let mine = own(await cap.items())
            assert.strictEqual(mine.length, 1)
            assert.ok(mine[0].text.includes('CANARY-FIT-ERR'), mine[0].text)
            assert.deepStrictEqual(ctx.pageErrors, [], 'pageerror')
        })

        //R28 規則 5: 取回之原生錯誤為每次下載各自之狀態, 不跨次殘留(防止狀態外提至模組層或實例層: 第二次未取回時沿用第一次之原因)
        it('X2 同一頁連續兩次寫檔失敗: 先寫檔器拒絕(errType TypeError)、再 fileName 含 NUL(errType string)、再寫檔器拒絕(TypeError); 每次恰一則, 取回之原因不跨次殘留', async function() {
            ctx = await openPage(pageUrl('consoleNoValues.html'))
            let cap = captureConsole(ctx.page)
            let L = `${P} downloadData: can not write excel file`
            let seq = [['write_fail', 'TypeError'], ['write_fileNul', 'string'], ['write_fail', 'TypeError']]
            for (let [name, errType] of seq) {
                cap.clear()
                await runHostCase(ctx, name, { expectDownloads: 0, noDownloadMs: 300, readFile: false })
                let items = await cap.items()
                assert.deepStrictEqual(own(items).map((m) => m.args), [[L, { errType }]], `${name} 之輸出`)
                assert.deepStrictEqual(wsemiOut(items).map((m) => m.args), [], '相依之 wsemi 不得自行輸出')
            }
            assert.deepStrictEqual(ctx.pageErrors, [], 'pageerror')
        })
    })

    describe('funLog 之容錯(D4: 診斷本身之失敗不影響被測功能)', function() {
        for (let name of ['dl_useHead', 'mt_localeText', 'fit_throw', 'paste_throw', 'write_fail', 'write_fileNul']) {
            it(`N_${name} funLog 為空函數:本套件全部輸出關閉(使用端 funLog: () => {} 即可關閉)`, async function() {
                let o = await run(name, '?fl=noop')
                ctx = o.ctx
                assert.ok(!o.r.out.threw && !o.r.out.rejected, JSON.stringify(o.r.out))
                assert.deepStrictEqual(o.r.pageErrors, [], 'pageerror')
                assert.deepStrictEqual(own(o.items), [], '本套件 console 輸出應為 0')
                //寫檔類之站點另含 wsemi 之輸出: 使用端以空函數關閉本套件輸出時, 相依之 wsemi 亦不得自行輸出(console 無本套件與 wsemi 輸出)
                assert.deepStrictEqual(wsemiOut(o.items).map((m) => m.args), [], '相依之 wsemi 不得自行輸出')
            })
        }
        for (let fl of ['throw', 'reject']) {
            for (let name of ['dl_useHead', 'fit_throw', 'write_fail']) {
                it(`T_${name}_${fl} funLog 同步拋錯或回傳 rejected Promise:不使方法失敗、無未處理之 rejection、不外洩至 console`, async function() {
                    let o = await run(name, `?fl=${fl}`)
                    ctx = o.ctx
                    assert.ok(!o.r.out.threw && !o.r.out.rejected, JSON.stringify(o.r.out))
                    assert.deepStrictEqual(o.r.pageErrors, [], 'pageerror(含未處理之 rejection)')
                    assert.deepStrictEqual(own(o.items), [], 'funLog 失敗時不退回 console')
                    assert.ok(!hasText(o.items, 'CANARY-FUNLOG'), 'funLog 自身之錯誤不得出現在 console')
                })
            }
        }
    })
})
