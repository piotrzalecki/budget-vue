import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useTagsStore } from '../stores/tags'

// Mock the API composable
vi.mock('../composables/useApi', () => ({
  useApi: () => ({
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  }),
}))

describe('TagsPage', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
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
      const { useApi } = await import('../composables/useApi')
      const mockApi = useApi()
      vi.mocked(mockApi.get).mockRejectedValue(new Error('Network error'))

      await tagsStore.fetch()

      expect(tagsStore.list).toEqual([])
      expect(tagsStore.loading).toBe(false)
    })

    it('handles add error gracefully', async () => {
      const tagsStore = useTagsStore()

      // Mock the API to throw an error
      const { useApi } = await import('../composables/useApi')
      const mockApi = useApi()
      vi.mocked(mockApi.post).mockRejectedValue(new Error('Network error'))

      await expect(tagsStore.add({ name: 'Test' })).rejects.toThrow('Network error')
    })

    it('handles update error gracefully', async () => {
      const tagsStore = useTagsStore()

      // Mock the API to throw an error
      const { useApi } = await import('../composables/useApi')
      const mockApi = useApi()
      vi.mocked(mockApi.patch).mockRejectedValue(new Error('Network error'))

      await expect(tagsStore.update(1, { name: 'Test' })).rejects.toThrow('Network error')
    })

    it('handles remove error gracefully', async () => {
      const tagsStore = useTagsStore()

      // Mock the API to throw an error
      const { useApi } = await import('../composables/useApi')
      const mockApi = useApi()
      vi.mocked(mockApi.delete).mockRejectedValue(new Error('Network error'))

      await expect(tagsStore.remove(1)).rejects.toThrow('Network error')
    })
  })
})
