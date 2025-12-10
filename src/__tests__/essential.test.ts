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

describe('Essential Data Safety Tests', () => {
  let store: ReturnType<typeof useTransactionsStore>

  beforeEach(() => {
    setActivePinia(createPinia())
    store = useTransactionsStore()
    vi.clearAllMocks()
  })

  describe('Critical Runtime Error Prevention', () => {
    it('should prevent "t.map is not a function" errors', async () => {
      // Test null API response
      mockApi.get.mockResolvedValue({ data: null })
      await store.fetch()
      expect(store.list).toEqual([])

      // Test undefined API response
      mockApi.get.mockResolvedValue({ data: undefined })
      await store.fetch()
      expect(store.list).toEqual([])

      // Test non-array API response
      mockApi.get.mockResolvedValue({ data: 'not an array' })
      await store.fetch()
      expect(store.list).toEqual([])
    })

    it('should prevent "Right side of assignment cannot be destructured" errors', async () => {
      // Test malformed API response structure
      mockApi.get.mockResolvedValue({ data: { data: null } })
      await store.fetch()
      expect(store.list).toEqual([])

      // Test API response with missing data property
      mockApi.get.mockResolvedValue({ data: {} })
      await store.fetch()
      expect(store.list).toEqual([])
    })

    it('should prevent "null is not an object" errors', () => {
      // Test null transaction processing
      const result = store.processTransaction(null)
      expect(result).toEqual({
        id: 0,
        amount_pence: 0,
        amount: '',
        note: '',
        t_date: '',
        tags: [],
        created_at: '',
        updated_at: '',
      })

      // Test undefined transaction processing
      const result2 = store.processTransaction(undefined)
      expect(result2).toEqual({
        id: 0,
        amount_pence: 0,
        amount: '',
        note: '',
        t_date: '',
        tags: [],
        created_at: '',
        updated_at: '',
      })
    })

    it('should handle malformed transaction data safely', () => {
      const malformedTransaction = {
        id: null,
        amount_pence: null, // Use null instead of string
        amount: 'not a number',
        note: undefined,
        t_date: null,
        tags: 'not an array',
        created_at: null,
        updated_at: undefined,
      }

      const result = store.processTransaction(malformedTransaction)

      expect(result.id).toBe(0)
      expect(result.amount_pence).toBe(0) // Invalid string amounts default to 0
      expect(result.amount).toBe('not a number') // String values are preserved
      expect(result.note).toBe('')
      expect(result.t_date).toBe('')
      expect(result.tags).toEqual([])
      expect(result.created_at).toBe('')
      expect(result.updated_at).toBe('')
    })

    it('should handle arrays with null/undefined elements', async () => {
      const mockResponse = {
        data: {
          data: [
            {
              id: 1,
              amount_pence: 1500,
              note: 'Valid transaction',
              t_date: '2024-01-01',
              created_at: '2024-01-01T00:00:00Z',
              updated_at: '2024-01-01T00:00:00Z',
            },
            null,
            undefined,
            {
              id: 2,
              amount_pence: 2000,
              note: 'Another valid transaction',
              t_date: '2024-01-02',
              created_at: '2024-01-02T00:00:00Z',
              updated_at: '2024-01-02T00:00:00Z',
            },
          ],
        },
      }

      mockApi.get.mockResolvedValue(mockResponse)
      await store.fetch()

      // Should process all elements safely
      expect(store.list).toHaveLength(4)
      expect(store.list[0].id).toBe(1)
      expect(store.list[1].id).toBe(0) // null becomes default
      expect(store.list[2].id).toBe(0) // undefined becomes default
      expect(store.list[3].id).toBe(2)
    })

    it('should handle API errors gracefully', async () => {
      // Test network error
      mockApi.get.mockRejectedValue(new Error('Network Error'))
      await store.fetch()
      expect(store.list).toEqual([])
      expect(store.loading).toBe(false)

      // Test timeout error
      const timeoutError = new Error('timeout of 10000ms exceeded')
      timeoutError.name = 'TimeoutError'
      mockApi.get.mockRejectedValue(timeoutError)
      await store.fetch()
      expect(store.list).toEqual([])
      expect(store.loading).toBe(false)

      // Test HTTP error
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

  describe('Array Safety Operations', () => {
    it('should safely process tag arrays', () => {
      const transaction = {
        id: 1,
        amount_pence: 1500,
        t_date: '2024-01-01',
        tag_ids: [1, 2, 999], // 999 doesn't exist
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      }

      const result = store.processTransaction(transaction)

      // Should filter out non-existent tags
      expect(result.tags).toHaveLength(2)
      expect(result.tags[0].id).toBe(1)
      expect(result.tags[1].id).toBe(2)
    })

    it('should handle null/undefined tag arrays', () => {
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
      expect(result.amount_pence).toBe(0)
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

    it('should convert valid string amounts to pence', () => {
      const transaction = {
        id: 1,
        amount: '15.50',
        t_date: '2024-01-01',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      }

      const result = store.processTransaction(transaction)
      expect(result.amount_pence).toBe(1550)
    })
  })

  describe('Error Boundary Tests', () => {
    it('should never throw on malformed data', () => {
      const malformedData = [
        null,
        undefined,
        'string',
        123,
        {},
        { id: null },
        { id: undefined },
        { id: 'not a number' },
        { amount: [] },
        { tags: 123 },
      ]

      malformedData.forEach(data => {
        expect(() => store.processTransaction(data)).not.toThrow()
      })
    })

    it('should handle deeply nested null values', () => {
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
})
