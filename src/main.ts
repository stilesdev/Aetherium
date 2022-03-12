import 'bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createStore } from './store'
import { createRouter } from './router'
import { createFirebase } from './plugins/firebase'
import App from './components/App.vue'

const app = createApp(App)

app.use(createFirebase())
app.use(createPinia())
const store = createStore()
app.use(store)
app.use(createRouter(store))

app.mount('#app')
