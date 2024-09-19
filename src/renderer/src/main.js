import { createApp } from 'vue'
import App from './App.vue'

import Router from '../../router'
import { createPinia } from 'pinia'

import 'vant/lib/index.css';
import './assets/css/init.scss'
import './assets/css/comm.scss'

const app = createApp(App)

app.use(Router)
app.use(createPinia())
app.mount('#app')
