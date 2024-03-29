import 'bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createRouter } from './router'
import { createFirebase } from './plugins/firebase'
import App from './components/App.vue'

const app = createApp(App)

const pinia = createPinia()
app.use(pinia)
app.use(createFirebase(pinia))
app.use(createRouter(pinia))

app.mount('#app')
