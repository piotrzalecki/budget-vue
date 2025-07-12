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
