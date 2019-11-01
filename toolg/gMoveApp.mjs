import fs from 'fs-extra'


let fdSrc = './dist/'
let fdTar = './docs/examples/'


function main() {
    //移動webpack打包後的dist

    fs.moveSync(fdSrc, fdTar, { overwrite: true })

}
main()


