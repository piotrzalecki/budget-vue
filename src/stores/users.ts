import { useApi } from '@/composables/useApi'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface User {
  id: number
  email: string
  is_service: boolean
  created_at: string
}

export const useUsersStore = defineStore('users', () => {
  const list = ref<User[]>([])
  const loading = ref(false)
  const api = useApi()

  const fetch = async () => {
    loading.value = true
    try {
      const response = await api.get('/users')
      list.value = response.data.data || response.data || []
    } catch (error) {
      console.error('Error fetching users:', error)
      list.value = []
    } finally {
      loading.value = false
    }
  }

  const add = async (user: { email: string; password: string; is_service?: boolean }) => {
    try {
      await api.post('/users', user)
      await fetch()
    } catch (error: any) {
      if (error.response?.status === 409) {
        throw new Error('A user with this email already exists.')
      }
      throw error
    }
  }

  const update = async (id: number, updates: { email?: string; password?: string }) => {
    try {
      const response = await api.patch(`/users/${id}`, updates)
      const updatedUser = response.data.data || response.data
      const index = list.value.findIndex(u => u.id === id)
      if (index !== -1) {
        list.value[index] = { ...list.value[index], ...updatedUser }
      }
      return updatedUser
    } catch (error: any) {
      if (error.response?.status === 409) {
        throw new Error('A user with this email already exists.')
      }
      if (error.response?.status === 404) {
        throw new Error('User not found.')
      }
      throw new Error('Failed to update user.')
    }
  }

  const remove = async (id: number) => {
    try {
      await api.delete(`/users/${id}`)
      const index = list.value.findIndex(u => u.id === id)
      if (index !== -1) {
        list.value.splice(index, 1)
      }
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error('User not found.')
      }
      throw new Error('Failed to delete user.')
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
