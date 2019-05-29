import getB64 from 'w-puppeteer-uitest/src/getB64.mjs'


async function getB64ByAction(fn) {
    let opt = {
        actions: [
            {
                mode: 'eledrag',
                selector: 'div.ag-row-drag',
                nth: 2,
                shiftx: 0,
                shifty: 100,
            },
            // {
            //     mode: 'drag',
            //     x1: 429,
            //     y1: 112,
            //     x2: 429,
            //     y2: 253,
            // },
        ]
    }
    return getB64(fn, opt)
}


export default getB64ByAction
