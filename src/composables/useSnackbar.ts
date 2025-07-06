import { ref } from 'vue'

interface SnackbarOptions {
  text: string
  color?: string
  timeout?: number
}

const snackbar = ref({
  show: false,
  text: '',
  color: 'success',
  timeout: 3000,
})

export const useSnackbar = () => {
  const showSnackbar = (options: SnackbarOptions) => {
    snackbar.value = {
      show: true,
      text: options.text,
      color: options.color || 'success',
      timeout: options.timeout || 3000,
    }
  }

  const hideSnackbar = () => {
    snackbar.value.show = false
  }

  return {
    snackbar,
    showSnackbar,
    hideSnackbar,
  }
}
