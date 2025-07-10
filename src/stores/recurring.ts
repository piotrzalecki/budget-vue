import { useApi } from '@/composables/useApi'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface RecurringTransaction {
  id: number
  amount: string
  description: string
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly'
  interval_n: number
  first_due_date: string
  next_due_date: string
  end_date?: string
  active: boolean
  tag_ids: number[]
  created_at: string
  updated_at: string
}

export const useRecurringStore = defineStore('recurring', () => {
  const list = ref<RecurringTransaction[]>([])
  const loading = ref(false)
  const api = useApi()

  const fetch = async () => {
    loading.value = true
    try {
      const response = await api.get('/recurring')
      // Handle API response structure: {data: Array, error: null}
      list.value = response.data.data || response.data || []
    } catch (error) {
      console.error('Failed to fetch recurring transactions:', error)
      list.value = []
    } finally {
      loading.value = false
    }
  }

  const fetchActive = async () => {
    loading.value = true
    try {
      const response = await api.get('/recurring/active')
      list.value = response.data.data || response.data || []
    } catch (error) {
      console.error('Failed to fetch active recurring transactions:', error)
      list.value = []
    } finally {
      loading.value = false
    }
  }

  const fetchDue = async (date?: string) => {
    loading.value = true
    try {
      const params = date ? { date } : {}
      const response = await api.get('/recurring/due', { params })
      list.value = response.data.data || response.data || []
    } catch (error) {
      console.error('Failed to fetch due recurring transactions:', error)
      list.value = []
    } finally {
      loading.value = false
    }
  }

  const add = async (transaction: {
    amount: string
    description: string
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly'
    interval_n: number
    first_due_date: string
    end_date?: string
    tag_ids: number[]
  }) => {
    try {
      const response = await api.post('/recurring', transaction)

      // Refresh the entire list to get complete data from server
      await fetch()

      return response.data
    } catch (error) {
      console.error('Failed to add recurring transaction:', error)
      throw error
    }
  }

  const update = async (
    id: number,
    transaction: {
      amount?: string
      description?: string
      frequency?: 'daily' | 'weekly' | 'monthly' | 'yearly'
      interval_n?: number
      first_due_date?: string
      end_date?: string
      tag_ids?: number[]
    }
  ) => {
    try {
      const response = await api.patch(`/recurring/${id}`, transaction)

      // Refresh the entire list to get complete data from server
      await fetch()

      return response.data
    } catch (error) {
      console.error('Failed to update recurring transaction:', error)
      throw error
    }
  }

  const remove = async (id: number) => {
    try {
      await api.delete(`/recurring/${id}`)
      // Refresh the entire list to get complete data from server
      await fetch()
    } catch (error) {
      console.error('Failed to delete recurring transaction:', error)
      throw error
    }
  }

  const setActive = async (id: number) => {
    try {
      const response = await api.patch(`/recurring/${id}/toggle`)
      // Refresh the entire list to get complete data from server
      await fetch()
      return response.data
    } catch (error) {
      console.error('Failed to toggle active status:', error)
      throw error
    }
  }

  const toggle = async (id: number) => {
    try {
      await setActive(id)
    } catch (error) {
      console.error('Failed to toggle recurring transaction:', error)
      throw error
    }
  }

  return {
    list,
    loading,
    fetch,
    fetchActive,
    fetchDue,
    add,
    update,
    remove,
    setActive,
    toggle,
  }
})
