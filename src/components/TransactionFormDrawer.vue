<template>
  <v-navigation-drawer v-model="isOpen" location="right" width="420" temporary>
    <v-card flat height="100%">
      <v-card-title class="d-flex align-center">
        <span>{{ editMode ? 'Edit' : 'Add' }} Transaction</span>
        <v-spacer />
        <v-btn icon @click="$emit('close')">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text>
        <v-skeleton-loader v-if="loading" type="article" class="mx-auto" />

        <v-form v-else ref="form" v-model="valid" @submit.prevent="onSave">
          <v-row>
            <v-col cols="12">
              <MoneyInput
                v-model="formData.amount_pence"
                :error-messages="errors.amount"
                label="Amount"
                placeholder="0.00"
              />
            </v-col>

            <v-col cols="12">
              <v-text-field
                v-model="formData.t_date"
                type="date"
                :error-messages="errors.date"
                label="Date"
                variant="outlined"
                full-width
              />
            </v-col>

            <v-col cols="12">
              <TagMultiSelect
                v-model="formData.tag_ids"
                :error-messages="errors.tags"
                label="Tags"
                placeholder="Select tags..."
              />
            </v-col>

            <v-col cols="12">
              <v-text-field
                v-model="formData.note"
                label="Note"
                variant="outlined"
                rows="2"
                multiline
                :error-messages="errors.note"
                @keyup.enter="onSave"
              />
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>

      <v-card-actions class="justify-end pa-4">
        <v-btn variant="text" @click="$emit('close')" :disabled="saving"> Cancel </v-btn>
        <v-btn
          :disabled="!valid || loading || saving"
          color="primary"
          @click="onSave"
          :loading="saving"
        >
          {{ editMode ? 'Update' : 'Save' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
  import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
  import { useTransactionsStore } from '../stores/transactions'
  import MoneyInput from './forms/MoneyInput.vue'
  import TagMultiSelect from './forms/TagMultiSelect.vue'

  interface Props {
    open: boolean
    editId: number | null
    saving?: boolean
  }

  const props = defineProps<Props>()

  const emit = defineEmits<{
    (
      e: 'save',
      payload: {
        amount_pence: number
        t_date: string
        tag_ids: number[]
        note: string
      }
    ): void
    (e: 'close'): void
  }>()

  const transactionsStore = useTransactionsStore()
  const form = ref()
  const valid = ref(false)
  const loading = ref(false)

  const formData = ref({
    amount_pence: 0,
    t_date: new Date().toISOString().split('T')[0],
    tag_ids: [] as number[],
    note: '',
  })

  const errors = ref({
    amount: '',
    date: '',
    tags: '',
    note: '',
  })

  const isOpen = computed({
    get: () => props.open,
    set: (value: boolean) => {
      if (!value) {
        emit('close')
      }
    },
  })

  const editMode = computed(() => props.editId !== null)

  // Validation rules
  const validateForm = () => {
    errors.value = {
      amount: '',
      date: '',
      tags: '',
      note: '',
    }

    if (formData.value.amount_pence === 0) {
      errors.value.amount = 'Amount is required and must not be zero'
    }

    if (!formData.value.t_date) {
      errors.value.date = 'Date is required'
    }

    if (!formData.value.tag_ids || formData.value.tag_ids.length === 0) {
      errors.value.tags = 'At least one tag is required'
    }

    valid.value = !errors.value.amount && !errors.value.date && !errors.value.tags
  }

  // Watch for form changes to validate
  watch(formData, validateForm, { deep: true })

  // Load existing transaction for editing
  const loadTransaction = async (id: number) => {
    loading.value = true
    try {
      const transaction = transactionsStore.list.find(t => t.id === id)
      if (transaction) {
        formData.value = {
          amount_pence: transaction.amount_pence,
          t_date: transaction.t_date,
          tag_ids: Array.isArray(transaction.tags) ? transaction.tags.map(t => t.id) : [],
          note: transaction.note || '',
        }
      }
    } catch (error) {
      // Handle error silently
    } finally {
      loading.value = false
    }
  }

  // Watch for editId changes
  watch(
    () => props.editId,
    newId => {
      if (newId !== null) {
        loadTransaction(newId)
      } else {
        // Reset form for new transaction
        formData.value = {
          amount_pence: 0,
          t_date: new Date().toISOString().split('T')[0],
          tag_ids: [],
          note: '',
        }
      }
    },
    { immediate: true }
  )

  const onSave = async () => {
    if (!valid.value) return

    const payload = {
      amount_pence: formData.value.amount_pence,
      t_date: formData.value.t_date,
      tag_ids: formData.value.tag_ids,
      note: formData.value.note,
    }

    emit('save', payload)
  }

  // Handle Enter key in any field
  const handleKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Enter' && valid.value) {
      onSave()
    }
  }

  onMounted(() => {
    // Add global keydown listener
    document.addEventListener('keydown', handleKeydown)
  })

  // Clean up event listener
  onUnmounted(() => {
    document.removeEventListener('keydown', handleKeydown)
  })
</script>
