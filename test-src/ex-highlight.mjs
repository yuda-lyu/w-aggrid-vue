import getB64 from 'w-puppeteer-uitest/src/getB64.mjs'


async function getB64ByAction(fn) {
    let opt = {
        actions: [
            {
                mode: 'wait', //有內建腳本要1s後變更數據顯示highlight, 故延遲1.5s之後才操作
                time: 1500,
            },
            {
                mode: 'click',
                x1: 510,
                y1: 87,
            },
            {
                mode: 'type',
                str: '80000',
            },
        ]
    }
    return getB64(fn, opt)
}


export default getB64ByAction

