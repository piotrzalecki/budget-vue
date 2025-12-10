<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 mb-4">Dashboard</h1>
      </v-col>
    </v-row>

    <v-progress-linear v-if="loading" indeterminate color="primary" class="mb-4" />

    <DashboardCharts />
  </v-container>
</template>

<script setup lang="ts">
  import DashboardCharts from '@/components/charts/DashboardCharts.vue'
  import { useReportsStore } from '@/stores/reports'
  import { computed } from 'vue'

  const reportsStore = useReportsStore()
  const loading = computed(() => reportsStore.loading)
</script>
