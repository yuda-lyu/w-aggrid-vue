//hucre 寫檔之拒絕條件(規則帳本 R16 之單一擁有者; 經 wsemi getExcelWorkbookFromData → getExcelU8ArrFromWorkbook 呼叫, 與 downloadCore 寫檔之路徑相同)
//downloadCore 於寫檔前照抄這些條件做事前檢查(寫檔失敗時 wsemi 以 resolve 回 { error }, 同步介面無從得知);
//wsemi 或 hucre 升版後本檔失敗, 即須回頭比對 R16 之逐項條件與 downloadCore 之判準
import assert from 'assert'
import getExcelWorkbookFromData from 'wsemi/src/getExcelWorkbookFromData.mjs'
import getExcelU8ArrFromWorkbook from 'wsemi/src/getExcelU8ArrFromWorkbook.mjs'
import getDataFromExcelFileU8Arr from 'wsemi/src/getDataFromExcelFileU8Arr.mjs'

//write, 以與 downloadCore 相同之 wsemi 路徑寫出 xlsx, 回傳 { ok, u8a } 或 { error }
async function write(mat, sheetName = 'data') {
    let wb = getExcelWorkbookFromData(mat, sheetName)
    if (wb && wb.error) {
        return { error: String(wb.error) }
    }
    let r = await getExcelU8ArrFromWorkbook(wb)
    if (r && r.error) {
        return { error: String(r.error && r.error.message ? r.error.message : r.error) }
    }
    return { ok: r instanceof Uint8Array, u8a: r }
}

//readBack, 以 uploadData 所用之 wsemi 讀檔器讀回第 1 個分頁之二維陣列
async function readBack(u8a) {
    let d = await getDataFromExcelFileU8Arr(u8a, { fmt: 'array' })
    return d[0].data
}

let H = [['a'], ['v']]

describe('unit-hucre-limits:寫檔器之拒絕條件', function() {

    describe('分頁名(長度以 UTF-16 碼元計)', function() {
        let cases = [
            ['ASCII 31 字', 'x'.repeat(31), true],
            ['ASCII 32 字', 'x'.repeat(32), false],
            ['CJK 31 字(BMP 內,每字 1 碼元)', '報'.repeat(31), true],
            ['表情符號 15 個(碼元 30)', '😀'.repeat(15), true],
            ['表情符號 16 個(碼位 16、碼元 32)', '😀'.repeat(16), false],
            ['擴充 B 漢字 16 個(碼元 32)', '𠀀'.repeat(16), false],
            ['含 /', 'a/b', false],
            ['含 \\', 'a\\b', false],
            ['含 [', 'a[b', false],
            ['含 ]', 'a]b', false],
            ['含 :', 'a:b', false],
            ['含 *', 'a*b', false],
            ['含 ?', 'a?b', false],
            ['首字單引號', "'ab", false],
            ['尾字單引號', "ab'", false],
            ['中間單引號', "a'b", true],
            ['保留名 History', 'History', false],
            ['保留名 history', 'history', false],
            ['保留名 HISTORY', 'HISTORY', false],
            ['中文與數字', '報表2026-10', true],
            ['new String 包裝之字串(非字串原始值)', new String('boxed'), false],
        ]
        for (let [title, name, accept] of cases) {
            it(`${title}:${accept ? '接受' : '拒絕'}`, async function() {
                let r = await write(H, name)
                if (accept) {
                    assert.ok(r.ok, `應接受, 實際 ${r.error}`)
                }
                else {
                    assert.ok(r.error, '應拒絕')
                    assert.match(r.error, /Sheet name/)
                }
            })
        }
    })

    describe('欄數(欄索引上限 16383)', function() {
        it('16384 欄:接受', async function() {
            let r = await write([Array.from({ length: 16384 }, (v, i) => `c${i}`)])
            assert.ok(r.ok, r.error)
        })
        it('16385 欄:拒絕', async function() {
            let r = await write([Array.from({ length: 16385 }, (v, i) => `c${i}`)])
            assert.match(String(r.error), /Column index 16384/)
        })
    })

    describe('列數(寫檔器不檢查,讀檔器拒讀超過 1048576 列者;downloadCore 因此事前檢查,見規則帳本 R15)', function() {
        it('1048577 列(含表頭):寫檔器接受,讀檔器拒讀', async function() {
            let r = ['']
            let mat = [['a']]
            for (let i = 1; i < 1048577; i++) {
                mat.push(r)
            }
            let w = await write(mat)
            assert.ok(w.ok, w.error)
            let d = await getDataFromExcelFileU8Arr(w.u8a, { fmt: 'array' })
            assert.ok(d && d.error, '讀檔器應拒讀')
        })
    })

    //儲存格值之轉換(規則帳本第 6 節已知限制;mat 掛鉤之儲存格值原樣交給寫檔器,見 R15):讀回值以 uploadData 所用之讀檔器取得
    describe('儲存格值:寫出後讀回之值', function() {
        let cases = [
            ['物件', { a: 1 }, ''],
            ['陣列', [1, 2], ''],
            ['函數', function() {}, ''],
            ['Symbol', Symbol('s'), ''],
            ['BigInt', BigInt(1), ''],
            ['NaN', NaN, ''],
            ['Infinity', Infinity, ''],
            ['undefined', undefined, ''],
            ['Date', new Date(Date.UTC(2026, 0, 2)), '2026-01-02T00:00:00.000'],
            ['Invalid Date', new Date(NaN), 'NaN'],
            ['布林', true, 'true'],
            ['Excel 錯誤字串 #N/A(寫成錯誤值,讀回原字串)', '#N/A', '#N/A'],
            ['帶 value 之物件(寫檔器之儲存格設定)', { value: 'x' }, 'x'],
            ['帶 formula 之物件(寫成公式,無快取值而讀回空白)', { value: 1, formula: 'SUM(1,2)' }, ''],
            ['長字串 40000 字', 'x'.repeat(40000), 'x'.repeat(40000)],
            ['控制字元', 'a\u0001b', 'a\u0001b'],
        ]
        for (let [title, v, exp] of cases) {
            it(`${title}:讀回 ${JSON.stringify(exp).slice(0, 30)}`, async function() {
                let w = await write([['a', 'b'], [v, 'keep']])
                assert.ok(w.ok, w.error)
                assert.deepStrictEqual(await readBack(w.u8a), [['a', 'b'], [exp, 'keep']])
            })
        }
        it('孤立代理字元:接受', async function() {
            let w = await write([['a'], ['a\uD800b']])
            assert.ok(w.ok, w.error)
        })
        it('style 不合格式之物件:寫檔失敗(downloadCore 只能記錄於 console)', async function() {
            let w = await write([['a'], [{ value: 'x', style: 'bold' }]])
            assert.ok(w.error, '應寫檔失敗')
        })
    })

})
