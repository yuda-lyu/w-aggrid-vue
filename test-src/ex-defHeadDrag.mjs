import getB64 from 'w-puppeteer-uitest/src/getB64.mjs'


async function getB64ByAction(fn) {
    let opt = {
        actions: [
            {
                mode: 'drag',
                x1: 507,
                y1: 25,
                x2: 307,
                y2: 25,
            },
        ]
    }
    return getB64(fn, opt)
}


export default getB64ByAction

