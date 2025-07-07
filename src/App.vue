<script setup lang="ts">
  import { computed, onMounted, onUnmounted, ref } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { useSnackbar } from './composables/useSnackbar'
  import { navigationItems } from './router'
  import { useDrawerStore } from './stores/drawer'
  import { useSessionStore } from './stores/session'
  import { useThemeStore } from './stores/theme'

  const router = useRouter()
  const route = useRoute()
  const sessionStore = useSessionStore()
  const { snackbar } = useSnackbar()
  const themeStore = useThemeStore()
  const drawerStore = useDrawerStore()

  // Reactive window width for responsive behavior
  const windowWidth = ref(window.innerWidth)

  // Computed properties for responsive behavior
  const isMobile = computed(() => windowWidth.value < 600)
  const isLoggedIn = computed(() => !!sessionStore.apiKey)
  const drawerModel = computed({
    get: () => drawerStore.isOpen,
    set: (value: boolean) => drawerStore.setOpen(value),
  })

  // Handle window resize
  const handleResize = () => {
    windowWidth.value = window.innerWidth
  }

  // Auto-close drawer on mobile when route changes
  const handleRouteChange = () => {
    if (isMobile.value) {
      drawerStore.setOpen(false)
    }
  }

  const logout = () => {
    sessionStore.clearKey()
    router.push('/login')
  }

  // Load drawer state from storage on mount
  onMounted(() => {
    drawerStore.loadFromStorage()
    themeStore.loadFromStorage()

    // Add window resize listener
    window.addEventListener('resize', handleResize)

    // Watch for route changes to auto-close drawer on mobile
    router.afterEach(handleRouteChange)
  })

  // Clean up event listener
  onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
  })
</script>

<template>
  <v-app>
    <!-- Navigation Drawer - Only for mobile devices when logged in -->
    <v-navigation-drawer
      v-if="isLoggedIn && isMobile"
      v-model="drawerModel"
      app
      temporary
      width="280"
    >
      <v-list>
        <v-list-item
          v-for="item in navigationItems"
          :key="item.path"
          :to="item.path"
          :prepend-icon="item.icon"
          :title="item.title"
          :active="route.path === item.path"
          rounded="lg"
          class="mb-1"
          :data-testid="`nav-item-${item.path.slice(1)}`"
        />
      </v-list>
    </v-navigation-drawer>

    <!-- App Bar -->
    <v-app-bar app elevation="2" :color="themeStore.isDark ? 'surface' : 'primary'">
      <!-- Mobile menu button - only show when logged in -->
      <v-app-bar-nav-icon v-if="isLoggedIn && isMobile" @click="drawerStore.toggle()" />

      <v-toolbar-title class="font-weight-bold">Budget</v-toolbar-title>

      <!-- Desktop navigation menu - only show when logged in -->
      <v-toolbar-items v-if="isLoggedIn && !isMobile" class="ml-4">
        <v-btn
          v-for="item in navigationItems"
          :key="item.path"
          :to="item.path"
          variant="text"
          :active="route.path === item.path"
          :data-testid="`nav-item-${item.path.slice(1)}`"
        >
          <v-icon start>{{ item.icon }}</v-icon>
          {{ item.title }}
        </v-btn>
      </v-toolbar-items>

      <v-spacer />

      <!-- Theme Toggle -->
      <v-btn
        icon
        @click="themeStore.toggleTheme()"
        :title="themeStore.isDark ? 'Switch to light mode' : 'Switch to dark mode'"
      >
        <v-icon>{{ themeStore.isDark ? 'mdi-weather-sunny' : 'mdi-weather-night' }}</v-icon>
      </v-btn>

      <!-- Logout Button - only show when logged in -->
      <v-btn v-if="isLoggedIn" icon @click="logout" title="Logout">
        <v-icon>mdi-logout</v-icon>
      </v-btn>
    </v-app-bar>

    <!-- Main Content -->
    <v-main>
      <v-container fluid class="pa-4">
        <router-view />
      </v-container>
    </v-main>

    <!-- Global Snackbar -->
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      :timeout="snackbar.timeout"
      location="bottom"
    >
      {{ snackbar.text }}
      <template v-slot:actions>
        <v-btn color="white" variant="text" @click="snackbar.show = false"> Close </v-btn>
      </template>
    </v-snackbar>
  </v-app>
</template>

<style scoped>
  /* Ensure proper responsive behavior */
  .v-navigation-drawer {
    border-right: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  }

  /* Mobile-specific styles */
  @media (max-width: 599px) {
    .v-navigation-drawer {
      width: 280px !important;
    }
  }

  /* Ensure app bar stays on top */
  .v-app-bar {
    z-index: 100;
  }

  /* Main content padding adjustments */
  .v-main {
    padding-top: 64px; /* App bar height */
  }

  /* Remove left padding for desktop since we're not using drawer */
  @media (min-width: 600px) {
    .v-main {
      padding-left: 0;
    }
  }

  /* Mobile container adjustments */
  @media (max-width: 599px) {
    .main-container {
      padding-left: 16px !important;
      padding-right: 16px !important;
    }
  }
</style>
