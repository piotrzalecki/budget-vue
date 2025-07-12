import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useTagsStore } from '../stores/tags'

// Create mock functions that can be configured
const mockGet = vi.fn()
const mockPost = vi.fn()
const mockPatch = vi.fn()
const mockDelete = vi.fn()

// Mock the API composable
vi.mock('../composables/useApi', () => ({
  useApi: () => ({
    get: mockGet,
    post: mockPost,
    patch: mockPatch,
    delete: mockDelete,
  }),
}))

describe('TagsPage', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    // Reset all mocks before each test
    vi.clearAllMocks()
  })

  describe('Tags Store', () => {
    it('initializes with empty list and loading false', () => {
      const tagsStore = useTagsStore()

      expect(tagsStore.list).toEqual([])
      expect(tagsStore.loading).toBe(false)
    })

    it('has required methods', () => {
      const tagsStore = useTagsStore()

      expect(typeof tagsStore.fetch).toBe('function')
      expect(typeof tagsStore.add).toBe('function')
      expect(typeof tagsStore.update).toBe('function')
      expect(typeof tagsStore.remove).toBe('function')
    })

    it('handles fetch error gracefully', async () => {
      const tagsStore = useTagsStore()

      // Mock the API to throw an error
      mockGet.mockRejectedValue(new Error('Network error'))

      await tagsStore.fetch()

      expect(tagsStore.list).toEqual([])
      expect(tagsStore.loading).toBe(false)
    })

    it('handles add error gracefully', async () => {
      const tagsStore = useTagsStore()

      // Mock the API to throw an error
      mockPost.mockRejectedValue(new Error('Network error'))

      // The add method should throw the original error for non-409 errors
      await expect(tagsStore.add({ name: 'Test' })).rejects.toThrow('Network error')
    })

    it('handles update error gracefully', async () => {
      const tagsStore = useTagsStore()

      // Mock the API to throw an error
      mockPatch.mockRejectedValue(new Error('Network error'))

      // The update method should throw a specific error message
      await expect(tagsStore.update(1, { name: 'Test' })).rejects.toThrow(
        'Failed to update tag. The backend may not support this operation.'
      )
    })

    it('handles remove error gracefully', async () => {
      const tagsStore = useTagsStore()

      // Mock the API to throw an error
      mockDelete.mockRejectedValue(new Error('Network error'))

      // The remove method should throw a specific error message
      await expect(tagsStore.remove(1)).rejects.toThrow(
        'Failed to delete tag. The backend may not support this operation.'
      )
    })
  })
})
