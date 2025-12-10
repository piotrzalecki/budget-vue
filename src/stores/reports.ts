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
    if (monthlyMap.value[ym]) {
      return monthlyMap.value[ym]
    }

    loading.value = true
    try {
      const response = await api.get(`/reports/monthly?ym=${ym}`)
      monthlyMap.value[ym] = response.data
      return response.data
    } catch (error) {
      throw error
    } finally {
      loading.value = false
    }
  }

  const fetchMonthTotals = async (ym: string) => {
    if (totalsMap.value[ym]) {
      return totalsMap.value[ym]
    }

    loading.value = true
    try {
      const response = await api.get(`/reports/monthly/totals?ym=${ym}`)
      totalsMap.value[ym] = response.data
      return response.data
    } catch (error) {
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
