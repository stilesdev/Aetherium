import 'bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css'

import { createApp } from 'vue'
import { createStore } from './store'
import { createRouter } from './router'
import App from './components/App.vue'

const store = createStore()
const router = createRouter(store)

const app = createApp(App)

app.use(store)
app.use(router)

app.mount('#app')
