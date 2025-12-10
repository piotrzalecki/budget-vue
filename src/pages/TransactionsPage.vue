<template>
  <v-container>
    <!-- Page Header -->
    <v-row>
      <v-col cols="12" class="d-flex align-center">
        <h1 class="text-h4 mb-4">Transactions</h1>
      </v-col>
    </v-row>

    <!-- Filters -->
    <TransactionFilters v-model="transactionsStore.filters" @update:model-value="onFiltersChange" />

    <!-- Table -->
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-text>
            <TransactionTable
              :items="transactionsStore.list"
              :loading="transactionsStore.loading"
              :page="page"
              :items-per-page="itemsPerPage"
              :total="transactionsStore.list.length"
              @edit="onEdit"
              @delete="onDelete"
              @page-change="onPageChange"
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
      @click="openAddDrawer"
    />

    <!-- Transaction Form Drawer -->
    <TransactionFormDrawer
      :open="drawerOpen"
      :edit-id="editingId"
      :saving="saving"
      @save="onSave"
      @close="closeDrawer"
    />
  </v-container>
</template>

<script setup lang="ts">
  import { onMounted, ref } from 'vue'
  import TransactionFilters from '../components/TransactionFilters.vue'
  import TransactionFormDrawer from '../components/TransactionFormDrawer.vue'
  import TransactionTable from '../components/TransactionTable.vue'
  import { useSnackbar } from '../composables/useSnackbar'
  import { useTransactionsStore } from '../stores/transactions'

  const transactionsStore = useTransactionsStore()
  const snack = useSnackbar()
  const page = ref(1)
  const itemsPerPage = ref(50)
  const drawerOpen = ref(false)
  const editingId = ref<number | null>(null)
  const saving = ref(false)

  onMounted(() => {
    transactionsStore.fetchWithFilters()
  })

  function onFiltersChange() {
    transactionsStore.fetchWithFilters()
  }

  function openAddDrawer() {
    editingId.value = null
    drawerOpen.value = true
  }

  function onEdit(id: number) {
    editingId.value = id
    drawerOpen.value = true
  }

  async function onDelete(id: number) {
    try {
      // Soft delete
      await transactionsStore.softDelete(id)
      snack.push('Transaction deleted successfully', 'success')
    } catch (error) {
      snack.push('Failed to delete transaction', 'error')
    }
  }

  async function onSave(payload: {
    amount_pence: number
    t_date: string
    tag_ids: number[]
    note: string
  }) {
    saving.value = true
    try {
      if (editingId.value !== null) {
        // Update existing transaction
        await transactionsStore.update(editingId.value, payload)
        snack.push('Transaction updated successfully', 'success')
      } else {
        // Add new transaction
        await transactionsStore.add(payload)
        snack.push('Transaction added successfully', 'success')
      }
      // Close drawer after the store operations complete
      closeDrawer()
    } catch (error) {
      snack.push('Failed to save transaction', 'error')
    } finally {
      saving.value = false
    }
  }

  function closeDrawer() {
    drawerOpen.value = false
    editingId.value = null
  }

  function onPageChange({
    page: newPage,
    itemsPerPage: newItemsPerPage,
  }: {
    page: number
    itemsPerPage: number
  }) {
    page.value = newPage
    itemsPerPage.value = newItemsPerPage
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
