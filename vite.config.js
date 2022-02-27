import { resolve } from 'path'
import inject from '@rollup/plugin-inject'
import { defineConfig } from 'vite'
import { createVuePlugin } from 'vite-plugin-vue2'

export default defineConfig({
    plugins: [
        createVuePlugin(),
        inject({
            jQuery: 'jquery',
            $: 'jquery',
        })
    ],
    // css: {
    //     postcss: {
    //         plugins: {
    //             autoprefixer: {},
    //         }
    //     }
    // },
    resolve: {
        alias: {
            '@': resolve(__dirname, 'src'),
        }
    }
})
