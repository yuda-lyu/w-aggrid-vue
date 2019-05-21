import _ from 'lodash'
import fs from 'fs'


let fd_src = './examples/'
let fd_tar = './docs/examples/'


async function getFiles(fd) {
    let fsp = fs.promises
    let ltfs = await fsp.readdir(fd)
    return ltfs
}


async function main() {
    //把example裡面cdn更換, 再複製到docs的example內, 作為日後發佈為靜態網站

    //pkg
    let pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'))

    //cdn
    let cdn = `<script src="https://cdn.jsdelivr.net/npm/w-aggrid-vue@${pkg.version}/dist/w-aggrid-vue.umd.js"></script>`

    //mkdirSync
    fs.mkdirSync(fd_tar)

    //getFiles
    let ltfs = await getFiles(fd_src)

    _.each(ltfs, function(v) {

        //fn
        let fn = fd_src + v

        //c
        let c = fs.readFileSync(fn, 'utf8')

        //replace
        let r = `<script src="../dist/w-aggrid-vue.umd.js"></script>`
        c = c.replace(r, cdn)

        //write
        //console.log(c)
        fs.writeFileSync(fd_tar + v, c, 'utf8')

    })

}
main()
