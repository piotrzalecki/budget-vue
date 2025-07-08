<template>
  <v-container>
    <v-row>
      <v-col cols="12" class="d-flex align-center">
        <h1 class="text-h4 mb-4">Transactions</h1>
        <v-spacer />
        <v-btn color="primary" prepend-icon="mdi-plus" @click="openAddDrawer">
          Add Transaction
        </v-btn>
      </v-col>
    </v-row>
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
  import TransactionFormDrawer from '../components/TransactionFormDrawer.vue'
  import TransactionTable from '../components/TransactionTable.vue'
  import { useSnackbar } from '../composables/useSnackbar'
  import { useTransactionsStore } from '../stores/transactions'

  const transactionsStore = useTransactionsStore()
  const { showSnackbar } = useSnackbar()
  const page = ref(1)
  const itemsPerPage = ref(50)
  const drawerOpen = ref(false)
  const editingId = ref<number | null>(null)
  const saving = ref(false)

  onMounted(() => {
    transactionsStore.fetch()
  })

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
      showSnackbar({ text: 'Transaction deleted successfully' })
    } catch (error) {
      console.error('Delete error:', error)
      showSnackbar({ text: 'Failed to delete transaction', color: 'error' })
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
        showSnackbar({ text: 'Transaction updated successfully' })
      } else {
        // Add new transaction
        await transactionsStore.add(payload)
        showSnackbar({ text: 'Transaction added successfully' })
      }
      // Close drawer after the store operations complete
      closeDrawer()
    } catch (error) {
      console.error('Save error:', error)
      showSnackbar({ text: 'Failed to save transaction', color: 'error' })
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
