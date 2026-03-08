import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useSessionStore = defineStore('session', () => {
  const token = ref<string>('')
  const email = ref<string>('')
  const userId = ref<number | null>(null)

  const setSession = (t: string, e: string, id: number) => {
    token.value = t
    email.value = e
    userId.value = id
    sessionStorage.setItem('authToken', t)
    sessionStorage.setItem('authEmail', e)
    sessionStorage.setItem('authUserId', String(id))
  }

  const loadFromStorage = () => {
    const storedToken = sessionStorage.getItem('authToken')
    const storedEmail = sessionStorage.getItem('authEmail')
    const storedUserId = sessionStorage.getItem('authUserId')
    if (!storedToken || !storedEmail || !storedUserId) return
    token.value = storedToken
    email.value = storedEmail
    userId.value = parseInt(storedUserId, 10)
  }

  const clearSession = () => {
    token.value = ''
    email.value = ''
    userId.value = null
    sessionStorage.removeItem('authToken')
    sessionStorage.removeItem('authEmail')
    sessionStorage.removeItem('authUserId')
  }

  return {
    token,
    email,
    userId,
    setSession,
    loadFromStorage,
    clearSession,
  }
})
