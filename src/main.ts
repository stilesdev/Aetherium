import 'bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css'

import Vue, { CreateElement } from 'vue'

import store from './store'
import router from './router'
import Aetherium from './components/Aetherium.vue'

declare global {
    interface Window {
        vApp: Vue
    }
}

window.vApp = new Vue({
    store,
    router,
    render: (h: CreateElement) => h(Aetherium),
}).$mount('#app')
