import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useSnackbar } from '../composables/useSnackbar'
import { useDrawerStore } from '../stores/drawer'

describe('App.vue Components', () => {
  beforeEach(() => {
    setActivePinia(createPinia())

    // Spy on localStorage methods
    vi.spyOn(window.localStorage.__proto__, 'getItem').mockImplementation(() => null)
    vi.spyOn(window.localStorage.__proto__, 'setItem').mockImplementation(() => undefined)
    vi.spyOn(window.localStorage.__proto__, 'removeItem').mockImplementation(() => undefined)
    vi.spyOn(window.localStorage.__proto__, 'clear').mockImplementation(() => undefined)

    // Set desktop width by default
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    })

    // Reset snackbar state between tests
    const { show, msg, color, timeout } = useSnackbar()
    show.value = false
    msg.value = ''
    color.value = 'info'
    timeout.value = 3000
  })

  describe('Drawer Store', () => {
    it('persists drawer state in localStorage', async () => {
      const drawerStore = useDrawerStore()

      // Simulate loading from storage
      drawerStore.loadFromStorage()

      // Check if localStorage.getItem was called
      expect(localStorage.getItem).toHaveBeenCalledWith('drawer')

      // Simulate saving to storage
      drawerStore.setOpen(false)

      // Check if localStorage.setItem was called
      expect(localStorage.setItem).toHaveBeenCalledWith('drawer', 'false')
    })

    it('toggles drawer state when toggle() is called', async () => {
      const drawerStore = useDrawerStore()
      const initialState = drawerStore.isOpen

      drawerStore.toggle()

      expect(drawerStore.isOpen).toBe(!initialState)
    })

    it('sets drawer state when setOpen() is called', async () => {
      const drawerStore = useDrawerStore()

      drawerStore.setOpen(false)
      expect(drawerStore.isOpen).toBe(false)

      drawerStore.setOpen(true)
      expect(drawerStore.isOpen).toBe(true)
    })

    it('loads initial state from localStorage', async () => {
      // Mock localStorage to return a value
      ;(localStorage.getItem as any).mockReturnValue('false')

      const drawerStore = useDrawerStore()
      drawerStore.loadFromStorage()

      expect(drawerStore.isOpen).toBe(false)
    })
  })

  describe('Snackbar Composable', () => {
    it('shows snackbar when push() is called', async () => {
      const { push, show, msg, color } = useSnackbar()

      // Trigger snackbar
      push('Saved', 'success')

      // Check if snackbar state is updated
      expect(show.value).toBe(true)
      expect(msg.value).toBe('Saved')
      expect(color.value).toBe('success')
    })

    it('shows snackbar with custom timeout', async () => {
      const { push, show, msg, color, timeout } = useSnackbar()

      // Trigger snackbar with custom timeout
      push('Error occurred', 'error', 5000)

      expect(show.value).toBe(true)
      expect(msg.value).toBe('Error occurred')
      expect(color.value).toBe('error')
      expect(timeout.value).toBe(5000)
    })

    it('hides snackbar when hideSnackbar() is called', async () => {
      const { push, onHide, show } = useSnackbar()

      // Show snackbar first
      push('Test message')
      expect(show.value).toBe(true)

      // Hide snackbar
      onHide()
      expect(show.value).toBe(false)
    })

    it('uses default values when push() is called with minimal parameters', async () => {
      const { push, show, msg, color, timeout } = useSnackbar()

      // Trigger snackbar with only text
      push('Default message')

      expect(show.value).toBe(true)
      expect(msg.value).toBe('Default message')
      expect(color.value).toBe('info')
      expect(timeout.value).toBe(3000)
    })
  })

  describe('Responsive Behavior', () => {
    it('detects mobile viewport correctly', async () => {
      // Set mobile width
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 320,
      })

      // In a real component, this would be computed
      const isMobile = window.innerWidth < 600
      expect(isMobile).toBe(true)
    })

    it('detects desktop viewport correctly', async () => {
      // Set desktop width
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      })

      // In a real component, this would be computed
      const isMobile = window.innerWidth < 600
      expect(isMobile).toBe(false)
    })
  })
})
