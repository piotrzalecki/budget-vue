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
  </v-container>
</template>

<script setup lang="ts">
  import { onMounted, ref } from 'vue'
  import TagFormDialog from '../components/TagFormDialog.vue'
  import TagTable from '../components/TagTable.vue'
  import { useSnackbar } from '../composables/useSnackbar'
  import { useTagsStore } from '../stores/tags'

  const tagsStore = useTagsStore()
  const snack = useSnackbar()

  // Dialog state
  const showDialog = ref(false)

  onMounted(async () => {
    try {
      await tagsStore.fetch()
    } catch (error) {
      snack.push('Failed to load tags', 'error', 5000)
    }
  })

  function openAddDialog() {
    showDialog.value = true
  }

  async function handleSave(name: string) {
    try {
      await tagsStore.add({ name })
      snack.push('Tag added successfully', 'success')
    } catch (error: any) {
      snack.push(error.message || 'Failed to save tag', 'error', 5000)
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
