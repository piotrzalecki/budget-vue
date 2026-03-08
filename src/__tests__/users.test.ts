import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useUsersStore } from '../stores/users'

const mockApi = {
  get: vi.fn(),
  post: vi.fn(),
  patch: vi.fn(),
  delete: vi.fn(),
}

vi.mock('../composables/useApi', () => ({
  useApi: () => mockApi,
}))

describe('useUsersStore', () => {
  let store: ReturnType<typeof useUsersStore>

  beforeEach(() => {
    setActivePinia(createPinia())
    store = useUsersStore()
    vi.clearAllMocks()
  })

  describe('fetch', () => {
    it('should fetch users successfully with data wrapper', async () => {
      const mockUsers = [
        { id: 1, email: 'alice@example.com', is_service: false, created_at: '2024-01-01T00:00:00Z' },
      ]
      mockApi.get.mockResolvedValue({ data: { data: mockUsers } })

      await store.fetch()

      expect(store.list).toHaveLength(1)
      expect(store.list[0].email).toBe('alice@example.com')
    })

    it('should fetch users successfully without data wrapper', async () => {
      const mockUsers = [
        { id: 2, email: 'bob@example.com', is_service: true, created_at: '2024-01-01T00:00:00Z' },
      ]
      mockApi.get.mockResolvedValue({ data: mockUsers })

      await store.fetch()

      expect(store.list).toHaveLength(1)
      expect(store.list[0].email).toBe('bob@example.com')
    })

    it('should set list to [] on null response', async () => {
      mockApi.get.mockResolvedValue({ data: null })

      await store.fetch()

      expect(store.list).toEqual([])
    })

    it('should set list to [] on error', async () => {
      mockApi.get.mockRejectedValue(new Error('Network error'))

      await store.fetch()

      expect(store.list).toEqual([])
    })

    it('should set loading true during fetch and false after', async () => {
      mockApi.get.mockResolvedValue({ data: [] })

      const fetchPromise = store.fetch()
      expect(store.loading).toBe(true)

      await fetchPromise
      expect(store.loading).toBe(false)
    })

    it('should set loading false after error', async () => {
      mockApi.get.mockRejectedValue(new Error('fail'))

      await store.fetch()

      expect(store.loading).toBe(false)
    })
  })

  describe('add', () => {
    it('should POST with correct payload and then fetch', async () => {
      mockApi.post.mockResolvedValue({})
      mockApi.get.mockResolvedValue({ data: [] })

      await store.add({ email: 'new@example.com', password: 'secret123', is_service: false })

      expect(mockApi.post).toHaveBeenCalledWith('/users', {
        email: 'new@example.com',
        password: 'secret123',
        is_service: false,
      })
      expect(mockApi.get).toHaveBeenCalledWith('/users')
    })

    it('should throw friendly message on 409', async () => {
      mockApi.post.mockRejectedValue({ response: { status: 409 } })

      await expect(
        store.add({ email: 'existing@example.com', password: 'secret123' })
      ).rejects.toThrow('A user with this email already exists.')
    })

    it('should re-throw other errors', async () => {
      const err = new Error('Server error')
      mockApi.post.mockRejectedValue(err)

      await expect(store.add({ email: 'x@example.com', password: 'pass1234' })).rejects.toThrow(
        'Server error'
      )
    })
  })

  describe('update', () => {
    beforeEach(() => {
      store.list.push({
        id: 1,
        email: 'alice@example.com',
        is_service: false,
        created_at: '2024-01-01T00:00:00Z',
      })
    })

    it('should PATCH with correct payload and update list in-place', async () => {
      mockApi.patch.mockResolvedValue({
        data: { id: 1, email: 'updated@example.com', is_service: false, created_at: '2024-01-01T00:00:00Z' },
      })

      await store.update(1, { email: 'updated@example.com' })

      expect(mockApi.patch).toHaveBeenCalledWith('/users/1', { email: 'updated@example.com' })
      expect(store.list[0].email).toBe('updated@example.com')
    })

    it('should throw friendly message on 409', async () => {
      mockApi.patch.mockRejectedValue({ response: { status: 409 } })

      await expect(store.update(1, { email: 'taken@example.com' })).rejects.toThrow(
        'A user with this email already exists.'
      )
    })

    it('should throw friendly message on 404', async () => {
      mockApi.patch.mockRejectedValue({ response: { status: 404 } })

      await expect(store.update(99, { email: 'x@example.com' })).rejects.toThrow('User not found.')
    })
  })

  describe('remove', () => {
    beforeEach(() => {
      store.list.push(
        { id: 1, email: 'alice@example.com', is_service: false, created_at: '2024-01-01T00:00:00Z' },
        { id: 2, email: 'bob@example.com', is_service: true, created_at: '2024-01-01T00:00:00Z' }
      )
    })

    it('should DELETE and remove item from list', async () => {
      mockApi.delete.mockResolvedValue({})

      await store.remove(1)

      expect(mockApi.delete).toHaveBeenCalledWith('/users/1')
      expect(store.list).toHaveLength(1)
      expect(store.list[0].id).toBe(2)
    })

    it('should throw friendly message on 404', async () => {
      mockApi.delete.mockRejectedValue({ response: { status: 404 } })

      await expect(store.remove(99)).rejects.toThrow('User not found.')
    })

    it('should throw generic message on other errors', async () => {
      mockApi.delete.mockRejectedValue({ response: { status: 500 } })

      await expect(store.remove(1)).rejects.toThrow('Failed to delete user.')
    })
  })
})
