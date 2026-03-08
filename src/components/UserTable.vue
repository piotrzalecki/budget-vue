<template>
  <v-data-table
    :items="items"
    :headers="headers"
    :loading="loading"
    density="compact"
    class="elevation-1 rounded"
  >
    <template #item.email="{ item }">
      <span>{{ item.email }}</span>
    </template>

    <template #item.is_service="{ item }">
      <v-chip :color="item.is_service ? 'blue' : 'green'" size="small" label>
        {{ item.is_service ? 'Service' : 'Human' }}
      </v-chip>
    </template>

    <template #item.created_at="{ item }">
      {{ formatDate(item.created_at) }}
    </template>

    <template #item.actions="{ item }">
      <v-btn icon size="small" @click="$emit('edit', item.id)">
        <v-icon>mdi-pencil</v-icon>
      </v-btn>
      <span class="d-inline-block">
        <v-tooltip :text="item.id === currentUserId ? 'You cannot delete your own account' : 'Delete'" location="top">
          <template #activator="{ props }">
            <span v-bind="props" class="d-inline-block">
              <v-btn
                icon
                size="small"
                :disabled="item.id === currentUserId"
                @click="confirmDelete(item)"
              >
                <v-icon color="error">mdi-delete</v-icon>
              </v-btn>
            </span>
          </template>
        </v-tooltip>
      </span>
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
        <p>Are you sure you want to delete the user <strong>{{ userToDelete?.email }}</strong>?</p>
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
  import type { User } from '../stores/users'

  defineProps<{
    items: User[]
    loading?: boolean
    currentUserId: number | null
  }>()

  const emit = defineEmits<{
    (e: 'edit', id: number): void
    (e: 'delete', id: number): void
  }>()

  const deleteDialog = ref(false)
  const userToDelete = ref<User | null>(null)
  const deleting = ref(false)

  const headers = [
    { title: 'Email', value: 'email', sortable: true },
    { title: 'Type', value: 'is_service', sortable: true },
    { title: 'Created', value: 'created_at', sortable: true },
    { title: '', value: 'actions', sortable: false, align: 'end' as const },
  ]

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  function confirmDelete(user: User) {
    userToDelete.value = user
    deleteDialog.value = true
  }

  async function handleDelete() {
    if (!userToDelete.value) return
    deleting.value = true
    try {
      emit('delete', userToDelete.value.id)
      deleteDialog.value = false
      userToDelete.value = null
    } finally {
      deleting.value = false
    }
  }
</script>
