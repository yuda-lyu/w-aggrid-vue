//console 輸出之完整擷取(含各引數之 JSON 值), 供診斷輸出(R28)之測試; 只擷取, 不改頁面行為
//Playwright 之 ConsoleMessage.text() 對物件引數只給預覽字串, 且 Error 之 jsonValue 為 {}; 故逐引數同時保留 text 與 jsonValue
//共用層 e2e-setup.openPage 已收集 ctx.logs(text), 本檔另掛一組監聽收集引數

//captureConsole, 於頁面掛監聽; items() 等全部已收到之訊息之引數序列化完成後回傳
export function captureConsole(page) {
    let pend = []
    page.on('console', (m) => {
        pend.push((async () => {
            let args = []
            for (let a of m.args()) {
                try {
                    args.push(await a.jsonValue())
                }
                catch (err) {
                    args.push('(unserializable)')
                }
            }
            return { type: m.type(), text: m.text(), args }
        })())
    })
    return {
        items: async () => await Promise.all(pend),
        clear: () => {
            pend.length = 0
        },
    }
}


//PREFIX, 本套件所有診斷輸出之前綴(R03)
export const PREFIX = '[w-aggrid-vue]'


//own, 只留本套件之輸出(第一引數為前綴字串開頭者); 其餘(ag-grid、瀏覽器之訊息)不計
export function own(items) {
    return items.filter((m) => typeof m.args[0] === 'string' && m.args[0].startsWith(PREFIX))
}


//hasText, 任一則訊息之 text 或任一引數之 JSON 含指定字串(找資料值是否洩入輸出)
export function hasText(items, s) {
    return items.some((m) => m.text.includes(s) || JSON.stringify(m.args).includes(s))
}
