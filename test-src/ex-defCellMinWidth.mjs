import getB64 from 'w-puppeteer-uitest/src/getB64.mjs'


async function getB64ByAction(fn) {
    let opt = {
        actions: [
            {
                mode: 'eledrag',
                selector: '[col-id="price"] > [ref="eResize"]',
                shiftx: 100,
                shifty: 0,
            },
            {
                mode: 'eledrag',
                selector: '[col-id="model"] > [ref="eResize"]',
                shiftx: -300,
                shifty: 0,
            },
        ]
    }
    return getB64(fn, opt)
}


export default getB64ByAction

