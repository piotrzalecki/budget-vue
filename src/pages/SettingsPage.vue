<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 mb-4">Settings</h1>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>Payday Configuration</v-card-title>
          <v-card-text>
            <v-form @submit.prevent="saveSettings">
              <v-text-field
                v-model.number="paydayDom"
                type="number"
                label="Payday Day of Month"
                hint="Enter the day of the month you get paid (1-31)"
                min="1"
                max="31"
                :rules="[v => (v >= 1 && v <= 31) || 'Must be between 1 and 31']"
              />
              <v-btn
                color="primary"
                type="submit"
                :disabled="!paydayDom || paydayDom < 1 || paydayDom > 31"
                class="mt-4"
              >
                Save Settings
              </v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>Dashboard Preview</v-card-title>
          <v-card-text>
            <div class="d-flex align-center">
              <v-icon class="mr-2" color="primary">mdi-calendar-clock</v-icon>
              <div>
                <div class="text-caption text-muted">Days until payday</div>
                <div class="text-h6 text-primary">{{ daysUntilPayday }}</div>
              </div>
            </div>
            <v-alert v-if="daysUntilPayday < 5" type="warning" class="mt-4" variant="tonal">
              Less than 5 days until payday!
            </v-alert>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
  import { useSnackbar } from '@/composables/useSnackbar'
  import { useSettingsStore } from '@/stores/settings'
  import { computed, onMounted, ref } from 'vue'

  const settingsStore = useSettingsStore()
  const snack = useSnackbar()

  const paydayDom = ref(25)
  const daysUntilPayday = computed(() => settingsStore.getDaysUntilPayday())

  const saveSettings = () => {
    settingsStore.setPaydayDom(paydayDom.value)
    snack.push('Settings saved successfully', 'success')
  }

  onMounted(() => {
    settingsStore.loadFromStorage()
    paydayDom.value = settingsStore.paydayDom
  })
</script>
