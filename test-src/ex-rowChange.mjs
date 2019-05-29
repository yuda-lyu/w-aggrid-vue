import getB64 from 'w-puppeteer-uitest/src/getB64.mjs'


async function getB64ByAction(fn) {
    let opt = {
        actions: [
            {
                mode: 'click',
                x1: 110,
                y1: 282,
            },
            {
                mode: 'type',
                str: 'Adzam',
            },
        ]
    }
    return getB64(fn, opt)
}


export default getB64ByAction

