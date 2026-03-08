<template>
  <v-container class="fill-height">
    <v-row justify="center" align="center">
      <v-col cols="12" sm="8" md="6" lg="8">
        <v-card width="400" class="mx-auto">
          <v-card-title class="text-center"> Login </v-card-title>
          <v-card-text>
            <v-text-field
              v-model="email"
              type="email"
              label="Email"
              variant="outlined"
              class="mb-2"
              @keyup.enter="login"
            />
            <v-text-field
              v-model="password"
              type="password"
              label="Password"
              variant="outlined"
              @keyup.enter="login"
            />
          </v-card-text>
          <v-card-actions class="pb-4">
            <v-btn
              color="primary"
              :disabled="!email || !password"
              :loading="loading"
              @click="login"
              size="large"
            >
              Login
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
  import { useApi } from '@/composables/useApi'
  import { useSnackbar } from '@/composables/useSnackbar'
  import { useSessionStore } from '@/stores/session'
  import { ref } from 'vue'
  import { useRouter } from 'vue-router'

  const router = useRouter()
  const sessionStore = useSessionStore()
  const snack = useSnackbar()
  const api = useApi()

  const email = ref('')
  const password = ref('')
  const loading = ref(false)

  const login = async () => {
    if (!email.value || !password.value) return
    loading.value = true
    try {
      const { data: body } = await api.post('/auth/login', {
        email: email.value,
        password: password.value,
      })
      const { token, email: userEmail, user_id } = body.data
      sessionStore.setSession(token, userEmail, user_id)
      router.push('/dashboard')
    } catch {
      snack.push('Invalid email or password', 'error')
    } finally {
      loading.value = false
    }
  }
</script>
