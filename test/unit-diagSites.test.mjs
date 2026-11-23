//診斷輸出(console)之站點全集鎖(規則帳本 R28; 依跨套件規格〈診斷輸出與遮罩〉D1 單一實作、D2 預設不輸出資料值)
//層級 unit-: 只讀原始碼與建置設定(node, 不起瀏覽器); 輸出之實際內容由 api-consoleNoValues、e2e-consoleNoValues 驗
//範圍: 發布之元件碼 src/components/*(dist 由 toolg/gDistRollupComps.mjs 只打包 src/components/WAggridVue.vue); src/App*.vue 為範例即文件(R18), 不在 dist, 不屬套件輸出
import assert from 'assert'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

let root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
let read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8')

//stripCode, 去除註解(//、/* */)並保留字串、樣板字串與正規式字面值之內容(其內之 // 與引號不被當成註解或字串邊界)
//正規式字面值以「前一個有效字元」判定(為 ( , = : [ ! & | ? { } ; 或行首者之 / 視為正規式起點)
function stripCode(src) {
    let out = ''
    let i = 0
    let n = src.length
    let prev = ''
    while (i < n) {
        let c = src[i]
        let d = src[i + 1]
        if (c === '/' && d === '/') {
            while (i < n && src[i] !== '\n') {
                i++
            }
            continue
        }
        if (c === '/' && d === '*') {
            i += 2
            while (i < n && !(src[i] === '*' && src[i + 1] === '/')) {
                i++
            }
            i += 2
            continue
        }
        if (c === '\'' || c === '"' || c === '`') {
            let q = c
            out += c
            i++
            while (i < n && src[i] !== q) {
                if (src[i] === '\\') {
                    out += src[i]
                    i++
                }
                out += src[i]
                i++
            }
            out += q
            i++
            prev = q
            continue
        }
        if (c === '/' && (prev === '' || '(,=:[!&|?{};'.includes(prev))) {
            //正規式字面值: 到未跳脫且不在字元集內之下一個 /
            out += c
            i++
            let inSet = false
            while (i < n && (src[i] !== '/' || inSet)) {
                if (src[i] === '\\') {
                    out += src[i]
                    i++
                }
                else if (src[i] === '[') {
                    inSet = true
                }
                else if (src[i] === ']') {
                    inSet = false
                }
                out += src[i]
                i++
            }
            out += '/'
            i++
            prev = '/'
            continue
        }
        out += c
        if (!/\s/.test(c)) {
            prev = c
        }
        i++
    }
    return out
}

//count, 去註解後之原始碼中某正規式之命中數
let count = (code, re) => (code.match(re) || []).length

//元件碼(去註解): .vue 取 <script> 內
let vueFull = read('src/components/WAggridVue.vue')
let vueScript = vueFull.slice(vueFull.indexOf('<script>'), vueFull.lastIndexOf('</script>'))
let F = stripCode(vueScript).replace(/\r\n/g, '\n') //檔案為 CRLF, 正規式比對以 LF 為準
let others = fs.readdirSync(path.join(root, 'src', 'components')).filter((f) => f !== 'WAggridVue.vue' && /\.(mjs|js|vue)$/.test(f))

