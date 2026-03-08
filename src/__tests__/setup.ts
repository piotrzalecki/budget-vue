import { vi } from 'vitest'

// Mock CSS imports
vi.mock('*.css', () => ({}))
vi.mock('*.scss', () => ({}))
vi.mock('*.sass', () => ({}))
vi.mock('*.less', () => ({}))
vi.mock('*.styl', () => ({}))
vi.mock('*.stylus', () => ({}))

// Mock Vuetify components
vi.mock('vuetify/components', () => ({}))
vi.mock('vuetify/directives', () => ({}))

// Mock ECharts
vi.mock('vue-echarts', () => ({
  default: {
    name: 'VueEcharts',
    template: '<div data-testid="echarts"></div>',
  },
}))

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock localStorage (required by @vue/devtools-kit in test environments)
class LocalStorageMock {
  private store: Record<string, string> = {}
  getItem(key: string) { return this.store[key] ?? null }
  setItem(key: string, value: string) { this.store[key] = value }
  removeItem(key: string) { delete this.store[key] }
  clear() { this.store = {} }
}
Object.defineProperty(global, 'localStorage', {
  value: new LocalStorageMock(),
  writable: true,
})
