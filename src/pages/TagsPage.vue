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
            <TagTable
              :items="tagsStore.list"
              :loading="tagsStore.loading"
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

    <!-- Add/Edit Tag Dialog -->
    <TagFormDialog v-model="showDialog" :tag="editingTag" @save="handleSave" />
  </v-container>
</template>

<script setup lang="ts">
  import { onMounted, ref } from 'vue'
  import TagFormDialog from '../components/TagFormDialog.vue'
  import TagTable from '../components/TagTable.vue'
  import { useSnackbar } from '../composables/useSnackbar'
  import type { Tag } from '../stores/tags'
  import { useTagsStore } from '../stores/tags'

  const tagsStore = useTagsStore()
  const snack = useSnackbar()

  const showDialog = ref(false)
  const editingTag = ref<Tag | null>(null)

  onMounted(async () => {
    try {
      await tagsStore.fetch()
    } catch {
      snack.push('Failed to load tags', 'error', 5000)
    }
  })

  function openAddDialog() {
    editingTag.value = null
    showDialog.value = true
  }

  function onEdit(id: number) {
    const tag = tagsStore.list.find(t => t.id === id) ?? null
    editingTag.value = tag
    showDialog.value = true
  }

  async function onDelete(id: number) {
    try {
      await tagsStore.remove(id)
      snack.push('Tag deleted successfully', 'success')
    } catch (err: any) {
      snack.push(err.message || 'Failed to delete tag', 'error', 5000)
    }
  }

  async function handleSave(name: string) {
    try {
      if (editingTag.value) {
        await tagsStore.update(editingTag.value.id, { name })
        snack.push('Tag updated successfully', 'success')
      } else {
        await tagsStore.add({ name })
        snack.push('Tag added successfully', 'success')
      }
    } catch (err: any) {
      snack.push(err.message || 'Failed to save tag', 'error', 5000)
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
