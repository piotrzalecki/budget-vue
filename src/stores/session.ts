import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useSessionStore = defineStore('session', () => {
  const apiKey = ref<string>('')

  const setKey = (key: string) => {
    apiKey.value = key
    sessionStorage.setItem('apiKey', key)
  }

  const loadFromStorage = () => {
    const storedKey = sessionStorage.getItem('apiKey')
    if (storedKey) {
      apiKey.value = storedKey
    }
  }

  const clearKey = () => {
    apiKey.value = ''
    sessionStorage.removeItem('apiKey')
  }

  return {
    apiKey,
    setKey,
    loadFromStorage,
    clearKey,
  }
})
