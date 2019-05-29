import getB64 from 'w-puppeteer-uitest/src/getB64.mjs'


async function getB64ByAction(fn) {
    let opt = {}
    return getB64(fn, opt)
}


export default getB64ByAction

