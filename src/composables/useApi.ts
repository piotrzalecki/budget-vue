import { useSnackbar } from '@/composables/useSnackbar'
import router from '@/router'
import { useSessionStore } from '@/stores/session'
import type { AxiosInstance } from 'axios'
import axios from 'axios'

let cached: AxiosInstance | null = null

export function useApi(): AxiosInstance {
  if (cached) return cached

  const session = useSessionStore()
  const snackbar = useSnackbar()

  const api = axios.create({
    baseURL: '/api/v1',
    timeout: 10_000,
  })

  // request: inject key
  api.interceptors.request.use(cfg => {
    cfg.headers['X-API-Key'] = session.apiKey
    return cfg
  })

  // response: handle errors
  api.interceptors.response.use(
    res => res,
    err => {
      if (err.response?.status === 401) {
        session.clearKey()
        snackbar.push('Session expired', 'error')
        router.push('/login')
      } else {
        snackbar.push(err.message, 'error')
      }
      return Promise.reject(err)
    }
  )

  cached = api
  return api
}
