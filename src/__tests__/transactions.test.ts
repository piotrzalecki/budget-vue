import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useTransactionsStore } from '../stores/transactions'

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

describe('useTransactionsStore', () => {
  let store: ReturnType<typeof useTransactionsStore>

  beforeEach(() => {
    setActivePinia(createPinia())
    store = useTransactionsStore()
    vi.clearAllMocks()
  })

  describe('processTransaction', () => {
    it('should handle transaction with tags array', () => {
      const transaction = {
        id: 1,
        amount_pence: 1500,
        amount: '15.00',
        note: 'Test transaction',
        t_date: '2024-01-01',
        tags: [{ id: 1, name: 'Food', color: '#FF0000' }],
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      }

      const result = store.processTransaction(transaction)

      expect(result).toEqual({
        id: 1,
        amount_pence: 1500,
        amount: '15.00',
        note: 'Test transaction',
        t_date: '2024-01-01',
        tags: [{ id: 1, name: 'Food', color: '#FF0000' }],
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      })
    })

    it('should handle transaction with tag_ids array', () => {
      const transaction = {
        id: 1,
        amount_pence: 1500,
        amount: '15.00',
        note: 'Test transaction',
        t_date: '2024-01-01',
        tag_ids: [1, 2],
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      }

      const result = store.processTransaction(transaction)

      expect(result.tags).toEqual([
        { id: 1, name: 'Food', color: '#FF0000' },
        { id: 2, name: 'Transport', color: '#00FF00' },
      ])
    })

    it('should handle transaction with no tags', () => {
      const transaction = {
        id: 1,
        amount_pence: 1500,
        amount: '15.00',
        note: 'Test transaction',
        t_date: '2024-01-01',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      }

      const result = store.processTransaction(transaction)

      expect(result.tags).toEqual([])
    })

    it('should convert string amount to pence when amount_pence is not provided', () => {
      const transaction = {
        id: 1,
        amount: '15.50',
        note: 'Test transaction',
        t_date: '2024-01-01',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      }

      const result = store.processTransaction(transaction)

      expect(result.amount_pence).toBe(1550)
    })

    it('should handle null/undefined transaction data gracefully', () => {
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
  })

  describe('fetch', () => {
    it('should fetch transactions successfully', async () => {
      const mockTransactions = [
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
      ]

      mockApi.get.mockResolvedValue({
        data: { data: mockTransactions },
      })

      await store.fetch()

      expect(store.list).toHaveLength(1)
      expect(store.list[0].id).toBe(1)
    })

    it('should handle API response with data wrapper', async () => {
      const mockTransactions = [{ id: 1, amount_pence: 1500 }]
      mockApi.get.mockResolvedValue({
        data: { data: mockTransactions },
      })

      await store.fetch()

      expect(store.list).toHaveLength(1)
    })

    it('should handle API response without data wrapper', async () => {
      const mockTransactions = [{ id: 1, amount_pence: 1500 }]
      mockApi.get.mockResolvedValue({
        data: mockTransactions,
      })

      await store.fetch()

      expect(store.list).toHaveLength(1)
    })

    it('should handle null/undefined API response', async () => {
      mockApi.get.mockResolvedValue({
        data: null,
      })

      await store.fetch()

      expect(store.list).toEqual([])
    })

    it('should handle non-array API response', async () => {
      mockApi.get.mockResolvedValue({
        data: { data: 'not an array' },
      })

      await store.fetch()

      expect(store.list).toEqual([])
    })

    it('should handle API errors gracefully', async () => {
      mockApi.get.mockRejectedValue(new Error('API Error'))

      await store.fetch()

      expect(store.list).toEqual([])
      expect(store.loading).toBe(false)
    })

    it('should set loading state correctly', async () => {
      mockApi.get.mockResolvedValue({ data: [] })

      const fetchPromise = store.fetch()
      expect(store.loading).toBe(true)

      await fetchPromise
      expect(store.loading).toBe(false)
    })
  })

  describe('fetchWithFilters', () => {
    it('should apply tag filters correctly', async () => {
      const mockTransactions = [
        {
          id: 1,
          amount_pence: 1500,
          note: 'Food transaction',
          t_date: '2024-01-01',
          tags: [{ id: 1, name: 'Food' }],
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
        {
          id: 2,
          amount_pence: 2000,
          note: 'Transport transaction',
          t_date: '2024-01-01',
          tags: [{ id: 2, name: 'Transport' }],
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
      ]

      mockApi.get.mockResolvedValue({
        data: { data: mockTransactions },
      })

      store.filters.tagIds = [1]
      await store.fetchWithFilters()

      expect(store.list).toHaveLength(1)
      expect(store.list[0].id).toBe(1)
    })

    it('should apply search filters correctly', async () => {
      const mockTransactions = [
        {
          id: 1,
          amount_pence: 1500,
          note: 'Food transaction',
          t_date: '2024-01-01',
          tags: [],
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
        {
          id: 2,
          amount_pence: 2000,
          note: 'Transport transaction',
          t_date: '2024-01-01',
          tags: [],
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
      ]

      mockApi.get.mockResolvedValue({
        data: { data: mockTransactions },
      })

      store.filters.search = 'Food'
      await store.fetchWithFilters()

      expect(store.list).toHaveLength(1)
      expect(store.list[0].note).toBe('Food transaction')
    })

    it('should handle empty search results', async () => {
      mockApi.get.mockResolvedValue({
        data: { data: [] },
      })

      store.filters.search = 'nonexistent'
      await store.fetchWithFilters()

      expect(store.list).toEqual([])
    })
  })

  describe('error handling', () => {
    it('should handle malformed transaction data', () => {
      const malformedTransaction = {
        id: 1,
        // Missing required fields
      }

      expect(() => store.processTransaction(malformedTransaction)).not.toThrow()
    })

    it('should handle empty tag_ids array', () => {
      const transaction = {
        id: 1,
        amount_pence: 1500,
        tag_ids: [],
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      }

      const result = store.processTransaction(transaction)
      expect(result.tags).toEqual([])
    })

    it('should filter out undefined tags when resolving tag_ids', () => {
      const transaction = {
        id: 1,
        amount_pence: 1500,
        tag_ids: [1, 999], // 999 doesn't exist in mock tags
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      }

      const result = store.processTransaction(transaction)
      expect(result.tags).toHaveLength(1)
      expect(result.tags[0].id).toBe(1)
    })
  })
})
