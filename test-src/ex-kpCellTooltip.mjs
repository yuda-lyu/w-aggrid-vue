import getB64 from 'w-puppeteer-uitest/src/getB64.mjs'


async function getB64ByAction(fn) {
    let opt = {
        actions: [
            {
                mode: 'elehover',
                selector: '[comp-id="45"]',
            },
            // {
            //     mode: 'elemove',
            //     selector: '[comp-id="45"]',
            //     nth: 3,
            // },
            // {
            //     mode: 'move',
            //     x1: 502,
            //     y1: 24,
            // },
        ]
    }
    return getB64(fn, opt)
}


export default getB64ByAction

