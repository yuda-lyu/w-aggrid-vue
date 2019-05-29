import getB64 from 'w-puppeteer-uitest/src/getB64.mjs'


async function getB64ByAction(fn) {
    let opt = {
        actions: [
            // {
            //     mode: 'eledbclick',
            //     selector: '[comp-id="33"]',
            // },
            {
                mode: 'dbclick',
                x1: 510,
                y1: 87,
            },
        ]
    }
    return getB64(fn, opt)
}


export default getB64ByAction

