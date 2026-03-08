<template>
  <v-dialog v-model="dialog" max-width="400">
    <v-card>
      <v-card-title class="text-h6">
        <v-icon class="mr-2">{{ isEdit ? 'mdi-pencil' : 'mdi-plus' }}</v-icon>
        {{ isEdit ? 'Edit User' : 'Add New User' }}
      </v-card-title>
      <v-card-text>
        <v-form ref="form" v-model="valid">
          <v-text-field
            v-model="email"
            label="Email"
            :rules="[rules.required, rules.email]"
            variant="outlined"
            density="compact"
            autofocus
            class="mb-2"
          />
          <v-text-field
            v-model="password"
            :label="isEdit ? 'Password (leave blank to keep unchanged)' : 'Password'"
            :rules="isEdit ? [rules.passwordOptional] : [rules.required, rules.minLength]"
            type="password"
            variant="outlined"
            density="compact"
            class="mb-2"
          />
          <v-checkbox
            v-model="isService"
            label="Service account"
            density="compact"
            hide-details
          />
        </v-form>
      </v-card-text>
      <v-card-actions class="justify-end">
        <v-btn variant="text" @click="close">Cancel</v-btn>
        <v-btn
          color="primary"
          variant="elevated"
          @click="save"
          :loading="saving"
          :disabled="!valid || !email.trim()"
        >
          {{ isEdit ? 'Save' : 'Add' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
  import { computed, ref, watch } from 'vue'
  import type { User } from '../stores/users'

  const props = defineProps<{
    modelValue: boolean
    user?: User | null
  }>()

  const emit = defineEmits<{
    (e: 'update:modelValue', value: boolean): void
    (e: 'save', data: { email: string; password?: string; is_service: boolean }): void
  }>()

  const dialog = computed({
    get: () => props.modelValue,
    set: value => emit('update:modelValue', value),
  })

  const isEdit = computed(() => !!props.user)

  const valid = ref(false)
  const email = ref('')
  const password = ref('')
  const isService = ref(false)
  const saving = ref(false)
  const form = ref()

  watch(
    () => props.modelValue,
    open => {
      if (open) {
        email.value = props.user?.email ?? ''
        isService.value = props.user?.is_service ?? false
        password.value = ''
      }
    }
  )

  const rules = {
    required: (value: string) => !!value.trim() || 'This field is required',
    email: (value: string) => /.+@.+\..+/.test(value) || 'Must be a valid email',
    minLength: (value: string) => value.length >= 8 || 'Password must be at least 8 characters',
    passwordOptional: (value: string) =>
      !value || value.length >= 8 || 'Password must be at least 8 characters',
  }

  function close() {
    dialog.value = false
    email.value = ''
    password.value = ''
    isService.value = false
  }

  async function save() {
    if (!valid.value || !email.value.trim()) return

    saving.value = true
    try {
      const data: { email: string; password?: string; is_service: boolean } = {
        email: email.value.trim(),
        is_service: isService.value,
      }
      if (password.value) {
        data.password = password.value
      }
      emit('save', data)
      close()
    } finally {
      saving.value = false
    }
  }
</script>
