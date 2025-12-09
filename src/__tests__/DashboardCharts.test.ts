import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import DashboardCharts from '../components/charts/DashboardCharts.vue'

// Mock the composables and stores
vi.mock('../composables/useMoneyFormat', () => ({
  useMoneyFormat: () => (value: number) => `£${(value / 100).toFixed(2)}`,
}))

vi.mock('../stores/reports', () => ({
  useReportsStore: () => ({
    loading: false,
    fetchMonth: vi.fn(),
    fetchMonthTotals: vi.fn(),
  }),
}))

vi.mock('../stores/settings', () => ({
  useSettingsStore: () => ({
    loadFromStorage: vi.fn(),
    getDaysUntilPayday: () => 15,
  }),
}))

// Mock Vuetify theme
vi.mock('vuetify', () => ({
  useTheme: () => ({
    current: {
      value: {
        dark: false,
        colors: {
          success: '#4CAF50',
          error: '#F44336',
        },
      },
    },
  }),
}))

// Mock ECharts
vi.mock('vue-echarts', () => ({
  default: {
    name: 'VueEcharts',
    template: '<div data-testid="echarts"></div>',
  },
}))

describe('DashboardCharts', () => {
  let wrapper: any

  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  const createWrapper = (props = {}) => {
    return mount(DashboardCharts, {
      props,
      global: {
        plugins: [createPinia()],
      },
    })
  }

  describe('pieOption computed property', () => {
    it('should return empty data when currentMonth is null', () => {
      wrapper = createWrapper()

      // Access the component instance to test computed properties
      const vm = wrapper.vm

      // Set currentMonth to null
      vm.currentMonth = null

      const pieOption = vm.pieOption

      expect(pieOption.series[0].data).toEqual([])
      expect(pieOption.series[0].type).toBe('pie')
    })

    it('should return empty data when currentMonth.by_tag is null', () => {
      wrapper = createWrapper()

      const vm = wrapper.vm
      vm.currentMonth = { by_tag: null }

      const pieOption = vm.pieOption

      expect(pieOption.series[0].data).toEqual([])
    })

    it('should process by_tag data correctly', () => {
      wrapper = createWrapper()

      const vm = wrapper.vm
      vm.currentMonth = {
        by_tag: {
          Food: { total_out: '100.50' },
          Transport: { total_out: '50.25' },
          Entertainment: { total_out: '0' }, // Should be filtered out
        },
      }

      const pieOption = vm.pieOption

      expect(pieOption.series[0].data).toHaveLength(2)
      expect(pieOption.series[0].data[0]).toEqual({
        name: 'Food',
        value: 10050, // 100.50 * 100
      })
      expect(pieOption.series[0].data[1]).toEqual({
        name: 'Transport',
        value: 5025, // 50.25 * 100
      })
    })

    it('should handle malformed by_tag data', () => {
      wrapper = createWrapper()

      const vm = wrapper.vm
      vm.currentMonth = {
        by_tag: {
          Food: { total_out: null },
          Transport: { total_out: undefined },
          Entertainment: { total_out: 'invalid' },
        },
      }

      const pieOption = vm.pieOption

      // Should filter out all entries with invalid total_out values
      expect(pieOption.series[0].data).toEqual([])
    })

    it('should handle empty by_tag object', () => {
      wrapper = createWrapper()

      const vm = wrapper.vm
      vm.currentMonth = { by_tag: {} }

      const pieOption = vm.pieOption

      expect(pieOption.series[0].data).toEqual([])
    })
  })

  describe('barOption computed property', () => {
    it('should return empty data when lastSixMonths is null', () => {
      wrapper = createWrapper()

      const vm = wrapper.vm
      vm.lastSixMonths = null

      const barOption = vm.barOption

      expect(barOption.series).toEqual([])
      expect(barOption.xAxis.data).toEqual([])
    })

    it('should return empty data when lastSixMonths is empty array', () => {
      wrapper = createWrapper()

      const vm = wrapper.vm
      vm.lastSixMonths = []

      const barOption = vm.barOption

      expect(barOption.series).toEqual([])
      expect(barOption.xAxis.data).toEqual([])
    })

    it('should process lastSixMonths data correctly', () => {
      wrapper = createWrapper()

      const vm = wrapper.vm
      vm.lastSixMonths = [
        { total_in: '1000.00', total_out: '500.00' },
        { total_in: '1200.00', total_out: '600.00' },
      ]

      const barOption = vm.barOption

      expect(barOption.series).toHaveLength(2)
      expect(barOption.series[0].name).toBe('Income')
      expect(barOption.series[0].data).toEqual([100000, 120000]) // Converted to pence
      expect(barOption.series[1].name).toBe('Expense')
      expect(barOption.series[1].data).toEqual([50000, 60000]) // Converted to pence
    })

    it('should handle malformed lastSixMonths data', () => {
      wrapper = createWrapper()

      const vm = wrapper.vm
      vm.lastSixMonths = [
        { total_in: null, total_out: undefined },
        { total_in: 'invalid', total_out: 'also_invalid' },
        { total_in: '1000.00', total_out: '500.00' },
      ]

      const barOption = vm.barOption

      expect(barOption.series[0].data).toEqual([0, 0, 100000]) // Invalid values become 0
      expect(barOption.series[1].data).toEqual([0, 0, 50000])
    })

    it('should handle null/undefined report objects', () => {
      wrapper = createWrapper()

      const vm = wrapper.vm
      vm.lastSixMonths = [null, undefined, { total_in: '1000.00', total_out: '500.00' }]

      const barOption = vm.barOption

      expect(barOption.series[0].data).toEqual([0, 0, 100000])
      expect(barOption.series[1].data).toEqual([0, 0, 50000])
    })
  })

  describe('fetchData method', () => {
    it('should handle API errors gracefully', async () => {
      const mockReportsStore = {
        loading: false,
        fetchMonth: vi.fn().mockRejectedValue(new Error('API Error')),
        fetchMonthTotals: vi.fn().mockRejectedValue(new Error('API Error')),
      }

      // Mock the store
      vi.doMock('../stores/reports', () => ({
        useReportsStore: () => mockReportsStore,
      }))

      wrapper = createWrapper()

      const vm = wrapper.vm

      // Should not throw an error
      await expect(vm.fetchData()).resolves.not.toThrow()
    })

    it('should handle null API responses', async () => {
      const mockReportsStore = {
        loading: false,
        fetchMonth: vi.fn().mockResolvedValue(null),
        fetchMonthTotals: vi.fn().mockResolvedValue(null),
      }

      vi.doMock('../stores/reports', () => ({
        useReportsStore: () => mockReportsStore,
      }))

      wrapper = createWrapper()

      const vm = wrapper.vm

      await vm.fetchData()

      expect(vm.currentMonth).toBeNull()
      expect(vm.lastSixMonths).toEqual([])
    })

    it('should handle API responses with data wrapper', async () => {
      const mockReportsStore = {
        loading: false,
        fetchMonth: vi.fn().mockResolvedValue({
          data: { total_in: '1000.00', total_out: '500.00' },
        }),
        fetchMonthTotals: vi.fn().mockResolvedValue({
          data: { total_in: '1000.00', total_out: '500.00' },
        }),
      }

      vi.doMock('../stores/reports', () => ({
        useReportsStore: () => mockReportsStore,
      }))

      wrapper = createWrapper()

      const vm = wrapper.vm

      await vm.fetchData()

      expect(vm.currentMonth).toEqual({ total_in: '1000.00', total_out: '500.00' })
      expect(vm.lastSixMonths).toHaveLength(6)
    })
  })

  describe('component rendering', () => {
    it('should render without crashing', () => {
      wrapper = createWrapper()

      expect(wrapper.exists()).toBe(true)
      expect(wrapper.find('[data-testid="echarts"]').exists()).toBe(true)
    })

    it('should display loading state', () => {
      const mockReportsStore = {
        loading: true,
        fetchMonth: vi.fn(),
        fetchMonthTotals: vi.fn(),
      }

      vi.doMock('../stores/reports', () => ({
        useReportsStore: () => mockReportsStore,
      }))

      wrapper = createWrapper()

      // The loading prop should be passed to the echarts components
      const echartsComponents = wrapper.findAllComponents({ name: 'VueEcharts' })
      expect(echartsComponents).toHaveLength(2)
    })
  })

  describe('error boundary tests', () => {
    it('should not crash when currentMonth has unexpected structure', () => {
      wrapper = createWrapper()

      const vm = wrapper.vm

      // Test with various malformed data structures
      const malformedData = [
        { by_tag: 'not an object' },
        { by_tag: { Food: 'not an object' } },
        { by_tag: { Food: { total_out: [] } } },
      ]

      malformedData.forEach(data => {
        vm.currentMonth = data
        expect(() => vm.pieOption).not.toThrow()
      })
    })

    it('should not crash when lastSixMonths has unexpected structure', () => {
      wrapper = createWrapper()

      const vm = wrapper.vm

      // Test with various malformed data structures
      const malformedData = [
        'not an array',
        [{ total_in: [] }],
        [{ total_in: null, total_out: null }],
      ]

      malformedData.forEach(data => {
        vm.lastSixMonths = data
        expect(() => vm.barOption).not.toThrow()
      })
    })
  })
})