describe('unit-diagSites:診斷輸出之站點全集鎖(R28)', function() {

    it('DS0 stripCode 之正向對照: 字串、樣板字串、正規式內之 // 與引號不被當註解, 真註解被去除(確保其後之 0 站判定不是掃描失效)', function() {
        let s = [
            'let a = \'x // y\'; console.log(1) // console.log(2)',
            'let b = `t // $' + '{1} \'`; console.warn(3) /* console.error(4) */',
            'let r = /[[\\]:*?/\\\\]/.test(a); console.log(5)',
        ].join('\n')
        let c = stripCode(s)
        assert.strictEqual(count(c, /\bconsole\.\w+\(/g), 3, c)
        assert.ok(c.includes('x // y'))
        assert.ok(!c.includes('console.log(2)') && !c.includes('console.error(4)'))
        //對本檔實測: 去註解後長度小於原始, 且仍含已知之碼
        assert.ok(F.length < vueScript.length && F.includes('function downloadCore('))
    })

    it('DS1 R28 元件碼(src/components/*)去註解後直接呼叫 console 之站點為 0(一切輸出經單一出口 diagOf)', function() {
        assert.strictEqual(count(F, /\bconsole\s*\.\s*\w+\s*\(/g), 0, '元件碼不得直接呼叫 console')
        assert.strictEqual(count(F, /\bconsole\b/g), 0, '元件碼不得引用 console(含別名、解構)')
        for (let f of others) {
            let c = stripCode(read(path.join('src', 'components', f)))
            assert.strictEqual(count(c, /\bconsole\b/g), 0, `${f} 不得引用 console`)
        }
    })

    it('DS2 R28 單一出口(D1): wsemi getDiag 只匯入一次、只在 diagOf 呼叫一次; 無本地之遮罩或摘要實作', function() {
        assert.strictEqual(count(F, /^import getDiag from 'wsemi\/src\/getDiag\.mjs'$/gm), 1)
        assert.strictEqual(count(F, /\bgetDiag\s*\(/g), 1, 'getDiag 只在 diagOf 內呼叫')
        let m = F.match(/function diagOf\(vo\) \{([\s\S]*?)\n\}/)
        assert.ok(m && /getDiag\(get\(vo, 'opt'\), DIAG_CFG\)/.test(m[1]), 'diagOf 以元件 opt 讀 logDetail 與 funLog')
        //不得自寫等價實作: 舊之 descInvalid(字串與數值顯示原值)已刪, 不得有自寫之 mask/brief/shape/redact 函數
        assert.strictEqual(count(F, /\bdescInvalid\b/g), 0)
        assert.strictEqual(count(F, /function\s+\w*(mask|redact|brief|shape|sanitize)\w*\s*\(/gi), 0)
        //safeKeys 為本檔 safe 所用之全部鍵名
        assert.ok(/const DIAG_CFG = \{ safeKeys: \['valueShape', 'localeKey', 'colKey'\] \}/.test(F))
    })

    it('DS3 R28 站點全集: 25 個輸出呼叫點皆為 logUseDefault 12、logUseDefaultOpt 3、logErr 6、logFixed 4, 且第一引數皆為元件實例 vo', function() {
        let calls = (name) => count(F, new RegExp(`\\b${name}\\(`, 'g')) - count(F, new RegExp(`function ${name}\\(`, 'g'))
        //withVo: 以 vo 為第一引數之呼叫點(函式定義之參數列亦為 (vo, ..., 扣除之)
        let withVo = (name) => count(F, new RegExp(`\\b${name}\\(vo, `, 'g')) - count(F, new RegExp(`function ${name}\\(vo, `, 'g'))
        let expect = { logUseDefault: 12, logUseDefaultOpt: 3, logErr: 6, logFixed: 4 }
        for (let [name, n] of Object.entries(expect)) {
            assert.strictEqual(calls(name), n, `${name} 之呼叫點數`)
            assert.strictEqual(withVo(name), n, `${name} 之呼叫皆以 vo 為第一引數(opt 於輸出時才讀)`)
        }
        //四個出口函數之本體皆只經 diagOf(vo)
        for (let name of Object.keys(expect)) {
            let m = F.match(new RegExp(`function ${name}\\(([\\s\\S]*?)\\n\\}`))
            assert.ok(m && /\bdiagOf\(vo\)/.test(m[0]), `${name} 須經 diagOf(vo)`)
        }
    })

    it('DS4 R28 label 為固定詞彙: 不內插使用者值; logUseDefault 之 safe 只有 valueShape(diag.shape), logErr 只經 diag.brief', function() {
        let u = F.match(/function logUseDefault\(vo, name, key, v, def\) \{([\s\S]*?)\n\}/)[1]
        assert.ok(/diag\(`\[w-aggrid-vue\] \$\{name\}: invalid \$\{key\}, use default \$\{key\} \$\{def\}`, \{ valueShape: diag\.shape\(v\) \}, \(\) => v\)/.test(u), u)
        let uo = F.match(/function logUseDefaultOpt\(vo, key, v, def, extra\) \{([\s\S]*?)\n\}/)[1]
        assert.ok(/valueShape: diag\.shape\(v\)/.test(uo) && /\(\) => v\)/.test(uo), uo)
        let e = F.match(/function logErr\(vo, label, err, extra\) \{([\s\S]*?)\n\}/)[1]
        assert.ok(/diag\.brief\(err\)/.test(e) && /\(\) => err\)/.test(e), e)
        //logErr 與 logFixed 之 label(第 2 引數, 字串字面值)只可內插固定之代碼: name(方法名)、k(已移除之鍵名常數表之鍵)、slotName(同表之值); 不得內插錯誤、值或訊息
        let labels = [...F.matchAll(/\b(logErr|logFixed)\(vo, (`[^`]*`|'[^']*')/g)].map((m) => m[2])
        assert.strictEqual(labels.length, 10, `logErr 6 加 logFixed 4 之 label 數: ${labels.length}`)
        for (let lb of labels) {
            for (let m of lb.matchAll(/\$\{([^}]*)\}/g)) {
                assert.ok(['name', 'k', 'slotName'].includes(m[1].trim()), `label 內插了非固定代碼 \${${m[1]}}: ${lb}`)
            }
        }
    })

    it('DS5 範例碼(src/App*.vue、src/main.js)不在 dist: 建置只打包 src/components/WAggridVue.vue(範例之 console 為宿主端示範碼, 不屬套件輸出)', function() {
        let g = read('toolg/gDistRollupComps.mjs')
        assert.ok(/^let fdSrc = '\.\/src\/components\/'\r?$/m.test(g), 'fdSrc 須恰為 ./src/components/')
        assert.ok(/^\s+fns: 'WAggridVue\.vue',\r?$/m.test(g), 'fns 須恰為單一檔 WAggridVue.vue')
    })

    it('DS6 R28 公開選項: opt.logDetail、opt.funLog 載於元件 JSDoc(@vue-prop), 預設值與意義明示', function() {
        assert.ok(/@vue-prop \{Boolean\} \[opt\.logDetail=false\]/.test(vueFull))
        assert.ok(/@vue-prop \{Function\} \[opt\.funLog=null\]/.test(vueFull))
    })

    it('DS7 dist 已依現行 src 建置(防止未重建而以舊 dist 測試): 含 R28 之 safe 鍵名', function() {
        let d = read('dist/w-aggrid-vue.umd.js')
        for (let k of ['valueShape', 'localeKey', 'colKey', 'localeText[<key>]']) {
            assert.ok(d.includes(k), `dist 缺 ${k}, 須 node toolg/gDistRollupComps.mjs`)
        }
    })

})
