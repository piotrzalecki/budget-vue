import { useApi } from '@/composables/useApi'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface Tag {
  id: number
  name: string
  color?: string
  created_at: string
}

export const useTagsStore = defineStore('tags', () => {
  const list = ref<Tag[]>([])
  const loading = ref(false)
  const api = useApi()

  const fetch = async () => {
    loading.value = true
    try {
      const response = await api.get('/tags')
      // Handle different response structures
      list.value = response.data.data || response.data || []
    } catch (error) {
      list.value = []
    } finally {
      loading.value = false
    }
  }

  const add = async (tag: Omit<Tag, 'id' | 'created_at'>) => {
    try {
      await api.post('/tags', { name: tag.name })
      await fetch() // Refresh the list from the backend
    } catch (error: any) {
      if (error.response?.status === 409) {
        throw new Error('Tag name already exists.')
      }
      throw error
    }
  }

  const update = async (id: number, updates: Partial<Tag>) => {
    try {
      const response = await api.patch(`/tags/${id}`, { name: updates.name })
      const updatedTag = response.data.data || response.data
      const index = list.value.findIndex(t => t.id === id)
      if (index !== -1) {
        list.value[index] = { ...list.value[index], ...updatedTag }
      }
      return updatedTag
    } catch (error: any) {
      if (error.response?.status === 409) {
        throw new Error('Tag name already exists.')
      }
      if (error.response?.status === 404) {
        throw new Error('Tag not found.')
      }
      if (error.response?.status === 405) {
        throw new Error('Tag updates are not supported by the backend yet.')
      }
      throw new Error('Failed to update tag. The backend may not support this operation.')
    }
  }

  const remove = async (id: number) => {
    try {
      await api.delete(`/tags/${id}`)
      const index = list.value.findIndex(t => t.id === id)
      if (index !== -1) {
        list.value.splice(index, 1)
      }
    } catch (error: any) {
      if (error.response?.status === 400 && error.response?.data?.message?.includes('tag in use')) {
        throw new Error('Cannot delete tag that is attached to transactions.')
      }
      if (error.response?.status === 404) {
        throw new Error('Tag not found.')
      }
      if (error.response?.status === 405) {
        throw new Error('Tag deletion is not supported by the backend yet.')
      }
      throw new Error('Failed to delete tag. The backend may not support this operation.')
    }
  }

  return {
    list,
    loading,
    fetch,
    add,
    update,
    remove,
  }
})
