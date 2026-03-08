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

    <template #item.actions="{ item }">
      <v-btn icon size="small" @click="$emit('edit', item.id)">
        <v-icon>mdi-pencil</v-icon>
      </v-btn>
      <v-btn icon size="small" @click="confirmDelete(item)">
        <v-icon color="error">mdi-delete</v-icon>
      </v-btn>
    </template>
  </v-data-table>

  <!-- Delete Confirmation Dialog -->
  <v-dialog v-model="deleteDialog" max-width="400">
    <v-card>
      <v-card-title class="text-h6">
        <v-icon color="error" class="mr-2">mdi-alert-circle</v-icon>
        Confirm Delete
      </v-card-title>
      <v-card-text>
        <p>Are you sure you want to delete the tag <strong>{{ tagToDelete?.name }}</strong>?</p>
      </v-card-text>
      <v-card-actions class="justify-end">
        <v-btn variant="text" @click="deleteDialog = false">Cancel</v-btn>
        <v-btn color="error" variant="elevated" @click="handleDelete" :loading="deleting">
          Delete
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import type { Tag } from '../stores/tags'

  defineProps<{
    items: Tag[]
    loading?: boolean
  }>()

  const emit = defineEmits<{
    (e: 'edit', id: number): void
    (e: 'delete', id: number): void
  }>()

  const deleteDialog = ref(false)
  const tagToDelete = ref<Tag | null>(null)
  const deleting = ref(false)

  const headers = [
    { title: 'Name', value: 'name', sortable: true },
    { title: '', value: 'actions', sortable: false, align: 'end' as const },
  ]

  function confirmDelete(tag: Tag) {
    tagToDelete.value = tag
    deleteDialog.value = true
  }

  async function handleDelete() {
    if (!tagToDelete.value) return
    deleting.value = true
    try {
      emit('delete', tagToDelete.value.id)
      deleteDialog.value = false
      tagToDelete.value = null
    } finally {
      deleting.value = false
    }
  }
</script>
