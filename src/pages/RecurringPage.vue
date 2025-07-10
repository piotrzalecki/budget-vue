<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 mb-4">Recurring Transactions</h1>
      </v-col>
    </v-row>

    <!-- Filter Controls -->
    <v-row>
      <v-col cols="12" md="4">
        <v-select
          v-model="filterType"
          :items="filterOptions"
          label="Filter"
          variant="outlined"
          density="compact"
          @update:model-value="handleFilterChange"
        />
      </v-col>
      <v-col cols="12" md="4" v-if="filterType === 'due'">
        <v-text-field
          v-model="dueDate"
          label="Due Date"
          type="date"
          variant="outlined"
          density="compact"
          @update:model-value="handleFilterChange"
        />
      </v-col>
      <v-col cols="12" md="4">
        <v-btn
          variant="outlined"
          @click="handleRefresh"
          :loading="recurringStore.loading"
          prepend-icon="mdi-refresh"
        >
          Refresh
        </v-btn>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12">
        <RecurringTable
          :items="recurringStore.list"
          :loading="recurringStore.loading"
          @edit="handleEdit"
          @toggle="handleToggle"
          @delete="handleDelete"
        />
      </v-col>
    </v-row>

    <!-- Floating Action Button -->
    <v-btn
      color="primary"
      icon="mdi-plus"
      size="large"
      class="fab"
      elevation="8"
      @click="handleAdd"
    />

    <!-- Form Drawer -->
    <RecurringFormDrawer
      :open="drawerOpen"
      :edit-id="editId"
      :saving="saving"
      @save="handleSave"
      @close="handleClose"
    />
  </v-container>
</template>

<script setup lang="ts">
  import { onMounted, ref } from 'vue'
  import RecurringFormDrawer from '../components/RecurringFormDrawer.vue'
  import RecurringTable from '../components/RecurringTable.vue'
  import { useApi } from '../composables/useApi'
  import { useSnackbar } from '../composables/useSnackbar'
  import { useRecurringStore } from '../stores/recurring'

  const recurringStore = useRecurringStore()
  const api = useApi()
  const { push: showSnackbar } = useSnackbar()

  const drawerOpen = ref(false)
  const editId = ref<number | null>(null)
  const saving = ref(false)
  const filterType = ref('all')
  const dueDate = ref(new Date().toISOString().slice(0, 10))

  const filterOptions = [
    { title: 'All Transactions', value: 'all' },
    { title: 'Active Only', value: 'active' },
    { title: 'Due on Date', value: 'due' },
  ]

  onMounted(() => {
    recurringStore.fetch()
  })

  function handleFilterChange() {
    switch (filterType.value) {
      case 'all':
        recurringStore.fetch()
        break
      case 'active':
        recurringStore.fetchActive()
        break
      case 'due':
        recurringStore.fetchDue(dueDate.value)
        break
    }
  }

  function handleRefresh() {
    handleFilterChange()
  }

  function handleAdd() {
    editId.value = null
    drawerOpen.value = true
  }

  function handleEdit(id: number) {
    editId.value = id
    drawerOpen.value = true
  }

  function handleClose() {
    drawerOpen.value = false
    editId.value = null
  }

  async function handleToggle(id: number, newState: boolean) {
    try {
      await recurringStore.toggle(id)
      showSnackbar(`Recurring transaction ${newState ? 'activated' : 'deactivated'}`, 'success')
    } catch (error) {
      showSnackbar('Failed to update status', 'error')
    }
  }

  async function handleDelete(id: number) {
    try {
      await recurringStore.remove(id)
      showSnackbar('Recurring transaction deleted successfully', 'success')
    } catch (error) {
      showSnackbar('Failed to delete recurring transaction', 'error')
    }
  }

  async function handleSave(payload: {
    amount: string
    description: string
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly'
    interval_n: number
    first_due_date: string
    end_date?: string
    tag_ids: number[]
  }) {
    saving.value = true
    try {
      if (editId.value) {
        await recurringStore.update(editId.value, payload)
        showSnackbar('Recurring transaction updated successfully', 'success')
      } else {
        await recurringStore.add(payload)
        showSnackbar('Recurring transaction created successfully', 'success')
      }
      handleClose()
    } catch (error) {
      showSnackbar('Failed to save recurring transaction', 'error')
    } finally {
      saving.value = false
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
