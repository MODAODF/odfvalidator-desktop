import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './styles/styles.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import i18n from './plugins/i18n'

const pinia = createPinia()
const app = createApp(App).use(i18n)

app.use(pinia)
app.use(router)
app.mount('#app')
    .$nextTick(() => {
        postMessage({ payload: 'removeLoading'}, '*')
    })
