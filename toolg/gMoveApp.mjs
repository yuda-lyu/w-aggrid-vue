import fs from 'fs-extra'
import w from 'wsemi'


let fdSrc = './dist/'
let fdTar = './docs/examples/'


function main() {
    //修改webpack打包後index.html內引用js與css路徑, 在移動dist至docs/examples

    //replace /js/ /css/
    let h = fs.readFileSync(`${fdSrc}index.html`, 'utf8')
    h = w.replace(h, '/js/', 'js/')
    h = w.replace(h, '/css/', 'css/')
    fs.writeFileSync(`${fdSrc}index.html`, h, 'utf8')

    //moveSync
    fs.moveSync(fdSrc, fdTar, { overwrite: true })

}
main()


