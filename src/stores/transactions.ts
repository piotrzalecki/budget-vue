import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useApi } from '@/composables/useApi'

export interface Transaction {
  id: number
  amount_pence: number
  description: string
  date: string
  tags: string[]
  created_at: string
  updated_at: string
}

export const useTransactionsStore = defineStore('transactions', () => {
  const list = ref<Transaction[]>([])
  const loading = ref(false)
  const api = useApi()

  const fetch = async (startDate?: string, endDate?: string) => {
    loading.value = true
    try {
      const params = new URLSearchParams()
      if (startDate) params.append('start_date', startDate)
      if (endDate) params.append('end_date', endDate)

      const response = await api.get(`/transactions?${params.toString()}`)
      list.value = response.data
    } catch (error) {
      console.error('Failed to fetch transactions:', error)
    } finally {
      loading.value = false
    }
  }

  const add = async (transaction: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const response = await api.post('/transactions', transaction)
      list.value.push(response.data)
      return response.data
    } catch (error) {
      console.error('Failed to add transaction:', error)
      throw error
    }
  }

  const softDelete = async (id: number) => {
    try {
      await api.delete(`/transactions/${id}`)
      const index = list.value.findIndex((t) => t.id === id)
      if (index !== -1) {
        list.value.splice(index, 1)
      }
    } catch (error) {
      console.error('Failed to delete transaction:', error)
      throw error
    }
  }

  return {
    list,
    loading,
    fetch,
    add,
    softDelete,
  }
})
