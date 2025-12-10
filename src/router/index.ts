import { useSessionStore } from '@/stores/session'
import { createRouter, createWebHistory } from 'vue-router'

// Navigation menu items - exported for use in navigation drawer
export const navigationItems = [
  { title: 'Dashboard', path: '/dashboard', name: 'dashboard', icon: 'mdi-view-dashboard' },
  {
    title: 'Transactions',
    path: '/transactions',
    name: 'transactions',
    icon: 'mdi-format-list-bulleted',
  },
  { title: 'Recurring', path: '/recurring', name: 'recurring', icon: 'mdi-refresh' },
  { title: 'Tags', path: '/tags', name: 'tags', icon: 'mdi-tag' },
  { title: 'Settings', path: '/settings', name: 'settings', icon: 'mdi-cog' },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', redirect: '/dashboard' },
    {
      path: '/login',
      name: 'login',
      component: () => import('../pages/LoginPage.vue'),
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('../pages/DashboardPage.vue'),
    },
    {
      path: '/transactions',
      name: 'transactions',
      component: () => import('../pages/TransactionsPage.vue'),
    },
    {
      path: '/recurring',
      name: 'recurring',
      component: () => import('../pages/RecurringPage.vue'),
    },
    {
      path: '/tags',
      name: 'tags',
      component: () => import('../pages/TagsPage.vue'),
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('../pages/SettingsPage.vue'),
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('../pages/NotFound.vue'),
    },
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
