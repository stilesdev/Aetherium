/* eslint-disable */
const webpack = require('webpack')

module.exports = {
    configureWebpack: {
        plugins: [
            new webpack.ProvidePlugin({
                jQuery: 'jquery',
                $: 'jquery',
                jquery: 'jquery'
            })
        ]
    },
    devServer: {
        allowedHosts: ['.stiles.me']
    }
}
