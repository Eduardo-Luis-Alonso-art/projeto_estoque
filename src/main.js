import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

localStorage.removeItem('token')
localStorage.removeItem('usuario')

createApp(App)
  .use(router)
  .mount('#app')