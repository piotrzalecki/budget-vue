<template>
  <v-navigation-drawer v-model="isOpen" location="right" width="420" temporary>
    <v-card flat>
      <v-card-title class="text-h6">
        {{ editId ? 'Edit Recurring Rule' : 'Add Recurring Rule' }}
      </v-card-title>

      <v-form ref="form" v-model="valid" class="px-4 pb-4">
        <MoneyInput v-model="amount" label="Amount" class="mb-3" />

        <v-text-field v-model="description" label="Description" variant="outlined" />

        <v-select
          v-model="frequency"
          :items="freqOptions"
          label="Frequency"
          class="mt-3"
          variant="outlined"
        />

        <v-text-field
          v-model.number="interval"
          label="Interval (every N)"
          type="number"
          min="1"
          class="mt-3"
          variant="outlined"
        />

        <v-text-field
          v-model="firstDue"
          type="date"
          color="primary"
          :min="today"
          label="First due date"
          class="mt-3"
          variant="outlined"
        />

        <v-text-field
          v-model="endDate"
          type="date"
          color="primary"
          :min="firstDue"
          label="End date (optional)"
          class="mt-3"
          variant="outlined"
        />

        <TagMultiSelect v-model="tagIds" class="mt-3" />
      </v-form>

      <v-card-actions class="justify-end">
        <v-btn text @click="$emit('close')">Cancel</v-btn>
        <v-btn :disabled="!valid" color="primary" @click="handleSave">
          {{ editId ? 'Update' : 'Save' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
  import { computed, ref, watch } from 'vue'
  import { useRecurringStore } from '../stores/recurring'
  import MoneyInput from './forms/MoneyInput.vue'
  import TagMultiSelect from './forms/TagMultiSelect.vue'

  const props = defineProps<{
    open: boolean
    editId: number | null
  }>()

  const emit = defineEmits<{
    (
      e: 'save',
      payload: {
        amount: string
        description: string
        frequency: 'daily' | 'weekly' | 'monthly' | 'yearly'
        interval_n: number
        first_due_date: string
        end_date: string | undefined
        tag_ids: number[]
      }
    ): void
    (e: 'close'): void
  }>()

  const recurringStore = useRecurringStore()

  const amount = ref(0)
  const description = ref('')
  const frequency = ref('' as 'daily' | 'weekly' | 'monthly' | 'yearly')
  const interval = ref(1)
  const firstDue = ref<string | null>(null)
  const endDate = ref<string | null>(null)
  const tagIds = ref<number[]>([])
  const today = new Date().toISOString().slice(0, 10)

  const valid = ref(false)
  const loading = ref(false)

  const freqOptions = [
    { title: 'Daily', value: 'daily' },
    { title: 'Weekly', value: 'weekly' },
    { title: 'Monthly', value: 'monthly' },
    { title: 'Yearly', value: 'yearly' },
  ]

  const isOpen = computed({
    get: () => props.open,
    set: (value: boolean) => {
      if (!value) {
        emit('close')
      }
    },
  })

  // Validation function
  const validateForm = () => {
    let isValid = true

    // amount ≠ 0
    if (amount.value === 0) {
      isValid = false
    }

    // frequency required
    if (!frequency.value) {
      isValid = false
    }

    // interval ≥ 1
    if (interval.value < 1) {
      isValid = false
    }

    // first_due_date required
    if (!firstDue.value) {
      isValid = false
    }

    // end_date ≥ first_due_date (if provided)
    if (endDate.value && firstDue.value && endDate.value < firstDue.value) {
      isValid = false
    }

    valid.value = isValid
  }

  // Watch for form changes to validate
  watch([amount, description, frequency, interval, firstDue, endDate, tagIds], validateForm, {
    deep: true,
  })

  // Load existing rule for editing
  const loadRule = async (id: number) => {
    loading.value = true
    try {
      const rule = recurringStore.list.find(r => r.id === id)
      if (rule) {
        amount.value = parseFloat(rule.amount) * 100 // Convert string to pence
        description.value = rule.description
        frequency.value = rule.frequency
        interval.value = rule.interval_n
        firstDue.value = rule.first_due_date
        endDate.value = rule.end_date || null
        tagIds.value = rule.tag_ids || []
      }
    } catch (error) {
      console.error('Failed to load recurring rule:', error)
    } finally {
      loading.value = false
    }
  }

  // Watch for editId changes
  watch(
    () => props.editId,
    newId => {
      if (newId !== null) {
        loadRule(newId)
      } else {
        // Reset form for new rule
        amount.value = 0
        description.value = ''
        frequency.value = 'monthly'
        interval.value = 1
        firstDue.value = today
        endDate.value = null
        tagIds.value = []
      }
    },
    { immediate: true }
  )

  function handleSave() {
    if (!valid.value) return

    emit('save', {
      amount: (amount.value / 100).toFixed(2),
      description: description.value,
      frequency: frequency.value,
      interval_n: interval.value,
      first_due_date: firstDue.value!,
      end_date: endDate.value || undefined,
      tag_ids: tagIds.value,
    })
    emit('close')
  }
</script>
