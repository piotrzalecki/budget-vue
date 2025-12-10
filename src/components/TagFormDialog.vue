<template>
  <v-dialog v-model="dialog" max-width="400">
    <v-card>
      <v-card-title class="text-h6">
        <v-icon class="mr-2">mdi-plus</v-icon>
        Add New Tag
      </v-card-title>
      <v-card-text>
        <v-form ref="form" v-model="valid">
          <v-text-field
            v-model="tagName"
            label="Tag Name"
            :rules="[rules.required, rules.maxLength]"
            variant="outlined"
            density="compact"
            autofocus
            @keyup.enter="save"
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
          :disabled="!valid || !tagName.trim()"
        >
          Add
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
  import { computed, ref } from 'vue'

  const props = defineProps<{
    modelValue: boolean
  }>()

  const emit = defineEmits<{
    (e: 'update:modelValue', value: boolean): void
    (e: 'save', name: string): void
  }>()

  const dialog = computed({
    get: () => props.modelValue,
    set: value => emit('update:modelValue', value),
  })

  const valid = ref(false)
  const tagName = ref('')
  const saving = ref(false)
  const form = ref()

  const rules = {
    required: (value: string) => !!value.trim() || 'Tag name is required',
    maxLength: (value: string) => value.length <= 100 || 'Tag name must be 100 characters or less',
  }

  function close() {
    dialog.value = false
    tagName.value = ''
  }

  async function save() {
    if (!valid.value || !tagName.value.trim()) return

    saving.value = true
    try {
      emit('save', tagName.value.trim())
      close()
    } finally {
      saving.value = false
    }
  }
</script>
