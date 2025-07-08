import { useApi } from '@/composables/useApi'
import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Tag } from './tags'
import { useTagsStore } from './tags'

export interface Transaction {
  id: number
  amount_pence: number
  amount?: string // API might return amount as string
  note: string
  t_date: string
  tags: Tag[]
  created_at: string
  updated_at: string
}

export const useTransactionsStore = defineStore('transactions', () => {
  const list = ref<Transaction[]>([])
  const loading = ref(false)
  const api = useApi()
  const tagsStore = useTagsStore()

  // Helper function to convert API response to our format
  const processTransaction = (transaction: any): Transaction => {
    // If amount is a string (like "15.50"), convert to pence
    let amount_pence = transaction.amount_pence
    if (typeof transaction.amount === 'string' && !amount_pence) {
      amount_pence = Math.round(parseFloat(transaction.amount) * 100)
    }

    // Handle tags - API might return tag_ids or tags
    let tags: Tag[] = []
    if (Array.isArray(transaction.tags)) {
      tags = transaction.tags
    } else if (Array.isArray(transaction.tag_ids)) {
      // If we have tag_ids, resolve them to actual tag objects from the tags store
      tags = transaction.tag_ids
        .map((id: number) => tagsStore.list.find(tag => tag.id === id))
        .filter(Boolean) as Tag[]
    }

    return {
      id: transaction.id,
      amount_pence: amount_pence || 0,
      amount: transaction.amount,
      note: transaction.note || '',
      t_date: transaction.t_date,
      tags: tags,
      created_at: transaction.created_at,
      updated_at: transaction.updated_at,
    }
  }

  const fetch = async (startDate?: string, endDate?: string) => {
    loading.value = true
    try {
      // Ensure tags are loaded first
      if (tagsStore.list.length === 0) {
        await tagsStore.fetch()
      }

      const params = new URLSearchParams()
      if (startDate) params.append('from', startDate)
      if (endDate) params.append('to', endDate)

      const response = await api.get(`/transactions?${params.toString()}`)
      const rawTransactions = response.data.data || response.data || []
      list.value = rawTransactions.map(processTransaction)
    } catch (error) {
      console.error('Failed to fetch transactions:', error)
      list.value = []
    } finally {
      loading.value = false
    }
  }

  // Helper method to refresh with current filters
  const refresh = async () => {
    // For now, just fetch all transactions
    // In the future, we could store the current filters and reuse them
    await fetch()
  }

  const add = async (transaction: {
    amount_pence: number
    t_date: string
    tag_ids: number[]
    note: string
  }) => {
    try {
      // Convert to API format
      const apiPayload = {
        amount: (transaction.amount_pence / 100).toFixed(2),
        t_date: transaction.t_date,
        tag_ids: transaction.tag_ids,
        note: transaction.note,
      }
      const response = await api.post('/transactions', apiPayload)

      // Instead of trying to process the response and add to list,
      // refresh the entire transactions list to get complete data from server
      await refresh()

      return response.data
    } catch (error) {
      console.error('Failed to add transaction:', error)
      throw error
    }
  }

  const softDelete = async (id: number) => {
    try {
      await api.delete(`/transactions/${id}`)
      const index = list.value.findIndex(t => t.id === id)
      if (index !== -1) {
        list.value.splice(index, 1)
      }
    } catch (error) {
      console.error('Failed to delete transaction:', error)
      throw error
    }
  }

  const update = async (
    id: number,
    transaction: {
      amount_pence: number
      t_date: string
      tag_ids: number[]
      note: string
    }
  ) => {
    try {
      // Convert to API format
      const apiPayload = {
        amount: (transaction.amount_pence / 100).toFixed(2),
        t_date: transaction.t_date,
        tag_ids: transaction.tag_ids,
        note: transaction.note,
      }
      const response = await api.patch(`/transactions/${id}`, apiPayload)

      // Instead of trying to process the response and update locally,
      // refresh the entire transactions list to get complete data from server
      await refresh()

      return response.data
    } catch (error) {
      console.error('Failed to update transaction:', error)
      throw error
    }
  }

  return {
    list,
    loading,
    fetch,
    refresh,
    add,
    softDelete,
    update,
  }
})
