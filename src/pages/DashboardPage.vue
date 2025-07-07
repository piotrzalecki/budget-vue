<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 mb-4">Dashboard</h1>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>Spend by Tag</v-card-title>
          <v-card-text>
            <div style="height: 260px; display: flex; align-items: center; justify-content: center">
              <p class="text-muted">Pie chart will be implemented here</p>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>Net Cash Flow</v-card-title>
          <v-card-text>
            <div style="height: 240px; display: flex; align-items: center; justify-content: center">
              <p class="text-muted">Bar chart will be implemented here</p>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
  // Dashboard logic will be implemented here
</script>
