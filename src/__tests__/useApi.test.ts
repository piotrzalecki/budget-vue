// Mock axios
const mockAxiosCreate = vi.fn()
const mockRequestInterceptor = vi.fn()
const mockResponseInterceptor = vi.fn()

import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useApi } from '../composables/useApi'
import { useSnackbar } from '../composables/useSnackbar'
import router from '../router'
import { useSessionStore } from '../stores/session'

vi.mock('axios', () => ({
  default: {
    create: mockAxiosCreate.mockReturnValue({
      interceptors: {
        request: {
          use: mockRequestInterceptor,
        },
        response: {
          use: mockResponseInterceptor,
        },
      },
    }),
  },
}))

// Mock router
vi.mock('../router', () => ({
  default: {
    push: vi.fn(),
  },
}))

describe('useApi', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('creates axios instance with correct configuration', () => {
    useApi()

    expect(mockAxiosCreate).toHaveBeenCalledWith({
      baseURL: '/api/v1',
      timeout: 10_000,
    })
  })

  it('adds X-API-Key header to requests', () => {
    const sessionStore = useSessionStore()
    sessionStore.setKey('abc123')

    useApi()

    // Verify request interceptor was set up
    expect(mockRequestInterceptor).toHaveBeenCalled()

    // Get the request interceptor function
    const requestHandler = mockRequestInterceptor.mock.calls[0][0]

    // Test the request interceptor
    const config = { headers: {} }
    const result = requestHandler(config)

    expect(result.headers['X-API-Key']).toBe('abc123')
  })

  it('handles 401 errors by clearing session and redirecting to login', () => {
    const sessionStore = useSessionStore()
    const snackbar = useSnackbar()

    sessionStore.setKey('abc123')
    useApi()

    // Verify response interceptor was set up
    expect(mockResponseInterceptor).toHaveBeenCalled()

    // Get the error handler function
    const errorHandler = mockResponseInterceptor.mock.calls[0][1]

    // Test the error handler with 401 error
    const error = {
      response: { status: 401 },
    }

    errorHandler(error)

    // Verify session was cleared
    expect(sessionStore.apiKey).toBe('')

    // Verify snackbar was called
    expect(snackbar.push).toHaveBeenCalledWith('Session expired', 'error')

    // Verify router redirect
    expect(router.push).toHaveBeenCalledWith('/login')
  })

  it('shows error message for non-401 errors', () => {
    const snackbar = useSnackbar()
    useApi()

    // Get the error handler function
    const errorHandler = mockResponseInterceptor.mock.calls[0][1]

    // Test the error handler with non-401 error
    const error = {
      response: { status: 500 },
      message: 'Internal server error',
    }

    errorHandler(error)

    // Verify snackbar was called with error message
    expect(snackbar.push).toHaveBeenCalledWith('Internal server error', 'error')
  })

  it('caches the axios instance', () => {
    const api1 = useApi()
    const api2 = useApi()

    // Should return the same instance
    expect(api1).toBe(api2)

    // Should only create axios instance once
    expect(mockAxiosCreate).toHaveBeenCalledTimes(1)
  })
})
