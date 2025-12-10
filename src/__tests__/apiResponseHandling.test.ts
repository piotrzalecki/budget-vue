import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

// Mock axios
vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => ({
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() },
      },
      get: vi.fn(),
      post: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn(),
    })),
  },
}))

// Mock router
vi.mock('../router', () => ({
  default: {
    push: vi.fn(),
  },
}))

// Mock composables
vi.mock('../composables/useSnackbar', () => ({
  useSnackbar: () => ({
    push: vi.fn(),
  }),
}))

import { useApi } from '../composables/useApi'
import { useReportsStore } from '../stores/reports'
import { useTagsStore } from '../stores/tags'
import { useTransactionsStore } from '../stores/transactions'

describe('API Response Handling', () => {
  let api: any
  let transactionsStore: ReturnType<typeof useTransactionsStore>
  let tagsStore: ReturnType<typeof useTagsStore>
  let reportsStore: ReturnType<typeof useReportsStore>

  beforeEach(() => {
    setActivePinia(createPinia())
    api = useApi()
    transactionsStore = useTransactionsStore()
    tagsStore = useTagsStore()
    reportsStore = useReportsStore()
    vi.clearAllMocks()
  })

  describe('Transactions Store API Response Handling', () => {
    it('should handle successful API response with data wrapper', async () => {
      const mockResponse = {
        data: {
          data: [
            {
              id: 1,
              amount_pence: 1500,
              amount: '15.00',
              note: 'Test transaction',
              t_date: '2024-01-01',
              tags: [],
              created_at: '2024-01-01T00:00:00Z',
              updated_at: '2024-01-01T00:00:00Z',
            },
          ],
        },
      }

      api.get.mockResolvedValue(mockResponse)

      await transactionsStore.fetch()

      expect(transactionsStore.list).toHaveLength(1)
      expect(transactionsStore.list[0].id).toBe(1)
    })

    it('should handle API response without data wrapper', async () => {
      const mockResponse = {
        data: [
          {
            id: 1,
            amount_pence: 1500,
            amount: '15.00',
            note: 'Test transaction',
            t_date: '2024-01-01',
            tags: [],
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
          },
        ],
      }

      api.get.mockResolvedValue(mockResponse)

      await transactionsStore.fetch()

      expect(transactionsStore.list).toHaveLength(1)
    })

    it('should handle null API response', async () => {
      const mockResponse = {
        data: null,
      }

      api.get.mockResolvedValue(mockResponse)

      await transactionsStore.fetch()

      expect(transactionsStore.list).toEqual([])
    })

    it('should handle undefined API response', async () => {
      const mockResponse = {
        data: undefined,
      }

      api.get.mockResolvedValue(mockResponse)

      await transactionsStore.fetch()

      expect(transactionsStore.list).toEqual([])
    })

    it('should handle non-array API response', async () => {
      const mockResponse = {
        data: {
          data: 'not an array',
        },
      }

      api.get.mockResolvedValue(mockResponse)

      await transactionsStore.fetch()

      expect(transactionsStore.list).toEqual([])
    })

    it('should handle API error responses', async () => {
      api.get.mockRejectedValue(new Error('API Error'))

      await transactionsStore.fetch()

      expect(transactionsStore.list).toEqual([])
      expect(transactionsStore.loading).toBe(false)
    })

    it('should handle malformed transaction data', async () => {
      const mockResponse = {
        data: {
          data: [
            {
              id: 1,
              // Missing required fields
            },
            {
              id: 2,
              amount_pence: null,
              amount: null,
              note: null,
              t_date: '2024-01-01',
              tags: null,
              created_at: '2024-01-01T00:00:00Z',
              updated_at: '2024-01-01T00:00:00Z',
            },
          ],
        },
      }

      api.get.mockResolvedValue(mockResponse)

      await transactionsStore.fetch()

      expect(transactionsStore.list).toHaveLength(2)
      // Should not throw errors and should handle missing fields gracefully
      expect(transactionsStore.list[0].amount_pence).toBe(0)
      expect(transactionsStore.list[0].note).toBe('')
      expect(transactionsStore.list[0].tags).toEqual([])
    })
  })

  describe('Tags Store API Response Handling', () => {
    it('should handle successful API response with data wrapper', async () => {
      const mockResponse = {
        data: {
          data: [
            { id: 1, name: 'Food', color: '#FF0000' },
            { id: 2, name: 'Transport', color: '#00FF00' },
          ],
        },
      }

      api.get.mockResolvedValue(mockResponse)

      await tagsStore.fetch()

      expect(tagsStore.list).toHaveLength(2)
      expect(tagsStore.list[0].name).toBe('Food')
    })

    it('should handle API response without data wrapper', async () => {
      const mockResponse = {
        data: [{ id: 1, name: 'Food', color: '#FF0000' }],
      }

      api.get.mockResolvedValue(mockResponse)

      await tagsStore.fetch()

      expect(tagsStore.list).toHaveLength(1)
    })

    it('should handle null API response', async () => {
      const mockResponse = {
        data: null,
      }

      api.get.mockResolvedValue(mockResponse)

      await tagsStore.fetch()

      expect(tagsStore.list).toEqual([])
    })

    it('should handle API error responses', async () => {
      api.get.mockRejectedValue(new Error('API Error'))

      await tagsStore.fetch()

      expect(tagsStore.list).toEqual([])
      expect(tagsStore.loading).toBe(false)
    })
  })

  describe('Reports Store API Response Handling', () => {
    it('should handle successful API response', async () => {
      const mockResponse = {
        data: {
          total_in: '1000.00',
          total_out: '500.00',
          by_tag: {
            Food: { total_out: '200.00' },
            Transport: { total_out: '300.00' },
          },
        },
      }

      api.get.mockResolvedValue(mockResponse)

      const result = await reportsStore.fetchMonth('2024-01')

      expect(result).toEqual(mockResponse.data)
    })

    it('should handle null API response', async () => {
      const mockResponse = {
        data: null,
      }

      api.get.mockResolvedValue(mockResponse)

      const result = await reportsStore.fetchMonth('2024-01')

      expect(result).toBeNull()
    })

    it('should handle API error responses', async () => {
      api.get.mockRejectedValue(new Error('API Error'))

      await expect(reportsStore.fetchMonth('2024-01')).rejects.toThrow('API Error')
    })
  })

  describe('Data Processing Edge Cases', () => {
    it('should handle empty arrays in API responses', async () => {
      const mockResponse = {
        data: {
          data: [],
        },
      }

      api.get.mockResolvedValue(mockResponse)

      await transactionsStore.fetch()

      expect(transactionsStore.list).toEqual([])
    })

    it('should handle arrays with null/undefined elements', async () => {
      const mockResponse = {
        data: {
          data: [
            {
              id: 1,
              amount_pence: 1500,
              amount: '15.00',
              note: 'Valid transaction',
              t_date: '2024-01-01',
              tags: [],
              created_at: '2024-01-01T00:00:00Z',
              updated_at: '2024-01-01T00:00:00Z',
            },
            null,
            undefined,
          ],
        },
      }

      api.get.mockResolvedValue(mockResponse)

      await transactionsStore.fetch()

      // Should process all elements, including null/undefined (they become default values)
      expect(transactionsStore.list).toHaveLength(3)
      expect(transactionsStore.list[0].id).toBe(1)
      expect(transactionsStore.list[1].id).toBe(0) // null becomes default
      expect(transactionsStore.list[2].id).toBe(0) // undefined becomes default
    })

    it('should handle deeply nested null/undefined values', async () => {
      const mockResponse = {
        data: {
          data: [
            {
              id: 1,
              amount_pence: 1500,
              amount: '15.00',
              note: 'Test transaction',
              t_date: '2024-01-01',
              tags: [
                { id: 1, name: 'Food', color: null },
                { id: 2, name: null, color: '#FF0000' },
                null,
              ],
              created_at: '2024-01-01T00:00:00Z',
              updated_at: '2024-01-01T00:00:00Z',
            },
          ],
        },
      }

      api.get.mockResolvedValue(mockResponse)

      await transactionsStore.fetch()

      expect(transactionsStore.list).toHaveLength(1)
      expect(transactionsStore.list[0].tags).toHaveLength(3) // all tags are processed, null becomes empty object
    })

    it('should handle malformed JSON responses', async () => {
      // Simulate malformed JSON that might cause parsing issues
      const mockResponse = {
        data: {
          data: [
            {
              id: 1,
              amount_pence: null, // Use null instead of string
              amount: 'not a number', // Invalid string amount
              note: 'Test transaction',
              t_date: '2024-01-01',
              tags: 'not an array',
              created_at: '2024-01-01T00:00:00Z',
              updated_at: '2024-01-01T00:00:00Z',
            },
          ],
        },
      }

      api.get.mockResolvedValue(mockResponse)

      await transactionsStore.fetch()

      expect(transactionsStore.list).toHaveLength(1)
      // Should handle malformed data gracefully
      expect(transactionsStore.list[0].amount_pence).toBe(0) // Should default to 0 (invalid string amounts)
      expect(transactionsStore.list[0].amount).toBe('not a number') // String values are preserved
      expect(transactionsStore.list[0].tags).toEqual([]) // Should default to empty array
    })
  })

  describe('Network Error Handling', () => {
    it('should handle network timeout errors', async () => {
      const timeoutError = new Error('timeout of 10000ms exceeded')
      timeoutError.name = 'TimeoutError'
      api.get.mockRejectedValue(timeoutError)

      await transactionsStore.fetch()

      expect(transactionsStore.list).toEqual([])
      expect(transactionsStore.loading).toBe(false)
    })

    it('should handle network connection errors', async () => {
      const networkError = new Error('Network Error')
      networkError.name = 'NetworkError'
      api.get.mockRejectedValue(networkError)

      await transactionsStore.fetch()

      expect(transactionsStore.list).toEqual([])
      expect(transactionsStore.loading).toBe(false)
    })

    it('should handle HTTP error status codes', async () => {
      const httpError = {
        response: {
          status: 500,
          data: { message: 'Internal Server Error' },
        },
      }
      api.get.mockRejectedValue(httpError)

      await transactionsStore.fetch()

      expect(transactionsStore.list).toEqual([])
      expect(transactionsStore.loading).toBe(false)
    })
  })
})
