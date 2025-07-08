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
      <span :class="item.amount_pence < 0 ? 'text-error' : 'text-success'">
        {{ money(item.amount_pence) }}
      </span>
    </template>

    <template #item.tags="{ item }">
      <v-chip
        v-for="t in item.tags"
        :key="t.id"
        size="x-small"
        class="ma-1"
        color="secondary"
        text-color="onSecondary"
      >
        {{ t.name }}
      </v-chip>
    </template>

    <template #item.actions="{ item }">
      <v-btn icon size="small" @click="$emit('edit', item.id)">
        <v-icon>mdi-pencil</v-icon>
      </v-btn>
      <v-btn icon size="small" @click="$emit('delete', item.id)">
        <v-icon color="error">mdi-delete</v-icon>
      </v-btn>
    </template>
  </v-data-table>

  <v-progress-linear v-if="loading" indeterminate color="primary" />
</template>

<script setup lang="ts">
  import { computed } from 'vue'
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
</script>
