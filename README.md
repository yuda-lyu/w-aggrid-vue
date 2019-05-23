# w-aggrid-vue
A support package for web developer.

![language](https://img.shields.io/badge/language-Javascript-orange.svg) [![language](https://img.shields.io/badge/vue-2.x-brightgreen.svg)](https://github.com/vuejs/vue) [![npm version](http://img.shields.io/npm/v/w-aggrid-vue.svg?style=flat)](https://npmjs.org/package/w-aggrid-vue) [![Build Status](https://travis-ci.org/yuda-lyu/w-aggrid-vue.svg?branch=master)](https://travis-ci.org/yuda-lyu/w-aggrid-vue) [![license](https://img.shields.io/npm/l/w-aggrid-vue.svg?style=flat)](https://npmjs.org/package/w-aggrid-vue) [![npm download](https://img.shields.io/npm/dt/w-aggrid-vue.svg)](https://npmjs.org/package/w-aggrid-vue) [![jsdelivr download](https://data.jsdelivr.com/v1/package/npm/w-jsonview-tree/badge)](https://www.jsdelivr.com/package/npm/w-jsonview-tree)

## Documentation
To view documentation or get support, visit [docs](https://yuda-lyu.github.io/w-aggrid-vue/module-WAgGridVue.html).

## Example
To view some examples for more understanding, visit examples:
> **simple:** [ex-simple.html](https://yuda-lyu.github.io/w-aggrid-vue/examples/ex-simple.html) [[source code](https://github.com/yuda-lyu/w-aggrid-vue/blob/master/docs/examples/ex-simple.html)]

> **tableHeight:** [ex-tableHeight.html](https://yuda-lyu.github.io/w-aggrid-vue/examples/ex-tableHeight.html) [[source code](https://github.com/yuda-lyu/w-aggrid-vue/blob/master/docs/examples/ex-tableHeight.html)]

> **tableWidth:** [ex-tableWidth.html](https://yuda-lyu.github.io/w-aggrid-vue/examples/ex-tableWidth.html) [[source code](https://github.com/yuda-lyu/w-aggrid-vue/blob/master/docs/examples/ex-tableWidth.html)]

> **tableWidthFull:** [ex-tableWidthFull.html](https://yuda-lyu.github.io/w-aggrid-vue/examples/ex-tableWidthFull.html) [[source code](https://github.com/yuda-lyu/w-aggrid-vue/blob/master/docs/examples/ex-tableWidthFull.html)]

> **kpHead:** [ex-kpHead.html](https://yuda-lyu.github.io/w-aggrid-vue/examples/ex-kpHead.html) [[source code](https://github.com/yuda-lyu/w-aggrid-vue/blob/master/docs/examples/ex-kpHead.html)]

> **kpHeadTooltip:** [ex-kpHeadTooltip.html](https://yuda-lyu.github.io/w-aggrid-vue/examples/ex-kpHeadTooltip.html) [[source code](https://github.com/yuda-lyu/w-aggrid-vue/blob/master/docs/examples/ex-kpHeadTooltip.html)]

> **large:** [ex-large.html](https://yuda-lyu.github.io/w-aggrid-vue/examples/ex-large.html) [[source code](https://github.com/yuda-lyu/w-aggrid-vue/blob/master/docs/examples/ex-large.html)]

## Installation
### Using npm(ES6 module):
> **Note:** w-aggrid-vue depends on lodash, wsemi, ag-grid-community, ag-grid-vue
```alias
npm i w-aggrid-vue
```

### In a browser(UMD module):
> **Note:** umd file includes with lodash and wsemi, by using tree-shaking for dead-code elimination

[Optional] Add script with nomodule for IE11.
```alias
<script nomodule src="https://cdn.jsdelivr.net/npm/@babel/polyfill/dist/polyfill.min.js"></script>
```
[Necessary] Add script for vue.
```alias
<script src="https://cdn.jsdelivr.net/npm/vue/dist/vue.min.js"></script>
```
[Necessary] Add script for ag-grid-community.
```alias
<script src="https://cdn.jsdelivr.net/npm/ag-grid-community/dist/ag-grid-community.min.noStyle.js"></script>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/ag-grid-community/dist/styles/ag-grid.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/ag-grid-community/dist/styles/ag-theme-balham.css">
```
[Necessary] Add script for ag-grid-vue.
```alias
<script src="https://cdn.jsdelivr.net/npm/ag-grid-vue/dist/ag-grid-vue.umd.js"></script>
```
[Necessary] Add script for w-aggrid-vue.
```alias
<script src="https://cdn.jsdelivr.net/npm/w-aggrid-vue@1.0.1/dist/w-aggrid-vue.umd.js"></script>
```
