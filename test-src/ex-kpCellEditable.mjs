import getB64 from 'w-puppeteer-uitest/src/getB64.mjs'


async function getB64ByAction(fn) {
    let opt = {
        actions: [
            {
                mode: 'eleclick',
                selector: '[comp-id="33"]',
            },
            // {
            //     mode: 'click',
            //     x1: 510,
            //     y1: 87,
            // },
            {
                mode: 'type',
                str: '80000',
            },
        ]
    }
    return getB64(fn, opt)
}


export default getB64ByAction

