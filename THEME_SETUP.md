# Vuetify 3 Theme Setup

This document describes the Vuetify 3 theme configuration for the Budget App.

## Overview

The app uses Vuetify 3 with a custom theme configuration that supports both light and dark modes. The theme preference is persisted in localStorage and can be toggled via a button in the app bar.

## Configuration Files

### 1. Vuetify Plugin (`src/plugins/vuetify.ts`)

```typescript
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

export default createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        colors: {
          primary: '#1867C0',
          secondary: '#5CBBF6',
          accent: '#82B1FF',
          error: '#FF5252',
          info: '#2196F3',
          success: '#4CAF50',
          warning: '#FFC107',
        },
      },
      dark: {
        colors: {
          primary: '#2196F3',
          secondary: '#424242',
          accent: '#FF4081',
          error: '#FF5252',
          info: '#2196F3',
          success: '#4CAF50',
          warning: '#FB8C00',
        },
      },
    },
  },
})
```

### 2. Theme Store (`src/stores/theme.ts`)

The theme store manages the dark/light theme state using Pinia:

```typescript
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
```

### 3. Theme Toggle Component (`src/components/shared/ThemeToggle.vue`)

A reusable component for toggling between themes:

```vue
<template>
  <v-btn
    :icon="icon"
    :variant="variant"
    :size="size"
    @click="themeStore.toggleTheme()"
    :title="themeStore.isDark ? 'Switch to light mode' : 'Switch to dark mode'"
  >
    <v-icon>
      {{ themeStore.isDark ? 'mdi-weather-sunny' : 'mdi-weather-night' }}
    </v-icon>
  </v-btn>
</template>

<script setup lang="ts">
import { useThemeStore } from '@/stores/theme'

interface Props {
  icon?: boolean
  variant?: 'text' | 'flat' | 'elevated' | 'tonal' | 'outlined' | 'plain'
  size?: 'x-small' | 'small' | 'default' | 'large' | 'x-large'
}

withDefaults(defineProps<Props>(), {
  icon: true,
  variant: 'text',
  size: 'small',
})

const themeStore = useThemeStore()
</script>
```

## Usage

### In App.vue

The theme toggle is integrated into the app bar:

```vue
<v-btn
  icon
  @click="themeStore.toggleTheme()"
  :title="themeStore.isDark ? 'Switch to light mode' : 'Switch to dark mode'"
>
  <v-icon>{{ themeStore.isDark ? 'mdi-weather-sunny' : 'mdi-weather-night' }}</v-icon>
</v-btn>
```

### In Other Components

To use the theme store in any component:

```vue
<script setup lang="ts">
import { useThemeStore } from '@/stores/theme'

const themeStore = useThemeStore()

// Toggle theme
const toggleTheme = () => {
  themeStore.toggleTheme()
}

// Set specific theme
const setDarkTheme = () => {
  themeStore.setTheme(true)
}

const setLightTheme = () => {
  themeStore.setTheme(false)
}
</script>
```

## Dependencies

The following dependencies are required:

- `vuetify@^3.8.12` - Vuetify 3 framework
- `@mdi/font` - Material Design Icons
- `pinia@^3.0.3` - State management

## Features

- ✅ Light and dark theme support
- ✅ Theme persistence in localStorage
- ✅ Automatic theme loading on app start
- ✅ Reusable theme toggle component
- ✅ Material Design Icons integration
- ✅ TypeScript support
- ✅ Responsive design

## Color Scheme

### Light Theme

- Primary: `#1867C0` (Blue)
- Secondary: `#5CBBF6` (Light Blue)
- Accent: `#82B1FF` (Light Blue)
- Error: `#FF5252` (Red)
- Success: `#4CAF50` (Green)
- Warning: `#FFC107` (Yellow)

### Dark Theme

- Primary: `#2196F3` (Blue)
- Secondary: `#424242` (Gray)
- Accent: `#FF4081` (Pink)
- Error: `#FF5252` (Red)
- Success: `#4CAF50` (Green)
- Warning: `#FB8C00` (Orange)

## Future Enhancements

- System theme detection (prefers-color-scheme media query)
- Custom theme color picker
- Theme transition animations
- High contrast mode support
