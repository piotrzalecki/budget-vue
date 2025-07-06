<template>
  <v-container class="fill-height">
    <v-row justify="center" align="center">
      <v-col cols="12" sm="8" md="6" lg="4">
        <v-card class="text-center">
          <v-card-title class="text-h4"> 404 </v-card-title>
          <v-card-text>
            <p class="text-h6 mb-4">Page Not Found</p>
            <p class="text-muted">The page you're looking for doesn't exist.</p>
          </v-card-text>
          <v-card-actions class="justify-center pb-4">
            <v-btn color="primary" @click="$router.push('/dashboard')"> Go to Dashboard </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
// 404 page logic
</script>
