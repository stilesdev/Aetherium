import 'bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css'

import Vue from 'vue'
import { CompatVue } from '@vue/runtime-dom'

import store from './store'
import router from './router'
import Aetherium from './components/Aetherium.vue'

declare global {
    interface Window {
        vApp: CompatVue
    }
}

new Vue({
    store,
    router,
    render: (h: Function) => h(Aetherium),
}).$mount('#app')
