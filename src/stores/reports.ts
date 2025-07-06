import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useApi } from '@/composables/useApi'

export interface MonthlyReport {
  year: number
  month: number
  income_pence: number
  expenses_pence: number
  net_pence: number
  by_tag: Record<string, number>
}

export const useReportsStore = defineStore('reports', () => {
  const monthlyMap = ref<Record<string, MonthlyReport>>({})
  const loading = ref(false)
  const api = useApi()

  const fetchMonth = async (year: number, month: number) => {
    const key = `${year}-${month.toString().padStart(2, '0')}`

    if (monthlyMap.value[key]) {
      return monthlyMap.value[key]
    }

    loading.value = true
    try {
      const response = await api.get(`/reports/monthly/${year}/${month}`)
      monthlyMap.value[key] = response.data
      return response.data
    } catch (error) {
      console.error('Failed to fetch monthly report:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const clearCache = () => {
    monthlyMap.value = {}
  }

  return {
    monthlyMap,
    loading,
    fetchMonth,
    clearCache,
  }
})
