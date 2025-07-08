<template>
  <v-data-table
    :items="items"
    :headers="headers"
    :items-per-page="itemsPerPage"
    :page="page"
    :loading="loading"
    :server-items-length="computedTotal"
    show-current-page
    density="compact"
    class="elevation-1 rounded"
    @update:options="onOptions"
  >
    <template #item.amount_pence="{ item }">
      <span :class="(item.amount_pence || 0) < 0 ? 'text-error' : 'text-success'">
        {{ money(item.amount_pence || 0) }}
      </span>
    </template>

    <template #item.tags="{ item }">
      <v-chip
        v-for="t in item.tags || []"
        :key="t.id"
        size="x-small"
        class="ma-1"
        color="secondary"
        text-color="onSecondary"
      >
        {{ t.name }}
      </v-chip>
    </template>

    <template #item.t_date="{ item }">
      {{ item.t_date || '' }}
    </template>

    <template #item.note="{ item }">
      {{ item.note || '' }}
    </template>

    <template #item.actions="{ item }">
      <v-btn icon size="small" @click="$emit('edit', item.id)">
        <v-icon>mdi-pencil</v-icon>
      </v-btn>
      <v-btn icon size="small" @click="confirmDelete(item)">
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
        <p>Are you sure you want to delete this transaction?</p>
        <v-card variant="outlined" class="mt-3 pa-3" color="grey-lighten-3">
          <div class="d-flex align-center mb-2">
            <span class="font-weight-medium">Date:</span>
            <span class="ml-2">{{ transactionToDelete?.t_date || '' }}</span>
          </div>
          <div class="d-flex align-center mb-2">
            <span class="font-weight-medium">Amount:</span>
            <span
              class="ml-2"
              :class="(transactionToDelete?.amount_pence || 0) < 0 ? 'text-error' : 'text-success'"
            >
              {{ transactionToDelete ? money(transactionToDelete.amount_pence || 0) : '' }}
            </span>
          </div>
          <div v-if="transactionToDelete?.note" class="d-flex align-start">
            <span class="font-weight-medium">Note:</span>
            <span class="ml-2">{{ transactionToDelete.note }}</span>
          </div>
          <div v-if="transactionToDelete?.tags?.length" class="d-flex align-start mt-2">
            <span class="font-weight-medium">Tags:</span>
            <div class="ml-2">
              <v-chip
                v-for="tag in transactionToDelete.tags"
                :key="tag.id"
                size="x-small"
                class="ma-1"
                color="secondary"
                text-color="onSecondary"
              >
                {{ tag.name }}
              </v-chip>
            </div>
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
  import { computed, ref } from 'vue'
  import { useMoneyFormat } from '../composables/useMoneyFormat'
  import type { Transaction } from '../stores/transactions'

  const props = defineProps<{
    items: Transaction[]
    loading?: boolean
    page?: number
    itemsPerPage?: number
    total?: number
  }>()

  const emit = defineEmits<{
    (e: 'edit', id: number): void
    (e: 'delete', id: number): void
    (e: 'page-change', payload: { page: number; itemsPerPage: number }): void
  }>()

  const money = useMoneyFormat()

  // Delete confirmation dialog state
  const deleteDialog = ref(false)
  const transactionToDelete = ref<Transaction | null>(null)
  const deleting = ref(false)

  const headers = [
    { title: 'Date', value: 't_date', sortable: true },
    { title: 'Note', value: 'note', sortable: false },
    { title: 'Tags', value: 'tags', sortable: false },
    { title: 'Amount', value: 'amount_pence', sortable: true, align: 'end' as const },
    { title: '', value: 'actions', sortable: false, align: 'end' as const },
  ]

  const computedTotal = computed(() => props.total ?? props.items.length)

  function onOptions({ page, itemsPerPage }: { page: number; itemsPerPage: number }) {
    emit('page-change', { page, itemsPerPage })
  }

  function confirmDelete(transaction: Transaction) {
    transactionToDelete.value = transaction
    deleteDialog.value = true
  }

  async function handleDelete() {
    if (!transactionToDelete.value) return

    deleting.value = true
    try {
      emit('delete', transactionToDelete.value.id)
      deleteDialog.value = false
      transactionToDelete.value = null
    } finally {
      deleting.value = false
    }
  }
</script>
