import { buildExpected, testExpected } from 'w-puppeteer-uitest/src/testScreenshot.mjs'


let fd = 'D:\\開源-NodeJS-w-aggrid-vue\\w-aggrid-vue\\'
let fd_src = fd + 'examples\\'
let fd_tar = fd + 'test-screenshot\\'
let fd_mod = fd + 'test-src\\' //動態載入(dynamic import)模組之路徑, 直接給絕對檔案路徑
fd_mod = fd_mod.replace(/\\/g, '/') //改成linux路徑反斜線
fd_mod = 'file:///' + fd_mod //添加file開頭


let mode = 'build'
mode = ''
if (mode === 'build') {
    buildExpected(fd_src, fd_tar, fd_mod)
}
else {
    testExpected(fd_src, fd_tar, fd_mod)
}
