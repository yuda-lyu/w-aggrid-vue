# w-aggrid-vue
A wrapper for ag-grid-vue.

![language](https://img.shields.io/badge/language-JavaScript-orange.svg) 
[![language](https://img.shields.io/badge/vue-2.x-brightgreen.svg)](https://github.com/vuejs/vue) 
[![npm version](http://img.shields.io/npm/v/w-aggrid-vue.svg?style=flat)](https://npmjs.org/package/w-aggrid-vue) 
[![Build Status](https://travis-ci.org/yuda-lyu/w-aggrid-vue.svg?branch=master)](https://travis-ci.org/yuda-lyu/w-aggrid-vue) 
[![license](https://img.shields.io/npm/l/w-aggrid-vue.svg?style=flat)](https://npmjs.org/package/w-aggrid-vue) 
[![gzip file size](http://img.badgesize.io/yuda-lyu/w-aggrid-vue/master/dist/w-aggrid-vue.umd.js.svg?compression=gzip)](https://github.com/yuda-lyu/w-aggrid-vue)
[![npm download](https://img.shields.io/npm/dt/w-aggrid-vue.svg)](https://npmjs.org/package/w-aggrid-vue) 
[![jsdelivr download](https://img.shields.io/jsdelivr/npm/hm/w-aggrid-vue.svg)](https://www.jsdelivr.com/package/npm/w-aggrid-vue)

## Documentation
To view documentation or get support, visit [docs](https://yuda-lyu.github.io/w-aggrid-vue/module-WAgGridVue.html).

## Example
To view some examples for more understanding, visit examples:

> **all examples:** [web](https://yuda-lyu.github.io/w-aggrid-vue/examples/app.html) [[source code](https://github.com/yuda-lyu/w-aggrid-vue/blob/master/docs/examples/app.html)]

## Installation
### Using npm(ES6 module):
> **Note:** w-aggrid-vue depends on `ag-grid-community` and `ag-grid-vue`.
```alias
npm i w-aggrid-vue
```

### In a browser(UMD module):
> **Note:** w-aggrid-vue depends on `vue`, `ag-grid-community` and `ag-grid-vue`.

> **Note:** umd file includes with `lodash` and `wsemi`, by using tree-shaking for dead-code elimination.

[Optional] Add script with nomodule for IE11.
```alias
<script nomodule src="https://cdn.jsdelivr.net/npm/@babel/polyfill/dist/polyfill.min.js"></script>
```
[Necessary] Add script for vue.
```alias
<script src="https://cdn.jsdelivr.net/npm/vue/dist/vue.min.js"></script>
```
[Necessary] Add script for ag-grid-community and don't need to include css, because has included them by umd file.
```alias
<script src="https://cdn.jsdelivr.net/npm/ag-grid-community@23.2.1/dist/ag-grid-community.min.noStyle.js"></script>
or
<script src="https://cdn.jsdelivr.net/npm/ag-grid-enterprise@23.2.1/dist/ag-grid-enterprise.min.noStyle.js"></script>
```
[Necessary] Add script for ag-grid-vue.
```alias
<script src="https://cdn.jsdelivr.net/npm/ag-grid-vue/dist/ag-grid-vue.umd.js"></script>
```
[Necessary] Add script for w-aggrid-vue.
```alias
<script src="https://cdn.jsdelivr.net/npm/w-aggrid-vue@2.0.6/dist/w-aggrid-vue.umd.js"></script>
```
