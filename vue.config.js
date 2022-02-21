/* eslint-disable */
const webpack = require('webpack')

module.exports = {
    configureWebpack: {
        plugins: [
            new webpack.ProvidePlugin({
                jQuery: 'jquery',
                $: 'jquery',
                jquery: 'jquery',
                url: require.resolve('url'),
            }),
        ],
    },
    devServer: {
        allowedHosts: ['.stiles.me']
    }
}
