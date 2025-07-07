import { defineStore } from 'pinia'

export const useDrawerStore = defineStore('drawer', {
  state: () => ({
    isOpen: true,
  }),

  actions: {
    toggle() {
      this.isOpen = !this.isOpen
      this.saveToStorage()
    },

    setOpen(isOpen: boolean) {
      this.isOpen = isOpen
      this.saveToStorage()
    },

    loadFromStorage() {
      const saved = localStorage.getItem('drawer')
      if (saved !== null) {
        this.isOpen = JSON.parse(saved)
      }
    },

    saveToStorage() {
      localStorage.setItem('drawer', JSON.stringify(this.isOpen))
    },
  },
})
