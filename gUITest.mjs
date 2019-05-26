import puppeteer from 'puppeteer'
import _ from 'lodash'
import b from 'bluebird'
import fs from 'fs'


let fd = 'D:\\開源-NodeJS-w-aggrid-vue\\w-aggrid-vue\\'
let fd_src = fd + 'examples\\'
let fd_tar = fd + 'test\\screenshot\\'


function genPm() {

    let resolve
    let reject
    let p = new Promise(function() {
        resolve = arguments[0]
        reject = arguments[1]
    })
    p.resolve = resolve
    p.reject = reject

    return p
}


async function getFilesHtml(fd) {
    let fsp = fs.promises
    let ltfs = await fsp.readdir(fd)

    //filter
    ltfs = _.filter(ltfs, function(fn) {
        return fn.indexOf('.js') < 0
    })

    return ltfs
}


function readFile(fn) {
    return fs.readFileSync(fn, 'utf8')
}


async function getB64FromScreenshot(fn, waitsec = 5) {

    //new page
    const browser = await puppeteer.launch()
    const page = await browser.newPage()

    //show page
    await page.goto(fn)
    await page.setViewport({ width: 800, height: 600 })

    //wait
    await page.waitFor(waitsec * 1000)

    //get base64 from screenshot
    let base64 = await page.screenshot({ encoding: 'base64' })

    //close
    await browser.close()

    return base64
}


function saveB64FromScreenshot(fn_in, fn_out, waitsec) {
    let p = genPm()

    //b64
    getB64FromScreenshot(fn_in, waitsec)
        .then((b64) => {

            //.write
            fs.writeFileSync(fn_out, b64, 'utf8')

            //resolve
            p.resolve()

        })

    return p
}


async function buildExpected(fd_src, fd_tar) {

    //mkdirSync
    if (!fs.existsSync(fd_tar)) {
        fs.mkdirSync(fd_tar)
    }

    //getFilesHtml
    let ltfs = await getFilesHtml(fd_src)

    //mapSeries 循序, map 平行化處理
    b.mapSeries(ltfs, function(v) {
        console.log('test item: ' + v)

        //fn_in
        let fn_in = fd_src + v

        //fn_out
        let fn_out = fd_tar + v + '.base64'

        return saveB64FromScreenshot(fn_in, fn_out)
    })
    //.catch(() => {})

}


async function testExpected(fd_src, fd_tar, waitsec) {

    //mkdirSync
    if (!fs.existsSync(fd_tar)) {
        console.log('folder not exits: ', fd_tar)
        return
    }

    //getFilesHtml
    let ltfs = await getFilesHtml(fd_src)

    //mapSeries 循序, map 平行化處理
    b.map(ltfs, function(v) {
        console.log('test item: ' + v)

        //fn_in
        let fn_in = fd_src + v

        //fn_out
        let fn_out = fd_tar + v + '.base64'

        //p
        let p = genPm()

        //b64
        getB64FromScreenshot(fn_in, waitsec)
            .then((b64_now) => {

                //b64_expected
                let b64_expected = readFile(fn_out)

                //check
                if (b64_now === b64_expected) {
                    console.log('test success: ' + v)
                    p.resolve()
                }
                else {
                    console.error('test error: ' + v)
                    p.reject(v)
                }

            })

        return p
    }, { concurrency: 50 }) //10為上限, 否則node會提示memory leak detected, 但實際可超過
    //.catch(() => {})

}


let mode = 'build'
mode = ''
if (mode === 'build') {
    buildExpected(fd_src, fd_tar)
}
else {
    testExpected(fd_src, fd_tar)
}

