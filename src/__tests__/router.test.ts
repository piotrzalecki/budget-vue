import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createRouter, createWebHistory } from 'vue-router'
import { navigationItems } from '../router'
import { useSessionStore } from '../stores/session'

// Mock the page components
vi.mock('../pages/LoginPage.vue', () => ({
  default: { template: '<div>Login Page</div>' },
}))

vi.mock('../pages/DashboardPage.vue', () => ({
  default: { template: '<div>Dashboard Page</div>' },
}))

vi.mock('../pages/TransactionsPage.vue', () => ({
  default: { template: '<div>Transactions Page</div>' },
}))

vi.mock('../pages/RecurringPage.vue', () => ({
  default: { template: '<div>Recurring Page</div>' },
}))

vi.mock('../pages/TagsPage.vue', () => ({
  default: { template: '<div>Tags Page</div>' },
}))

vi.mock('../pages/SettingsPage.vue', () => ({
  default: { template: '<div>Settings Page</div>' },
}))

vi.mock('../pages/NotFound.vue', () => ({
  default: { template: '<div>Not Found Page</div>' },
}))

describe('Router Configuration', () => {
  let router: any

  beforeEach(() => {
    setActivePinia(createPinia())

    // Mock sessionStorage
    vi.spyOn(sessionStorage, 'getItem').mockReturnValue(null)
    vi.spyOn(sessionStorage, 'setItem').mockImplementation(() => undefined)
    vi.spyOn(sessionStorage, 'removeItem').mockImplementation(() => undefined)

    // Create a fresh router instance for each test
    router = createRouter({
      history: createWebHistory(),
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

    // Add navigation guard
    router.beforeEach((to: any, from: any, next: any) => {
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
  })

  describe('Navigation Items', () => {
    it('exports navigation items with correct structure', () => {
      expect(navigationItems).toBeDefined()
      expect(Array.isArray(navigationItems)).toBe(true)
      expect(navigationItems.length).toBe(5)

      navigationItems.forEach(item => {
        expect(item).toHaveProperty('title')
        expect(item).toHaveProperty('path')
        expect(item).toHaveProperty('name')
        expect(item).toHaveProperty('icon')
      })
    })

    it('has all required navigation routes', () => {
      const expectedRoutes = ['dashboard', 'transactions', 'recurring', 'tags', 'settings']

      expectedRoutes.forEach(routeName => {
        const found = navigationItems.find(item => item.name === routeName)
        expect(found).toBeDefined()
        expect(found?.path).toBe(`/${routeName}`)
      })
    })
  })

  describe('Route Configuration', () => {
    it('redirects root path to dashboard when authenticated', async () => {
      const sessionStore = useSessionStore()
      sessionStore.setKey('test-api-key')

      await router.push('/')
      expect(router.currentRoute.value.path).toBe('/dashboard')
    })

    it('has named routes for all pages', () => {
      const routes = router.getRoutes()
      const namedRoutes = routes.filter(route => route.name)

      // We have 7 named routes: login, dashboard, transactions, recurring, tags, settings, not-found
      // The redirect route doesn't have a name
      expect(namedRoutes).toHaveLength(7)

      const expectedNames = [
        'login',
        'dashboard',
        'transactions',
        'recurring',
        'tags',
        'settings',
        'not-found',
      ]
      expectedNames.forEach(name => {
        const route = routes.find(r => r.name === name)
        expect(route).toBeDefined()
      })
    })

    it('has lazy-loaded components', () => {
      const routes = router.getRoutes()
      // Filter routes that have components (excluding the redirect route)
      const pageRoutes = routes.filter(route => route.component && route.path !== '/')

      expect(pageRoutes.length).toBeGreaterThan(0)
      pageRoutes.forEach(route => {
        expect(typeof route.component).toBe('function')
      })
    })
  })

  describe('Authentication Guard', () => {
    it('redirects to login when no API key is present', async () => {
      const sessionStore = useSessionStore()
      sessionStore.clearKey()

      await router.push('/dashboard')
      expect(router.currentRoute.value.path).toBe('/login')
    })

    it('allows access to login page without API key', async () => {
      const sessionStore = useSessionStore()
      sessionStore.clearKey()

      await router.push('/login')
      expect(router.currentRoute.value.path).toBe('/login')
    })

    it('allows access to protected routes when API key is present', async () => {
      const sessionStore = useSessionStore()
      sessionStore.setKey('test-api-key')

      await router.push('/transactions')
      expect(router.currentRoute.value.path).toBe('/transactions')
    })

    it('loads API key from storage on navigation', async () => {
      const sessionStore = useSessionStore()

      // Clear the spy and set up a new one for this specific test
      vi.restoreAllMocks()
      const mockApiKey = 'stored-api-key'
      vi.spyOn(sessionStorage, 'getItem').mockReturnValue(mockApiKey)

      sessionStore.clearKey()
      expect(sessionStore.apiKey).toBe('')

      await router.push('/dashboard')

      // Should have loaded from storage
      expect(sessionStorage.getItem).toHaveBeenCalledWith('apiKey')
    })
  })

  describe('404 Handling', () => {
    it('shows not found page for unknown routes when authenticated', async () => {
      const sessionStore = useSessionStore()
      sessionStore.setKey('test-api-key')

      await router.push('/unknown-route')
      expect(router.currentRoute.value.name).toBe('not-found')
    })

    it('handles nested unknown routes when authenticated', async () => {
      const sessionStore = useSessionStore()
      sessionStore.setKey('test-api-key')

      await router.push('/dashboard/nested/unknown')
      expect(router.currentRoute.value.name).toBe('not-found')
    })

    it('redirects to login for unknown routes when not authenticated', async () => {
      const sessionStore = useSessionStore()
      sessionStore.clearKey()

      await router.push('/unknown-route')
      expect(router.currentRoute.value.path).toBe('/login')
    })
  })

  describe('Route Navigation', () => {
    it('navigates to transactions page correctly', async () => {
      const sessionStore = useSessionStore()
      sessionStore.setKey('test-api-key')

      await router.push('/transactions')
      expect(router.currentRoute.value.path).toBe('/transactions')
      expect(router.currentRoute.value.name).toBe('transactions')
    })

    it('navigates to dashboard page correctly', async () => {
      const sessionStore = useSessionStore()
      sessionStore.setKey('test-api-key')

      await router.push('/dashboard')
      expect(router.currentRoute.value.path).toBe('/dashboard')
      expect(router.currentRoute.value.name).toBe('dashboard')
    })
  })
})
