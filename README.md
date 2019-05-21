# w-aggrid-vue
A support package for web developer.

![language](https://img.shields.io/badge/language-JavaScript-orange.svg) [![npm version](http://img.shields.io/npm/v/w-aggrid-vue.svg?style=flat)](https://npmjs.org/package/w-aggrid-vue) [![Build Status](https://travis-ci.org/yuda-lyu/w-aggrid-vue.svg?branch=master)](https://travis-ci.org/yuda-lyu/w-aggrid-vue) [![npm download](https://img.shields.io/npm/dt/w-aggrid-vue.svg)](https://npmjs.org/package/w-aggrid-vue) [![license](https://img.shields.io/npm/l/w-aggrid-vue.svg?style=flat)](https://npmjs.org/package/w-aggrid-vue)

## Example
To view some examples for more understanding, visit examples:
> **ag-grid-vue:** [ex-small.html](https://yuda-lyu.github.io/w-aggrid-vue/examples/ex-small.html)

> **ag-grid-vue:** [ex-large.html](https://yuda-lyu.github.io/w-aggrid-vue/examples/ex-large.html)

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
> **Note:** include script for `ag-grid-vue`.
```alias
<script src="https://cdn.jsdelivr.net/npm/vue/dist/vue.min.js"></script>
```
[Necessary] Add script for ag-grid-community.
> **Note:** include script for `ag-grid-vue`.
```alias
<script src="https://unpkg.com/ag-grid-community@20.2.0/dist/ag-grid-community.min.noStyle.js"></script>
<link rel="stylesheet" href="https://unpkg.com/ag-grid-community@20.2.0/dist/styles/ag-grid.css">
<link rel="stylesheet" href="https://unpkg.com/ag-grid-community@20.2.0/dist/styles/ag-theme-balham.css">
```
[Necessary] Add script for vue-class-component.
> **Note:** include script for `ag-grid-vue`.
```alias
<script src="https://cdn.jsdelivr.net/npm/vue-class-component/dist/vue-class-component.js"></script>
```
[Necessary] Add script for vue-property-decorator.
> **Note:** include script for `ag-grid-vue`.
```alias
<script src="https://cdn.jsdelivr.net/npm/vue-property-decorator/lib/vue-property-decorator.umd.min.js"></script>
```
[Necessary] Add script for ag-grid-vue.
> **Note:** include script for `w-aggrid-vue`.
```alias
<script src="https://cdn.jsdelivr.net/npm/ag-grid-vue/dist/ag-grid-vue.umd.js"></script>
```
[Necessary] Add script for w-aggrid-vue.
```alias
<script src="https://cdn.jsdelivr.net/npm/w-aggrid-vue@1.0.0/dist/w-aggrid-vue.umd.js"></script>
```
