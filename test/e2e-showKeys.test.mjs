//showKeys 之元件行為(規則帳本 R11; 選項處理見 R01; keys 非陣列為資料契約而拋錯)
//使用者路徑: ①開宿主頁(一般表格 g1、含固定欄 p 之表格 g2) ②部分案例先以 grid API 建立前置狀態(使用者先前之拖曳、調寬與排序; setup 例外)
//③點宿主頁之按鈕, 其處理函數依序呼叫 showKeys(同官方範例以勾選框切換顯示欄位之用法) ④無輸入 ⑤比對畫面欄序(依表頭之螢幕座標)、欄寬、排序狀態、拋錯與 console 提示 ⑥無副作用
import assert from 'assert'
import { openPage, pageUrl, runHostCase, headerOrder, assertLogs } from './tools/e2e-setup.mjs'
import { waitGridIdle } from './tools/e2eLib.mjs'

let ALL = ['a', 'b', 'c', 'd', 'e']
let NOLOG = { nolog: /invalid (applyOrder|opt)/ }
let logApply = (s) => ({ log: new RegExp(`^\\[w-aggrid-vue\\] showKeys: invalid applyOrder\\[${s}\\], use default applyOrder true$`) })
let KEYS_THROW = { throw: /^\[w-aggrid-vue\] showKeys: keys must be an array of non-empty strings$/ }

//前置狀態(setup 例外)
let pre = {
    SK5: (page) => page.evaluate(() => window.__vm.$refs.g1.getApi().moveColumns(['d'], 0)),
    SK5b: (page) => page.evaluate(() => window.__vm.$refs.g1.getApi().moveColumns(['d'], 0)),
    SK8: (page) => page.evaluate(() => window.__vm.$refs.g1.getApi().applyColumnState({ state: [{ colId: 'b', width: 177 }, { colId: 'c', sort: 'asc' }] })),
    SK8b: (page) => page.evaluate(() => window.__vm.$refs.g1.getApi().applyColumnState({ state: [{ colId: 'b', width: 177 }, { colId: 'c', sort: 'asc' }] })),
}

//columnState, 讀某表之欄位狀態(寬度、排序、固定)
function columnState(page, ref) {
    return page.evaluate((r) => window.__vm.$refs[r].getApi().getColumnState(), ref)
}

