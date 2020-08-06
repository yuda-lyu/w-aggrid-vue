import { build, test } from 'w-puppeteer-uitest/src/exp.mjs'


let fd = 'D:\\開源-JS-103-2-w-aggrid-vue\\w-aggrid-vue\\'
let fd_html = fd + 'examples\\'
let fd_out = fd + 'test-screenshot\\'
let fd_action = fd + 'test-action\\'


let optExp = {
    headless: true,
    num_web: 10,
    ratio_similar: 0.97,
    // htmlFilter: function(vs) {
    //     console.log(vs)
    //     return ['ex-click.html']
    // }
}
//build(fd_html, fd_action, fd_out, optExp)
test(fd_html, fd_action, fd_out, optExp)
