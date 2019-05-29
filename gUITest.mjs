import { buildExpected, testExpected } from 'w-puppeteer-uitest/src/testScreenshot.mjs'


let fd = 'D:\\開源-NodeJS-w-aggrid-vue\\w-aggrid-vue\\'
let fd_html = fd + 'examples\\'
let fd_screen = fd + 'test-screenshot\\'
let fd_action = fd + 'test-src\\' //動態載入(dynamic import)模組之路徑, 直接給絕對檔案路徑
fd_action = fd_action.replace(/\\/g, '/') //改成linux路徑反斜線
fd_action = 'file:///' + fd_action //添加file開頭


let mode = 'build'
mode = ''
if (mode === 'build') {
    buildExpected(fd_html, fd_screen, fd_action)
}
else {
    testExpected(fd_html, fd_screen, fd_action)
}

