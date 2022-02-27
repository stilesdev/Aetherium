import { resolve } from 'path'
import inject from '@rollup/plugin-inject'
import { defineConfig } from 'vite'
import createVuePlugin from '@vitejs/plugin-vue'

export default defineConfig({
    plugins: [
        createVuePlugin({
            template: {
                compilerOptions: {
                    compatConfig: {
                        MODE: 2,
                    },
                },
            },
        }),
        inject({
            jQuery: 'jquery',
            $: 'jquery',
        }),
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
            vue: '@vue/compat',
        },
    },
})
