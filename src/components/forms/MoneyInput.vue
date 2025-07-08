<template>
  <v-text-field
    :model-value="inputValue"
    :error-messages="errorMessages"
    :label="label"
    :placeholder="placeholder"
    variant="outlined"
    prepend-inner-icon="mdi-currency-gbp"
    type="text"
    @input="onInput"
    @blur="onBlur"
    @focus="onFocus"
  />
</template>

<script setup lang="ts">
  import { ref, watch } from 'vue'

  interface Props {
    modelValue: number // pence
    label?: string
    placeholder?: string
    errorMessages?: string | string[]
  }

  const props = withDefaults(defineProps<Props>(), {
    label: 'Amount',
    placeholder: '0.00',
    errorMessages: undefined,
  })

  const emit = defineEmits<{
    (e: 'update:modelValue', value: number): void
  }>()

  // Track the raw input value separately from the formatted display
  const inputValue = ref('')
  const isFocused = ref(false)

  // Initialize input value when component mounts or modelValue changes externally
  watch(
    () => props.modelValue,
    newValue => {
      if (!isFocused.value && newValue > 0) {
        inputValue.value = (newValue / 100).toFixed(2)
      } else if (!isFocused.value && newValue === 0) {
        inputValue.value = ''
      }
    },
    { immediate: true }
  )

  const onInput = (event: Event) => {
    const target = event.target as HTMLInputElement
    const rawValue = target.value

    // Allow only numbers, decimal point, and backspace
    const cleanValue = rawValue.replace(/[^0-9.]/g, '')

    // Ensure only one decimal point
    const parts = cleanValue.split('.')
    if (parts.length > 2) {
      const beforeDecimal = parts[0]
      const afterDecimal = parts.slice(1).join('')
      inputValue.value = `${beforeDecimal}.${afterDecimal}`
    } else {
      inputValue.value = cleanValue
    }

    // Convert to pence and emit
    const value = parseFloat(inputValue.value) || 0
    const pence = Math.round(value * 100)
    emit('update:modelValue', pence)
  }

  const onFocus = () => {
    isFocused.value = true
    // If the field is empty, don't show anything
    if (props.modelValue === 0) {
      inputValue.value = ''
    }
  }

  const onBlur = () => {
    isFocused.value = false
    // Format the value on blur
    const value = parseFloat(inputValue.value) || 0
    if (value > 0) {
      inputValue.value = value.toFixed(2)
    } else {
      inputValue.value = ''
    }
  }
</script>
