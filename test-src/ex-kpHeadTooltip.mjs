import getB64 from 'w-puppeteer-uitest/src/getB64.mjs'


async function getB64ByAction(fn) {
    let opt = {
        actions: [
            {
                mode: 'elehover',
                selector: '[col-id="price"]', //有多個, 不給nth則預設第0個
            },
            // {
            //     mode: 'elemove',
            //     selector: '[col-id="price"]', //有多個, 不給nth則預設第0個
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

