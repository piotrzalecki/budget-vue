<template>
  <v-container class="fill-height">
    <v-row justify="center" align="center">
      <v-col cols="12" sm="8" md="6" lg="4">
        <v-card width="400" class="mx-auto">
          <v-card-title class="text-center"> Enter API Key </v-card-title>
          <v-card-text>
            <v-text-field
              v-model="key"
              type="password"
              label="API Key"
              variant="outlined"
              @keyup.enter="save"
            />
          </v-card-text>
          <v-card-actions class="justify-center pb-4">
            <v-btn color="primary" :disabled="!key" @click="save" size="large"> Continue </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useSessionStore } from '@/stores/session'
import { useSnackbar } from '@/composables/useSnackbar'

const router = useRouter()
const sessionStore = useSessionStore()
const { showSnackbar } = useSnackbar()

const key = ref('')

const save = () => {
  if (key.value.trim()) {
    sessionStore.setKey(key.value.trim())
    router.push('/dashboard')
    showSnackbar({ text: 'API key saved successfully' })
  }
}
</script>
