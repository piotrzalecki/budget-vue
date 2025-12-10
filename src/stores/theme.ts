import { defineStore } from 'pinia'
import { useTheme } from 'vuetify'

export const useThemeStore = defineStore('theme', {
  state: () => ({
    isDark: false,
  }),

  actions: {
    toggleTheme() {
      this.isDark = !this.isDark
      this.applyTheme()
      this.saveToStorage()
    },

    setTheme(isDark: boolean) {
      this.isDark = isDark
      this.applyTheme()
      this.saveToStorage()
    },

    applyTheme() {
      const theme = useTheme()
      theme.global.name.value = this.isDark ? 'dark' : 'light'
    },

    loadFromStorage() {
      const saved = localStorage.getItem('theme')
      if (saved !== null) {
        this.isDark = JSON.parse(saved)
        this.applyTheme()
      }
    },

    saveToStorage() {
      localStorage.setItem('theme', JSON.stringify(this.isDark))
    },
  },
})
