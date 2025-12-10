import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

// Mock the API composable
const mockApi = {
  get: vi.fn(),
  post: vi.fn(),
  patch: vi.fn(),
  delete: vi.fn(),
}

vi.mock('../composables/useApi', () => ({
  useApi: () => mockApi,
}))

// Mock the tags store
vi.mock('../stores/tags', () => ({
  useTagsStore: () => ({
    list: [
      { id: 1, name: 'Food', color: '#FF0000' },
      { id: 2, name: 'Transport', color: '#00FF00' },
    ],
    fetch: vi.fn(),
  }),
}))

import { useTransactionsStore } from '../stores/transactions'

describe('Data Handling Edge Cases', () => {
  let store: ReturnType<typeof useTransactionsStore>

  beforeEach(() => {
    setActivePinia(createPinia())
    store = useTransactionsStore()
    vi.clearAllMocks()
  })

  describe('Array Safety', () => {
    it('should handle null arrays in API responses', async () => {
      mockApi.get.mockResolvedValue({
        data: { data: null },
      })

      await store.fetch()

      expect(store.list).toEqual([])
    })

    it('should handle undefined arrays in API responses', async () => {
      mockApi.get.mockResolvedValue({
        data: { data: undefined },
      })

      await store.fetch()

      expect(store.list).toEqual([])
    })

    it('should handle non-array data in API responses', async () => {
      mockApi.get.mockResolvedValue({
        data: { data: 'not an array' },
      })

      await store.fetch()

      expect(store.list).toEqual([])
    })

    it('should handle empty arrays in API responses', async () => {
      mockApi.get.mockResolvedValue({
        data: { data: [] },
      })

      await store.fetch()

      expect(store.list).toEqual([])
    })
  })

  describe('Object Property Safety', () => {
    it('should handle null transaction properties', () => {
      const transaction = {
        id: 1,
        amount_pence: null,
        amount: null,
        note: null,
        t_date: '2024-01-01',
        tags: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      }

      const result = store.processTransaction(transaction)

      expect(result.amount_pence).toBe(0)
      expect(result.amount).toBe('') // null values are converted to empty strings for safety
      expect(result.note).toBe('')
      expect(result.tags).toEqual([])
    })

    it('should handle undefined transaction properties', () => {
      const transaction = {
        id: 1,
        amount_pence: undefined,
        amount: undefined,
        note: undefined,
        t_date: '2024-01-01',
        tags: undefined,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      }

      const result = store.processTransaction(transaction)

      expect(result.amount_pence).toBe(0)
      expect(result.amount).toBe('') // undefined values are converted to empty strings for safety
      expect(result.note).toBe('')
      expect(result.tags).toEqual([])
    })

    it('should handle missing transaction properties', () => {
      const transaction = {
        id: 1,
        t_date: '2024-01-01',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      }

      const result = store.processTransaction(transaction)

      expect(result.amount_pence).toBe(0)
      expect(result.amount).toBe('') // missing values are converted to empty strings for safety
      expect(result.note).toBe('')
      expect(result.tags).toEqual([])
    })
  })

  describe('Array Processing Safety', () => {
    it('should handle null tag arrays', () => {
      const transaction = {
        id: 1,
        amount_pence: 1500,
        t_date: '2024-01-01',
        tags: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      }

      const result = store.processTransaction(transaction)

      expect(result.tags).toEqual([])
    })

    it('should handle undefined tag arrays', () => {
      const transaction = {
        id: 1,
        amount_pence: 1500,
        t_date: '2024-01-01',
        tags: undefined,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      }

      const result = store.processTransaction(transaction)

      expect(result.tags).toEqual([])
    })

    it('should handle non-array tag data', () => {
      const transaction = {
        id: 1,
        amount_pence: 1500,
        t_date: '2024-01-01',
        tags: 'not an array',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      }

      const result = store.processTransaction(transaction)

      expect(result.tags).toEqual([])
    })

    it('should handle arrays with null/undefined elements', () => {
      const transaction = {
        id: 1,
        amount_pence: 1500,
        t_date: '2024-01-01',
        tag_ids: [1, null, 2, undefined, 3],
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      }

      const result = store.processTransaction(transaction)

      expect(result.tags).toHaveLength(2) // Only valid IDs should be processed
      expect(result.tags[0].id).toBe(1)
      expect(result.tags[1].id).toBe(2)
    })
  })

  describe('String Processing Safety', () => {
    it('should handle invalid string amounts', () => {
      const transaction = {
        id: 1,
        amount: 'not a number',
        t_date: '2024-01-01',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      }

      const result = store.processTransaction(transaction)

      expect(result.amount_pence).toBe(0) // Should default to 0 for invalid numbers
    })

    it('should handle empty string amounts', () => {
      const transaction = {
        id: 1,
        amount: '',
        t_date: '2024-01-01',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      }

      const result = store.processTransaction(transaction)

      expect(result.amount_pence).toBe(0)
    })

    it('should handle null string amounts', () => {
      const transaction = {
        id: 1,
        amount: null,
        t_date: '2024-01-01',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      }

      const result = store.processTransaction(transaction)

      expect(result.amount_pence).toBe(0)
    })
  })

  describe('Error Boundary Tests', () => {
    it('should not throw when processing malformed data', () => {
      const malformedData = [
        null,
        undefined,
        'string',
        123,
        {},
        { id: null },
        { id: undefined },
        { id: 'not a number' },
      ]

      malformedData.forEach(data => {
        expect(() => store.processTransaction(data)).not.toThrow()
      })
    })

    it('should not throw when processing deeply nested null values', () => {
      const transaction = {
        id: 1,
        amount_pence: 1500,
        t_date: '2024-01-01',
        tags: [
          { id: 1, name: null, color: undefined },
          { id: 2, name: 'Transport', color: null },
          null,
          undefined,
        ],
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      }

      expect(() => store.processTransaction(transaction)).not.toThrow()
    })
  })

  describe('API Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      mockApi.get.mockRejectedValue(new Error('Network Error'))

      await store.fetch()

      expect(store.list).toEqual([])
      expect(store.loading).toBe(false)
    })

    it('should handle timeout errors gracefully', async () => {
      const timeoutError = new Error('timeout of 10000ms exceeded')
      timeoutError.name = 'TimeoutError'
      mockApi.get.mockRejectedValue(timeoutError)

      await store.fetch()

      expect(store.list).toEqual([])
      expect(store.loading).toBe(false)
    })

    it('should handle HTTP errors gracefully', async () => {
      const httpError = {
        response: {
          status: 500,
          data: { message: 'Internal Server Error' },
        },
      }
      mockApi.get.mockRejectedValue(httpError)

      await store.fetch()

      expect(store.list).toEqual([])
      expect(store.loading).toBe(false)
    })
  })
})
