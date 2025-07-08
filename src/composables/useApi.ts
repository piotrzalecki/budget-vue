import { useSessionStore } from '@/stores/session'
import axios from 'axios'
import { useRouter } from 'vue-router'

export const useApi = () => {
  const sessionStore = useSessionStore()
  const router = useRouter()

  const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  // Request interceptor to inject API key
  api.interceptors.request.use(
    config => {
      if (sessionStore.apiKey) {
        config.headers['X-API-Key'] = sessionStore.apiKey
      }
      return config
    },
    error => {
      return Promise.reject(error)
    }
  )

  // Response interceptor to handle 401 errors
  api.interceptors.response.use(
    response => response,
    error => {
      if (error.response?.status === 401) {
        sessionStore.clearKey()
        router.push('/login')
      }
      return Promise.reject(error)
    }
  )

  return api
}
