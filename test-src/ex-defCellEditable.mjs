import getB64 from 'w-puppeteer-uitest/src/getB64.mjs'


async function getB64ByAction(fn) {
    let opt = {
        actions: [
            {
                mode: 'click',
                x1: 309,
                y1: 87,
            },
            {
                mode: 'type',
                str: 'Acilec',
            },
        ]
    }
    return getB64(fn, opt)
}


export default getB64ByAction

