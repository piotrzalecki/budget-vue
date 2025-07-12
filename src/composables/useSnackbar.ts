import { reactive, toRefs } from 'vue'

type Level = 'success' | 'error' | 'info' | 'warning'

interface SnackState {
  show: boolean
  msg: string
  color: Level
  queue: { msg: string; color: Level }[]
  timeout: number
}

const state: SnackState = reactive({
  show: false,
  msg: '',
  color: 'info',
  queue: [],
  timeout: 3000,
})

function next() {
  if (state.queue.length && !state.show) {
    const { msg, color } = state.queue.shift()!
    state.msg = msg
    state.color = color
    state.show = true
  }
}

export function useSnackbar() {
  /** Push a new toast */
  function push(msg: string, color: Level = 'info', timeout = 3000) {
    state.queue.push({ msg, color })
    state.timeout = timeout
    next()
  }

  /** Call in <v-snackbar @update:show> to pop current and show next */
  function onHide() {
    state.show = false
    next()
  }

  return { ...toRefs(state), push, onHide }
}
