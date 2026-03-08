<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 mb-4">Users</h1>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-text>
            <UserTable
              :items="usersStore.list"
              :loading="usersStore.loading"
              :current-user-id="sessionStore.userId"
              @edit="onEdit"
              @delete="onDelete"
            />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Floating Action Button -->
    <v-btn
      color="primary"
      icon="mdi-plus"
      size="large"
      class="fab"
      elevation="8"
      @click="openAddDialog"
    />

    <!-- Add/Edit User Dialog -->
    <UserFormDialog v-model="showDialog" :user="editingUser" @save="handleSave" />
  </v-container>
</template>

<script setup lang="ts">
  import { onMounted, ref } from 'vue'
  import UserFormDialog from '../components/UserFormDialog.vue'
  import UserTable from '../components/UserTable.vue'
  import { useSnackbar } from '../composables/useSnackbar'
  import { useSessionStore } from '../stores/session'
  import type { User } from '../stores/users'
  import { useUsersStore } from '../stores/users'

  const usersStore = useUsersStore()
  const sessionStore = useSessionStore()
  const snack = useSnackbar()

  const showDialog = ref(false)
  const editingUser = ref<User | null>(null)

  onMounted(async () => {
    try {
      await usersStore.fetch()
    } catch {
      snack.push('Failed to load users', 'error', 5000)
    }
  })

  function openAddDialog() {
    editingUser.value = null
    showDialog.value = true
  }

  function onEdit(id: number) {
    const user = usersStore.list.find(u => u.id === id) ?? null
    editingUser.value = user
    showDialog.value = true
  }

  async function onDelete(id: number) {
    try {
      await usersStore.remove(id)
      snack.push('User deleted successfully', 'success')
    } catch (err: any) {
      snack.push(err.message || 'Failed to delete user', 'error', 5000)
    }
  }

  async function handleSave(data: { email: string; password?: string; is_service: boolean }) {
    try {
      if (editingUser.value) {
        await usersStore.update(editingUser.value.id, data)
        snack.push('User updated successfully', 'success')
      } else {
        await usersStore.add({ email: data.email, password: data.password!, is_service: data.is_service })
        snack.push('User added successfully', 'success')
      }
    } catch (err: any) {
      snack.push(err.message || 'Failed to save user', 'error', 5000)
    }
  }
</script>

<style scoped>
  .fab {
    position: fixed;
    bottom: 24px;
    right: 24px;
    z-index: 1000;
  }

  @media (max-width: 600px) {
    .fab {
      bottom: 16px;
      right: 16px;
    }
  }
</style>
