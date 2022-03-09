import { resolve } from 'path'
import inject from '@rollup/plugin-inject'
import { defineConfig } from 'vite'
import createVuePlugin from '@vitejs/plugin-vue'

export default defineConfig({
    plugins: [
        createVuePlugin(),
        inject({
            jQuery: 'jquery',
            $: 'jquery',
        }),
    ],
    build: {
        rollupOptions: {
            output: {
                manualChunks: {
                    firebase: ['firebase/app', 'firebase/app-check', 'firebase/auth', 'firebase/database'],
                },
            },
        },
    },
    css: {
        postcss: {
            plugins: [require('autoprefixer')],
        },
    },
    define: {
        'import.meta.vitest': false,
    },
    resolve: {
        alias: {
            '@': resolve(__dirname, 'src'),
        },
    },
    test: {
        includeSource: ['src/**/*.{js,ts}'],
    },
})
