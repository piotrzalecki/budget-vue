import { useApi } from '@/composables/useApi'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface TagData {
  total_in: string
  total_out: string
}

export interface MonthlyReport {
  total_in: string
  total_out: string
  by_tag: Record<string, TagData>
}

export interface MonthlyTotals {
  total_in: string
  total_out: string
  transaction_count?: number
}

export const useReportsStore = defineStore('reports', () => {
  const monthlyMap = ref<Record<string, MonthlyReport>>({})
  const totalsMap = ref<Record<string, MonthlyTotals>>({})
  const loading = ref(false)
  const api = useApi()

  const fetchMonth = async (ym: string) => {
    console.log('Reports Store: Fetching month', ym)

    if (monthlyMap.value[ym]) {
      console.log('Reports Store: Using cached data for', ym, monthlyMap.value[ym])
      return monthlyMap.value[ym]
    }

    loading.value = true
    try {
      console.log('Reports Store: Making API call to', `/reports/monthly?ym=${ym}`)
      const response = await api.get(`/reports/monthly?ym=${ym}`)
      console.log('Reports Store: API response for', ym, response.data)
      monthlyMap.value[ym] = response.data
      return response.data
    } catch (error) {
      console.error('Reports Store: Failed to fetch monthly report for', ym, ':', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const fetchMonthTotals = async (ym: string) => {
    console.log('Reports Store: Fetching month totals', ym)

    if (totalsMap.value[ym]) {
      console.log('Reports Store: Using cached totals for', ym, totalsMap.value[ym])
      return totalsMap.value[ym]
    }

    loading.value = true
    try {
      console.log('Reports Store: Making API call to', `/reports/monthly/totals?ym=${ym}`)
      const response = await api.get(`/reports/monthly/totals?ym=${ym}`)
      console.log('Reports Store: Totals API response for', ym, response.data)
      totalsMap.value[ym] = response.data
      return response.data
    } catch (error) {
      console.error('Reports Store: Failed to fetch monthly totals for', ym, ':', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const clearCache = () => {
    monthlyMap.value = {}
    totalsMap.value = {}
  }

  return {
    monthlyMap,
    totalsMap,
    loading,
    fetchMonth,
    fetchMonthTotals,
    clearCache,
  }
})
