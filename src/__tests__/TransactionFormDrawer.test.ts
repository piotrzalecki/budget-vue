import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import TransactionFormDrawer from '../components/TransactionFormDrawer.vue'
import { useTagsStore } from '../stores/tags'
import { useTransactionsStore } from '../stores/transactions'

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
      '<select :value="modelValue" @change="$emit(\'update:modelValue\', Array.from($event.target.selectedOptions, opt => parseInt(opt.value)))" multiple><option v-for="tag in tags" :key="tag.id" :value="tag.id">{{ tag.name }}</option></select>',
    props: ['modelValue'],
    emits: ['update:modelValue'],
  },
}))

describe('TransactionFormDrawer', () => {
  let pinia: any

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)

    // Setup mock stores
    const transactionsStore = useTransactionsStore()
    const tagsStore = useTagsStore()

    // Mock transaction data
    transactionsStore.list = [
      {
        id: 1,
        amount_pence: 1500, // £15.00
        note: 'Test transaction',
        t_date: '2024-01-15',
        tags: [
          { id: 1, name: 'Food', color: 'red', created_at: '2024-01-01' },
          { id: 2, name: 'Transport', color: 'blue', created_at: '2024-01-01' },
        ],
        created_at: '2024-01-15',
        updated_at: '2024-01-15',
      },
    ]

    // Mock tags data
    tagsStore.list = [
      { id: 1, name: 'Food', color: 'red', created_at: '2024-01-01' },
      { id: 2, name: 'Transport', color: 'blue', created_at: '2024-01-01' },
      { id: 3, name: 'Entertainment', color: 'green', created_at: '2024-01-01' },
    ]
  })

  it('renders correct initial values in edit mode', async () => {
    const wrapper = mount(TransactionFormDrawer, {
      props: {
        open: true,
        editId: 1,
      },
      global: {
        plugins: [pinia],
      },
    })

    // Wait for component to load
    await wrapper.vm.$nextTick()

    // Check that form is populated with transaction data
    expect(wrapper.vm.formData.amount_pence).toBe(1500)
    expect(wrapper.vm.formData.t_date).toBe('2024-01-15')
    expect(wrapper.vm.formData.tag_ids).toEqual([1, 2])
    expect(wrapper.vm.formData.note).toBe('Test transaction')
  })

  it('emits save with parsed pence amount', async () => {
    const wrapper = mount(TransactionFormDrawer, {
      props: {
        open: true,
        editId: null,
      },
      global: {
        plugins: [pinia],
      },
    })

    // Set form data
    await wrapper.setData({
      formData: {
        amount_pence: 2500, // £25.00
        t_date: '2024-01-20',
        tag_ids: [1, 3],
        note: 'New transaction',
      },
      valid: true,
    })

    // Trigger save
    await wrapper.vm.onSave()

    // Check emitted payload
    const saveEvents = wrapper.emitted('save')
    expect(saveEvents).toBeTruthy()
    expect(saveEvents![0][0]).toEqual({
      amount_pence: 2500,
      t_date: '2024-01-20',
      tag_ids: [1, 3],
      note: 'New transaction',
    })
  })

  it('required fields cause validation errors', async () => {
    const wrapper = mount(TransactionFormDrawer, {
      props: {
        open: true,
        editId: null,
      },
      global: {
        plugins: [pinia],
      },
    })

    // Set invalid form data (zero amount, no date, no tags)
    await wrapper.setData({
      formData: {
        amount_pence: 0,
        t_date: '',
        tag_ids: [],
        note: '',
      },
    })

    // Trigger validation
    await wrapper.vm.validateForm()

    // Check validation errors
    expect(wrapper.vm.errors.amount).toBe('Amount is required and must not be zero')
    expect(wrapper.vm.errors.date).toBe('Date is required')
    expect(wrapper.vm.errors.tags).toBe('At least one tag is required')
    expect(wrapper.vm.valid).toBe(false)
  })

  it('shows correct title based on edit mode', () => {
    // Add mode
    const addWrapper = mount(TransactionFormDrawer, {
      props: {
        open: true,
        editId: null,
      },
      global: {
        plugins: [pinia],
      },
    })
    expect(addWrapper.text()).toContain('Add Transaction')

    // Edit mode
    const editWrapper = mount(TransactionFormDrawer, {
      props: {
        open: true,
        editId: 1,
      },
      global: {
        plugins: [pinia],
      },
    })
    expect(editWrapper.text()).toContain('Edit Transaction')
  })

  it('emits close event when drawer is closed', async () => {
    const wrapper = mount(TransactionFormDrawer, {
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
    expect(wrapper.emitted('close')).toBeTruthy()
  })

  it('requires at least one tag for validation', async () => {
    const wrapper = mount(TransactionFormDrawer, {
      props: {
        open: true,
        editId: null,
      },
      global: {
        plugins: [pinia],
      },
    })

    // Set valid form data but with no tags
    await wrapper.setData({
      formData: {
        amount_pence: 1500,
        t_date: '2024-01-15',
        tag_ids: [],
        note: 'Test note',
      },
    })

    // Trigger validation
    await wrapper.vm.validateForm()

    // Check that tags validation fails
    expect(wrapper.vm.errors.tags).toBe('At least one tag is required')
    expect(wrapper.vm.valid).toBe(false)

    // Now add a tag and check validation passes
    await wrapper.setData({
      formData: {
        amount_pence: 1500,
        t_date: '2024-01-15',
        tag_ids: [1],
        note: 'Test note',
      },
    })

    await wrapper.vm.validateForm()
    expect(wrapper.vm.errors.tags).toBe('')
    expect(wrapper.vm.valid).toBe(true)
  })
})
