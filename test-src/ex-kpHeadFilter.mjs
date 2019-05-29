import getB64 from 'w-puppeteer-uitest/src/getB64.mjs'


async function getB64ByAction(fn) {
    let opt = {
        actions: [
            {
                mode: 'eleclick',
                selector: 'input.ag-floating-filter-input',
            },
            {
                mode: 'type',
                str: 'C',
            },
            {
                mode: 'eleclick',
                selector: '[col-id="model"]',
            }
        ]
    }
    return getB64(fn, opt)
}


export default getB64ByAction

