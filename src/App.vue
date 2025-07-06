<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useSessionStore } from './stores/session'
import { useSnackbar } from './composables/useSnackbar'
import { useThemeStore } from './stores/theme'

const router = useRouter()
const sessionStore = useSessionStore()
const { snackbar } = useSnackbar()
const themeStore = useThemeStore()

const drawer = ref(true)

const menuItems = [
  { title: 'Dashboard', path: '/dashboard', icon: 'mdi-view-dashboard' },
  { title: 'Transactions', path: '/transactions', icon: 'mdi-format-list-bulleted' },
  { title: 'Recurring', path: '/recurring', icon: 'mdi-refresh' },
  { title: 'Tags', path: '/tags', icon: 'mdi-tag' },
  { title: 'Settings', path: '/settings', icon: 'mdi-cog' },
]

const logout = () => {
  sessionStore.clearKey()
  router.push('/login')
}
</script>

<template>
  <v-app>
    <!-- Navigation Drawer -->
    <v-navigation-drawer v-model="drawer" app>
      <v-list>
        <v-list-item
          v-for="item in menuItems"
          :key="item.path"
          :to="item.path"
          :prepend-icon="item.icon"
          :title="item.title"
        />
      </v-list>
    </v-navigation-drawer>

    <!-- App Bar -->
    <v-app-bar app>
      <v-app-bar-nav-icon @click="drawer = !drawer" />
      <v-toolbar-title>Budget App</v-toolbar-title>
      <v-spacer />
      <v-btn
        icon
        @click="themeStore.toggleTheme()"
        :title="themeStore.isDark ? 'Switch to light mode' : 'Switch to dark mode'"
      >
        <v-icon>{{ themeStore.isDark ? 'mdi-weather-sunny' : 'mdi-weather-night' }}</v-icon>
      </v-btn>
      <v-btn icon @click="logout" title="Logout">
        <v-icon>mdi-logout</v-icon>
      </v-btn>
    </v-app-bar>

    <!-- Main Content -->
    <v-main>
      <router-view />
    </v-main>

    <!-- Global Snackbar -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" :timeout="snackbar.timeout">
      {{ snackbar.text }}
    </v-snackbar>
  </v-app>
</template>

<style scoped>
header {
  line-height: 1.5;
  max-height: 100vh;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

nav {
  width: 100%;
  font-size: 12px;
  text-align: center;
  margin-top: 2rem;
}

nav a.router-link-exact-active {
  color: var(--color-text);
}

nav a.router-link-exact-active:hover {
  background-color: transparent;
}

nav a {
  display: inline-block;
  padding: 0 1rem;
  border-left: 1px solid var(--color-border);
}

nav a:first-of-type {
  border: 0;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }

  nav {
    text-align: left;
    margin-left: -1rem;
    font-size: 1rem;

    padding: 1rem 0;
    margin-top: 1rem;
  }
}
</style>
