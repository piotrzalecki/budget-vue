<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 mb-4">Transactions</h1>
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
  </v-container>
</template>

<script setup lang="ts">
  import TransactionTable from '@/components/TransactionTable.vue'
  import { useTransactionsStore } from '@/stores/transactions'
  import { onMounted, ref } from 'vue'

  const transactionsStore = useTransactionsStore()
  const page = ref(1)
  const itemsPerPage = ref(50)

  onMounted(() => {
    transactionsStore.fetch()
  })

  function onEdit(id: number) {
    // Open edit drawer (to be implemented)
    // e.g. emit('open-edit', id) or set a local state
    // For now, just log
    console.log('Edit transaction', id)
  }

  function onDelete(id: number) {
    // Soft delete
    transactionsStore.softDelete(id)
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
