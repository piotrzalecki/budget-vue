import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useSettingsStore = defineStore('settings', () => {
  const paydayDom = ref<number>(25) // Default to 25th of the month

  const setPaydayDom = (dom: number) => {
    paydayDom.value = dom
    localStorage.setItem('payday_dom', dom.toString())
  }

  const loadFromStorage = () => {
    const stored = localStorage.getItem('payday_dom')
    if (stored) {
      paydayDom.value = parseInt(stored, 10)
    }
  }

  const getDaysUntilPayday = () => {
    const today = new Date()
    const currentMonth = today.getMonth()
    const currentYear = today.getFullYear()

    // Calculate next payday
    let nextPayday = new Date(currentYear, currentMonth, paydayDom.value)

    // If payday has passed this month, calculate for next month
    if (today.getDate() > paydayDom.value) {
      nextPayday = new Date(currentYear, currentMonth + 1, paydayDom.value)
    }

    // Handle year rollover
    if (nextPayday.getMonth() !== currentMonth && currentMonth === 11) {
      nextPayday = new Date(currentYear + 1, 0, paydayDom.value)
    }

    const diffTime = nextPayday.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    return diffDays
  }

  return {
    paydayDom,
    setPaydayDom,
    loadFromStorage,
    getDaysUntilPayday,
  }
})
