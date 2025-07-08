<template>
  <v-combobox
    v-model="selectedTags"
    :items="tagsList"
    :loading="tagsStore.loading"
    :label="label"
    :placeholder="placeholder"
    :error-messages="errorMessages"
    variant="outlined"
    multiple
    chips
    closable-chips
    item-title="name"
    item-value="id"
    @update:model-value="onUpdate"
  >
    <template #chip="{ props, item }">
      <v-chip v-bind="props" :color="item.raw.color || 'secondary'" size="small">
        {{ item.raw.name }}
      </v-chip>
    </template>
  </v-combobox>
</template>

<script setup lang="ts">
  import { computed, onMounted } from 'vue'
  import type { Tag } from '../../stores/tags'
  import { useTagsStore } from '../../stores/tags'

  interface Props {
    modelValue: number[] // tag IDs
    label?: string
    placeholder?: string
    errorMessages?: string | string[]
  }

  const props = withDefaults(defineProps<Props>(), {
    label: 'Tags',
    placeholder: 'Select tags...',
    errorMessages: undefined,
  })

  const emit = defineEmits<{
    (e: 'update:modelValue', value: number[]): void
  }>()

  const tagsStore = useTagsStore()

  // Ensure tags list is always an array
  const tagsList = computed(() => {
    return Array.isArray(tagsStore.list) ? tagsStore.list : []
  })

  // Convert tag IDs to Tag objects for v-combobox
  const selectedTags = computed({
    get: () => {
      return props.modelValue
        .map(id => tagsStore.list.find(tag => tag.id === id))
        .filter(Boolean) as Tag[]
    },
    set: (tags: Tag[]) => {
      const tagIds = tags.map(tag => tag.id)
      emit('update:modelValue', tagIds)
    },
  })

  const onUpdate = (tags: Tag[]) => {
    const tagIds = tags.map(tag => tag.id)
    emit('update:modelValue', tagIds)
  }

  onMounted(() => {
    // Fetch tags if not already loaded
    if (tagsStore.list.length === 0) {
      tagsStore.fetch()
    }
  })
</script>
