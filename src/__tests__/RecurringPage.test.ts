import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { describe, expect, it, vi } from 'vitest'
import RecurringPage from '../pages/RecurringPage.vue'

// Mock the composables
vi.mock('../composables/useApi', () => ({
  useApi: () => ({
    post: vi.fn(),
    get: vi.fn(),
  }),
}))

vi.mock('../composables/useSnackbar', () => ({
  useSnackbar: () => ({
    push: vi.fn(),
  }),
}))

// Mock the components
vi.mock('../components/RecurringTable.vue', () => ({
  default: {
    name: 'RecurringTable',
    template: '<div data-testid="recurring-table">RecurringTable</div>',
  },
}))

vi.mock('../components/RecurringFormDrawer.vue', () => ({
  default: {
    name: 'RecurringFormDrawer',
    template: '<div data-testid="recurring-form-drawer">RecurringFormDrawer</div>',
  },
}))

describe('RecurringPage', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('renders correctly', () => {
    const wrapper = mount(RecurringPage)

    expect(wrapper.find('h1').text()).toBe('Recurring Transactions')
    expect(wrapper.find('[data-testid="recurring-table"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="recurring-form-drawer"]').exists()).toBe(true)
    expect(wrapper.find('.v-btn--fab').exists()).toBe(true)
  })

  it('has floating action button for adding new recurring transactions', () => {
    const wrapper = mount(RecurringPage)
    const fab = wrapper.find('.v-btn--fab')

    expect(fab.exists()).toBe(true)
    expect(fab.find('.mdi-plus').exists()).toBe(true)
  })
})
