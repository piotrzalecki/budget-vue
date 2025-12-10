<template>
  <v-data-table
    :items="items"
    :headers="headers"
    :loading="loading"
    density="compact"
    class="elevation-1 rounded"
    :item-class="getItemClass"
  >
    <template #item.amount="{ item }">
      <span :class="parseFloat(item.amount) < 0 ? 'text-error' : 'text-success'">
        {{ money(parseFloat(item.amount) * 100) }}
      </span>
    </template>

    <template #item.frequency="{ item }">
      <v-chip size="x-small" color="secondary" text-color="onSecondary">
        {{ formatFrequency(item.frequency, item.interval_n) }}
      </v-chip>
    </template>

    <template #item.next_due_date="{ item }">
      <span :class="isOverdue(item.next_due_date) ? 'text-error' : ''">
        {{ formatDate(item.next_due_date) }}
      </span>
    </template>

    <template #item.active="{ item }">
      <v-switch
        :model-value="item.active"
        inset
        density="compact"
        @update:model-value="val => val !== null && $emit('toggle', item.id, val)"
        :disabled="loading"
        :color="item.active ? 'success' : 'grey'"
      />
    </template>

    <template #item.actions="{ item }">
      <v-btn icon size="small" @click="$emit('edit', item.id)" :disabled="loading">
        <v-icon>mdi-pencil</v-icon>
      </v-btn>
      <v-btn icon size="small" @click="confirmDelete(item)" :disabled="loading">
        <v-icon color="error">mdi-delete</v-icon>
      </v-btn>
    </template>
  </v-data-table>

  <v-progress-linear v-if="loading" indeterminate color="primary" />

  <!-- Delete Confirmation Dialog -->
  <v-dialog v-model="deleteDialog" max-width="400">
    <v-card>
      <v-card-title class="text-h6">
        <v-icon color="error" class="mr-2">mdi-alert-circle</v-icon>
        Confirm Delete
      </v-card-title>
      <v-card-text>
        <p>Are you sure you want to delete this recurring transaction?</p>
        <v-card variant="outlined" class="mt-3 pa-3" color="grey-lighten-3">
          <div class="d-flex align-center mb-2">
            <span class="font-weight-medium">Description:</span>
            <span class="ml-2">{{ recurringToDelete?.description || '' }}</span>
          </div>
          <div class="d-flex align-center mb-2">
            <span class="font-weight-medium">Amount:</span>
            <span
              class="ml-2"
              :class="
                recurringToDelete && parseFloat(recurringToDelete.amount) < 0
                  ? 'text-error'
                  : 'text-success'
              "
            >
              {{ recurringToDelete ? money(parseFloat(recurringToDelete.amount) * 100) : '' }}
            </span>
          </div>
          <div class="d-flex align-center mb-2">
            <span class="font-weight-medium">Frequency:</span>
            <span class="ml-2">
              {{
                recurringToDelete
                  ? formatFrequency(recurringToDelete.frequency, recurringToDelete.interval_n)
                  : ''
              }}
            </span>
          </div>
          <div class="d-flex align-center mb-2">
            <span class="font-weight-medium">Next Due:</span>
            <span class="ml-2">
              {{ recurringToDelete ? formatDate(recurringToDelete.next_due_date) : '' }}
            </span>
          </div>
          <div class="d-flex align-center">
            <span class="font-weight-medium">Status:</span>
            <v-chip
              :color="recurringToDelete?.active ? 'success' : 'grey'"
              size="x-small"
              class="ml-2"
            >
              {{ recurringToDelete?.active ? 'Active' : 'Inactive' }}
            </v-chip>
          </div>
        </v-card>
      </v-card-text>
      <v-card-actions class="justify-end">
        <v-btn variant="text" @click="deleteDialog = false"> Cancel </v-btn>
        <v-btn color="error" variant="elevated" @click="handleDelete" :loading="deleting">
          Delete
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import { useMoneyFormat } from '../composables/useMoneyFormat'
  import type { RecurringTransaction } from '../stores/recurring'

  const props = defineProps<{
    items: RecurringTransaction[]
    loading?: boolean
  }>()

  const emit = defineEmits<{
    (e: 'edit', id: number): void
    (e: 'toggle', id: number, newState: boolean): void
    (e: 'delete', id: number): void
  }>()

  const money = useMoneyFormat()

  // Delete confirmation dialog state
  const deleteDialog = ref(false)
  const recurringToDelete = ref<RecurringTransaction | null>(null)
  const deleting = ref(false)

  const headers = [
    { title: 'Description', value: 'description', sortable: true },
    { title: 'Amount', value: 'amount', sortable: true, align: 'end' as const },
    { title: 'Frequency', value: 'frequency', sortable: true },
    { title: 'Next Due', value: 'next_due_date', sortable: true },
    { title: 'Active', value: 'active', sortable: true, align: 'center' as const },
    { title: '', value: 'actions', sortable: false, align: 'end' as const },
  ]

  function formatFrequency(frequency: string, interval: number): string {
    const frequencyMap = {
      daily: 'Daily',
      weekly: 'Weekly',
      monthly: 'Monthly',
      yearly: 'Yearly',
    }
    const freq = frequencyMap[frequency as keyof typeof frequencyMap] || frequency
    return interval > 1 ? `${freq} ×${interval}` : freq
  }

  function formatDate(dateString: string): string {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  function isOverdue(dateString: string): boolean {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const dueDate = new Date(dateString)
    dueDate.setHours(0, 0, 0, 0)
    return dueDate < today
  }

  function getItemClass(item: RecurringTransaction): string {
    return item.active ? '' : 'opacity-50'
  }

  function confirmDelete(recurring: RecurringTransaction) {
    recurringToDelete.value = recurring
    deleteDialog.value = true
  }

  async function handleDelete() {
    if (!recurringToDelete.value) return

    deleting.value = true
    try {
      emit('delete', recurringToDelete.value.id)
      deleteDialog.value = false
      recurringToDelete.value = null
    } finally {
      deleting.value = false
    }
  }
</script>
