module.exports = {
    transpileDependencies: ['wsemi/src/'],
    // chainWebpack: config => {
    //     config.module
    //         .rule('vue')
    //         .use('vue-loader')
    //         .loader('vue-loader')
    //         .tap(options => {
    //             // 修改它的选项...
    //             return options
    //         })
    // }
    configureWebpack: {
        module: {
            rules: [
                {
                    test: /\.mjs$/,
                    loader: 'babel-loader',
                    include: (file) => {
                        console.log('file', file)
                        return true
                    },
                    // exclude: file => {
                    //     let bb = file.indexOf('wsemi') >= 0
                    //     let b = /node_modules/.test(file) && !/\.vue\.js/.test(file)
                    //     if (bb) {
                    //         console.log('file', file, ' b=', b)
                    //     }
                    //     return false
                    // }
                },
            ]
        },
    }
}
