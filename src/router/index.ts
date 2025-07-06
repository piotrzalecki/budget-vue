import { createRouter, createWebHistory } from 'vue-router'
import { useSessionStore } from '@/stores/session'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', redirect: '/dashboard' },
    { path: '/login', component: () => import('../pages/LoginPage.vue') },
    { path: '/dashboard', component: () => import('../pages/DashboardPage.vue') },
    { path: '/transactions', component: () => import('../pages/TransactionsPage.vue') },
    { path: '/recurring', component: () => import('../pages/RecurringPage.vue') },
    { path: '/tags', component: () => import('../pages/TagsPage.vue') },
    { path: '/settings', component: () => import('../pages/SettingsPage.vue') },
    { path: '/:pathMatch(.*)', component: () => import('../pages/NotFound.vue') },
  ],
})

// Navigation guard
router.beforeEach((to, from, next) => {
  const sessionStore = useSessionStore()

  // Load API key from storage on app start
  if (!sessionStore.apiKey) {
    sessionStore.loadFromStorage()
  }

  // Redirect to login if no API key (except for login page)
  if (to.path !== '/login' && !sessionStore.apiKey) {
    next('/login')
  } else {
    next()
  }
})

export default router
