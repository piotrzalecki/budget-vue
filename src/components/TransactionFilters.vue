<template>
  <v-card class="mb-4">
    <v-card-text>
      <v-row>
        <!-- Date Range Filters -->
        <v-col cols="12" sm="6" md="3">
          <v-text-field
            v-model="localFilters.from"
            type="date"
            label="From Date"
            variant="outlined"
            density="compact"
            hide-details
            @update:model-value="onFiltersChange"
          />
        </v-col>
        <v-col cols="12" sm="6" md="3">
          <v-text-field
            v-model="localFilters.to"
            type="date"
            label="To Date"
            variant="outlined"
            density="compact"
            hide-details
            @update:model-value="onFiltersChange"
          />
        </v-col>

        <!-- Tag Filter -->
        <v-col cols="12" sm="6" md="3">
          <TagMultiSelect
            v-model="localFilters.tagIds"
            label="Tags"
            placeholder="Filter by tags..."
            density="compact"
            hide-details
            @update:model-value="onFiltersChange"
          />
        </v-col>

        <!-- Search Filter -->
        <v-col cols="12" sm="6" md="3">
          <v-text-field
            v-model="localFilters.search"
            label="Search Notes"
            variant="outlined"
            density="compact"
            hide-details
            prepend-inner-icon="mdi-magnify"
            clearable
            @update:model-value="onFiltersChange"
          />
        </v-col>
      </v-row>

      <!-- Quick Date Presets -->
      <v-row class="mt-2">
        <v-col cols="12">
          <v-chip-group>
            <v-chip
              v-for="preset in datePresets"
              :key="preset.label"
              size="small"
              variant="outlined"
              @click="applyDatePreset(preset)"
            >
              {{ preset.label }}
            </v-chip>
          </v-chip-group>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
  import { computed, ref, watch } from 'vue'
  import TagMultiSelect from './forms/TagMultiSelect.vue'

  interface Filters {
    from: string
    to: string
    tagIds: number[]
    search: string
  }

  interface Props {
    modelValue: Filters
  }

  const props = defineProps<Props>()

  const emit = defineEmits<{
    (e: 'update:modelValue', value: Filters): void
  }>()

  const localFilters = ref<Filters>({
    from: '',
    to: '',
    tagIds: [],
    search: '',
  })

  // Sync with parent
  watch(
    () => props.modelValue,
    newFilters => {
      localFilters.value = { ...newFilters }
    },
    { immediate: true, deep: true }
  )

  const onFiltersChange = () => {
    emit('update:modelValue', { ...localFilters.value })
  }

  // Date presets
  const datePresets = computed(() => {
    const today = new Date()
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)
    const startOfYear = new Date(today.getFullYear(), 0, 1)
    const endOfYear = new Date(today.getFullYear(), 11, 31)

    return [
      {
        label: 'This Month',
        from: startOfMonth.toISOString().split('T')[0],
        to: endOfMonth.toISOString().split('T')[0],
      },
      {
        label: 'This Year',
        from: startOfYear.toISOString().split('T')[0],
        to: endOfYear.toISOString().split('T')[0],
      },
      {
        label: 'Last 30 Days',
        from: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        to: today.toISOString().split('T')[0],
      },
      {
        label: 'Clear',
        from: '',
        to: '',
      },
    ]
  })

  const applyDatePreset = (preset: { from: string; to: string }) => {
    localFilters.value.from = preset.from
    localFilters.value.to = preset.to
    onFiltersChange()
  }
</script>
