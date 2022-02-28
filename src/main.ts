import 'bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css'

import { createApp } from 'vue'
import { createStore } from './store'
import { createRouter } from './router'
import Aetherium from './components/Aetherium.vue'

const store = createStore()
const router = createRouter(store)

const app = createApp(Aetherium)

app.use(store)
app.use(router)

app.mount('#app')
