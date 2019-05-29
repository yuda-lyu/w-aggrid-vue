import getB64 from 'w-puppeteer-uitest/src/getB64.mjs'


async function getB64ByAction(fn) {
    let opt = {
        actions: [
            {
                mode: 'eleclick',
                selector: '[col-id="model"]', //此欄位禁止排序
            },
            {
                mode: 'eleclick',
                selector: '[col-id="price"]', //此欄位禁止排序
            },
        ]
    }
    return getB64(fn, opt)
}


export default getB64ByAction

