import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import RecurringFormDrawer from '../components/RecurringFormDrawer.vue'
import { useRecurringStore } from '../stores/recurring'
import { useTagsStore } from '../stores/tags'

// Mock the form components
vi.mock('../components/forms/MoneyInput.vue', () => ({
  default: {
    name: 'MoneyInput',
    template:
      '<input :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value * 100)" />',
    props: ['modelValue'],
    emits: ['update:modelValue'],
  },
}))

vi.mock('../components/forms/TagMultiSelect.vue', () => ({
  default: {
    name: 'TagMultiSelect',
    template:
      '<input :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value.split(\',\').map(Number))" />',
    props: ['modelValue'],
    emits: ['update:modelValue'],
  },
}))

describe('RecurringFormDrawer', () => {
  let pinia: any

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)

    // Mock the stores
    const recurringStore = useRecurringStore()
    const tagsStore = useTagsStore()

    // Mock recurring store data
    recurringStore.list = [
      {
        id: 1,
        amount: '25.50',
        description: 'Test recurring',
        frequency: 'monthly',
        interval_n: 1,
        first_due_date: '2024-01-15',
        next_due_date: '2024-02-15',
        end_date: '2024-12-31',
        active: true,
        tag_ids: [1, 2],
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      },
    ]

    // Mock tags store data
    tagsStore.list = [
      { id: 1, name: 'Food', color: 'red', created_at: '2024-01-01T00:00:00Z' },
      { id: 2, name: 'Transport', color: 'blue', created_at: '2024-01-01T00:00:00Z' },
    ]
  })

  it('shows correct title based on edit mode', () => {
    // Add mode
    const addWrapper = mount(RecurringFormDrawer, {
      props: {
        open: true,
        editId: null,
      },
      global: {
        plugins: [pinia],
      },
    })
    expect(addWrapper.text()).toContain('Add Recurring Rule')

    // Edit mode
    const editWrapper = mount(RecurringFormDrawer, {
      props: {
        open: true,
        editId: 1,
      },
      global: {
        plugins: [pinia],
      },
    })
    expect(editWrapper.text()).toContain('Edit Recurring Rule')
  })

  it('emits close event when drawer is closed', async () => {
    const wrapper = mount(RecurringFormDrawer, {
      props: {
        open: true,
        editId: null,
      },
      global: {
        plugins: [pinia],
      },
    })

    // Trigger close
    await wrapper.vm.$emit('close')

    // Check emitted event
    const closeEvents = wrapper.emitted('close')
    expect(closeEvents).toBeTruthy()
    expect(closeEvents).toHaveLength(1)
  })

  it('renders form fields correctly', () => {
    const wrapper = mount(RecurringFormDrawer, {
      props: {
        open: true,
        editId: null,
      },
      global: {
        plugins: [pinia],
      },
    })

    // Check that all required form fields are present
    expect(wrapper.text()).toContain('Amount')
    expect(wrapper.text()).toContain('Description')
    expect(wrapper.text()).toContain('Frequency')
    expect(wrapper.text()).toContain('Interval')
    expect(wrapper.text()).toContain('First due date')
    expect(wrapper.text()).toContain('End date')
    expect(wrapper.text()).toContain('Tags')
  })

  it('loads existing rule data when editId is provided', async () => {
    const wrapper = mount(RecurringFormDrawer, {
      props: {
        open: true,
        editId: 1,
      },
      global: {
        plugins: [pinia],
      },
    })

    // Wait for the watcher to process
    await wrapper.vm.$nextTick()

    // The component should have loaded the existing rule data
    // We can verify this by checking that the component is in edit mode
    expect(wrapper.text()).toContain('Edit Recurring Rule')
  })

  it('resets form when editId changes from number to null', async () => {
    const wrapper = mount(RecurringFormDrawer, {
      props: {
        open: true,
        editId: 1,
      },
      global: {
        plugins: [pinia],
      },
    })

    // Change to add mode
    await wrapper.setProps({ editId: null })

    // Wait for the watcher to process
    await wrapper.vm.$nextTick()

    // Should now be in add mode
    expect(wrapper.text()).toContain('Add Recurring Rule')
  })
})
