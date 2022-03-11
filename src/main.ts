import 'bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createStore } from './store'
import { createRouter } from './router'
import App from './components/App.vue'

const pinia = createPinia()
const store = createStore()
const router = createRouter(store)

const app = createApp(App)

app.use(pinia)
app.use(store)
app.use(router)

app.mount('#app')
