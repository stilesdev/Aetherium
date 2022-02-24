import 'bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css'

import Vue, { CreateElement } from 'vue'
import datePicker from 'vue-bootstrap-datetimepicker'
import 'eonasdan-bootstrap-datetimepicker/build/css/bootstrap-datetimepicker.min.css'

import store from './store'
import router from './router'
import Aetherium from './components/Aetherium.vue'

Vue.use(datePicker)

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
