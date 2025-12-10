import '@mdi/font/css/materialdesignicons.css'
import './assets/main.css'

import { createPinia } from 'pinia'
import { createApp } from 'vue'

import App from './App.vue'
import vuetify from './plugins/vuetify'
import router from './router'
import { useSessionStore } from './stores/session'
import { useThemeStore } from './stores/theme'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(vuetify)

// Initialize stores
const themeStore = useThemeStore()
themeStore.loadFromStorage()

const sessionStore = useSessionStore()
sessionStore.loadFromStorage()

// Wait for router to be ready before mounting
router.isReady().then(() => {
  app.mount('#app')
})
