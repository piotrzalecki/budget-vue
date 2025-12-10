<template>
  <v-data-table
    :items="items"
    :headers="headers"
    :loading="loading"
    density="compact"
    class="elevation-1 rounded"
  >
    <template #item.name="{ item }">
      <span>{{ item.name }}</span>
    </template>
  </v-data-table>
</template>

<script setup lang="ts">
  import type { Tag } from '../stores/tags'

  const props = defineProps<{
    items: Tag[]
    loading?: boolean
  }>()

  const headers = [{ title: 'Name', value: 'name', sortable: true }]
</script>
