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
      console.error('Failed to fetch tags:', error)
      list.value = []
    } finally {
      loading.value = false
    }
  }

  const add = async (tag: Omit<Tag, 'id' | 'created_at'>) => {
    try {
      const response = await api.post('/tags', tag)
      const newTag = response.data.data || response.data
      list.value.push(newTag)
      return newTag
    } catch (error) {
      console.error('Failed to add tag:', error)
      throw error
    }
  }

  const remove = async (id: number) => {
    try {
      await api.delete(`/tags/${id}`)
      const index = list.value.findIndex(t => t.id === id)
      if (index !== -1) {
        list.value.splice(index, 1)
      }
    } catch (error) {
      console.error('Failed to remove tag:', error)
      throw error
    }
  }

  return {
    list,
    loading,
    fetch,
    add,
    remove,
  }
})