//每格: [代號, 說明, 表格, 預期畫面欄序, 其他判定, 拋錯與 console 提示之應然]
let cases = [
    ['SK1', '預設(不給 opt)取消再勾 b:b 附加於最右(既有行為)', 'g1', ['a', 'c', 'd', 'e', 'b'], null, NOLOG],
    ['SK2', '預設:依 keys_new 重排', 'g1', ['e', 'd', 'c', 'b', 'a'], null, NOLOG],
    ['SK3a', 'applyOrder 為 false 取消 b:b 隱藏', 'g1', ['a', 'c', 'd', 'e'], null, NOLOG],
    ['SK3b', 'applyOrder 為 false 重勾 b:回原位', 'g1', ALL, null, NOLOG],
    ['SK4', 'applyOrder 為 false:忽略 keys_new 之順序', 'g1', ALL],
    ['SK5', 'applyOrder 為 false:保留使用者拖曳後之順序', 'g1', ['d', 'a', 'b', 'c', 'e']],
    ['SK5b', '預設:依 keys_new 覆蓋拖曳序(既有行為)', 'g1', ALL],
    ['SK6_str', 'applyOrder 為字串 false:視為 true 並提示(R01)', 'g1', ['e', 'a', 'b', 'c', 'd'], null, logApply('false')],
    ['SK6_zero', 'applyOrder 為 0:視為 true 並提示(R01)', 'g1', ['e', 'a', 'b', 'c', 'd'], null, logApply('0')],
    ['SK6_null', 'applyOrder 為 null:視為未給予,用 true 且不提示(R01)', 'g1', ['e', 'a', 'b', 'c', 'd'], null, NOLOG],
    ['SK6_x', 'applyOrder 為 x:視為 true 並提示(R01)', 'g1', ['e', 'a', 'b', 'c', 'd'], null, logApply('x')],
    ['SK7', 'opt 為 undefined:不拋錯、視為 true 且不提示(R01)', 'g1', ALL, null, NOLOG],
    ['SK12_optStr', 'opt 為字串:視為 {} 並提示(R01)', 'g1', ['e', 'a', 'b', 'c', 'd'], null, { log: /^\[w-aggrid-vue\] showKeys: invalid opt\[x\], use default opt \{\}$/ }],
    ['SK12_optNull', 'opt 為 null:視為 {} 且不提示(R01)', 'g1', ['e', 'a', 'b', 'c', 'd'], null, NOLOG],
    ['SK13_keysStr', 'keys 為字串:拋錯且欄位不變(資料契約)', 'g1', ALL, null, KEYS_THROW],
    ['SK14_keysUndef', 'keys 未給予:拋錯且欄位不變(資料契約)', 'g1', ALL, null, KEYS_THROW],
    ['SK15_keysEmpty', 'keys 為空陣列:全部欄位隱藏(使用者取消全部勾選)', 'g1', [], null, NOLOG],
    ['SK16_nullElem', 'keys 含 null:拋錯且欄位不變(資料契約)', 'g1', ALL, null, KEYS_THROW],
    ['SK17_objElem', 'keys 含物件:拋錯且欄位不變,不再拋 ag-grid 之原生 TypeError(資料契約)', 'g1', ALL, null, KEYS_THROW],
    ['SK18_numElem', 'keys 含數字:拋錯且欄位不變(欄位 key 須為字串)(資料契約)', 'g1', ALL, null, KEYS_THROW],
    ['SK19_emptyStrElem', 'keys 含空字串:拋錯且欄位不變(資料契約)', 'g1', ALL, null, KEYS_THROW],
    ['SK8', '最小欄位狀態(false):b 寬 177 與 c 升冪排序保留', 'g1', ALL, async (page) => {
        let s = await columnState(page, 'g1')
        assert.strictEqual(s.find((x) => x.colId === 'b').width, 177)
        assert.strictEqual(s.find((x) => x.colId === 'c').sort, 'asc')
    }],
    ['SK8b', '最小欄位狀態(true):寬度與排序保留且重排生效', 'g1', ['b', 'a', 'c', 'd', 'e'], async (page) => {
        let s = await columnState(page, 'g1')
        assert.strictEqual(s.find((x) => x.colId === 'b').width, 177)
        assert.strictEqual(s.find((x) => x.colId === 'c').sort, 'asc')
    }],
    ['SK9', '固定欄 p 放陣列最後:仍顯示於最左且保留固定', 'g2', ['p', 'a', 'b', 'c'], async (page) => {
        let s = await columnState(page, 'g2')
        assert.strictEqual(s.find((x) => x.colId === 'p').pinned, 'left')
    }],
    ['SK9b', '固定欄 p 隱藏後重勾(false):回到左區', 'g2', ['p', 'a', 'b', 'c'], async (page, r) => {
        assert.ok(!r.out.trace[0].includes('p'), `隱藏後之顯示欄 ${JSON.stringify(r.out.trace[0])}`)
    }],
    ['SK10', '未知欄位名:不拋錯,由 ag-grid 略過', 'g1', ['a', 'c']],
    ['SK11', '重複欄位名:不拋錯', 'g1', ['a', 'b']],
]

describe('e2e-showKeys:顯示欄位切換', function() {
    let ctx = null

    beforeEach(async function() {
        ctx = await openPage(pageUrl('showKeys.html'), { viewport: { width: 1200, height: 600 }, minCells: 9 })
    })

    afterEach(async function() {
        if (ctx) {
            await ctx.close()
        }
        ctx = null
    })

    for (let [id, title, grid, order, extra, exp = {}] of cases) {
        it(`${id} ${title}`, async function() {
            if (pre[id]) {
                await pre[id](ctx.page)
                await waitGridIdle(ctx.page, { scope: `#${grid}` })
            }
            let r = await runHostCase(ctx, id)
            if (exp.throw) {
                assert.ok(r.out.threw, '應拋錯')
                assert.match(r.out.err, exp.throw)
            }
            else {
                assert.ok(!r.out.threw, `不應拋錯: ${r.out.err}`)
            }
            await waitGridIdle(ctx.page, { scope: `#${grid}`, minCells: 0 })
            assert.deepStrictEqual(await headerOrder(ctx.page, `#${grid}`), order, '畫面欄序')
            if (extra) {
                await extra(ctx.page, r)
            }
            assertLogs(r.logs, exp)
            assert.deepStrictEqual(r.pageErrors, [], 'pageerror')
        })
    }

})
