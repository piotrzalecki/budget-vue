import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useApi } from '@/composables/useApi'

export interface RecurringTransaction {
  id: number
  amount_pence: number
  description: string
  frequency: string
  next_date: string
  tags: string[]
  active: boolean
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
      list.value = response.data
    } catch (error) {
      console.error('Failed to fetch recurring transactions:', error)
    } finally {
      loading.value = false
    }
  }

  const add = async (
    transaction: Omit<RecurringTransaction, 'id' | 'created_at' | 'updated_at'>,
  ) => {
    try {
      const response = await api.post('/recurring', transaction)
      list.value.push(response.data)
      return response.data
    } catch (error) {
      console.error('Failed to add recurring transaction:', error)
      throw error
    }
  }

  const update = async (id: number, transaction: Partial<RecurringTransaction>) => {
    try {
      const response = await api.put(`/recurring/${id}`, transaction)
      const index = list.value.findIndex((t) => t.id === id)
      if (index !== -1) {
        list.value[index] = response.data
      }
      return response.data
    } catch (error) {
      console.error('Failed to update recurring transaction:', error)
      throw error
    }
  }

  const toggle = async (id: number) => {
    try {
      const transaction = list.value.find((t) => t.id === id)
      if (transaction) {
        const response = await api.patch(`/recurring/${id}`, { active: !transaction.active })
        const index = list.value.findIndex((t) => t.id === id)
        if (index !== -1) {
          list.value[index] = response.data
        }
      }
    } catch (error) {
      console.error('Failed to toggle recurring transaction:', error)
      throw error
    }
  }

  return {
    list,
    loading,
    fetch,
    add,
    update,
    toggle,
  }
})
