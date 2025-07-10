<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 mb-4">Tags</h1>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-text>
            <TagTable :items="tagsStore.list" :loading="tagsStore.loading" />
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

    <!-- Add Tag Dialog -->
    <TagFormDialog v-model="showDialog" @save="handleSave" />

    <!-- Global Snackbar -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" :timeout="snackbar.timeout">
      {{ snackbar.text }}
      <template #actions>
        <v-btn variant="text" @click="snackbar.show = false">Close</v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
  import { onMounted, ref } from 'vue'
  import TagFormDialog from '../components/TagFormDialog.vue'
  import TagTable from '../components/TagTable.vue'
  import { useSnackbar } from '../composables/useSnackbar'
  import { useTagsStore } from '../stores/tags'

  const tagsStore = useTagsStore()
  const { push } = useSnackbar()

  // Dialog state
  const showDialog = ref(false)

  // Snackbar state
  const snackbar = ref({
    show: false,
    text: '',
    color: 'success',
    timeout: 3000,
  })

  onMounted(async () => {
    try {
      await tagsStore.fetch()
    } catch (error) {
      showError('Failed to load tags')
    }
  })

  function openAddDialog() {
    showDialog.value = true
  }

  async function handleSave(name: string) {
    try {
      await tagsStore.add({ name })
      showSuccess('Tag added successfully')
    } catch (error: any) {
      showError(error.message || 'Failed to save tag')
    }
  }

  function showSuccess(message: string) {
    snackbar.value = {
      show: true,
      text: message,
      color: 'success',
      timeout: 3000,
    }
  }

  function showError(message: string) {
    snackbar.value = {
      show: true,
      text: message,
      color: 'error',
      timeout: 5000,
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
