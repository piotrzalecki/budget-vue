import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import TagMultiSelect from '../components/forms/TagMultiSelect.vue'

// Mock the tags store
const mockTags = [
  { id: 1, name: 'Food', color: '#FF0000' },
  { id: 2, name: 'Transport', color: '#00FF00' },
  { id: 3, name: 'Entertainment', color: '#0000FF' },
]

vi.mock('../stores/tags', () => ({
  useTagsStore: () => ({
    list: mockTags,
    loading: false,
    fetch: vi.fn(),
  }),
}))

describe('TagMultiSelect', () => {
  let wrapper: any

  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  const createWrapper = (props = {}) => {
    return mount(TagMultiSelect, {
      props: {
        modelValue: [],
        ...props,
      },
      global: {
        plugins: [createPinia()],
      },
    })
  }

  describe('props handling', () => {
    it('should render with default props', () => {
      wrapper = createWrapper()

      expect(wrapper.exists()).toBe(true)
      expect(wrapper.findComponent({ name: 'v-combobox' }).exists()).toBe(true)
    })

    it('should pass custom props to v-combobox', () => {
      wrapper = createWrapper({
        label: 'Custom Label',
        placeholder: 'Custom Placeholder',
        errorMessages: 'Custom Error',
      })

      const combobox = wrapper.findComponent({ name: 'v-combobox' })
      expect(combobox.props('label')).toBe('Custom Label')
      expect(combobox.props('placeholder')).toBe('Custom Placeholder')
      expect(combobox.props('errorMessages')).toBe('Custom Error')
    })
  })

  describe('tagsList computed property', () => {
    it('should return tags list when store.list is an array', () => {
      wrapper = createWrapper()

      const vm = wrapper.vm
      expect(vm.tagsList).toEqual(mockTags)
    })

    it('should return empty array when store.list is not an array', () => {
      // Mock store with non-array list
      vi.doMock('../stores/tags', () => ({
        useTagsStore: () => ({
          list: null,
          loading: false,
          fetch: vi.fn(),
        }),
      }))

      wrapper = createWrapper()

      const vm = wrapper.vm
      expect(vm.tagsList).toEqual([])
    })

    it('should return empty array when store.list is undefined', () => {
      vi.doMock('../stores/tags', () => ({
        useTagsStore: () => ({
          list: undefined,
          loading: false,
          fetch: vi.fn(),
        }),
      }))

      wrapper = createWrapper()

      const vm = wrapper.vm
      expect(vm.tagsList).toEqual([])
    })
  })

  describe('selectedTags computed property', () => {
    it('should convert tag IDs to Tag objects', () => {
      wrapper = createWrapper({
        modelValue: [1, 2],
      })

      const vm = wrapper.vm
      const selectedTags = vm.selectedTags

      expect(selectedTags).toHaveLength(2)
      expect(selectedTags[0]).toEqual({ id: 1, name: 'Food', color: '#FF0000' })
      expect(selectedTags[1]).toEqual({ id: 2, name: 'Transport', color: '#00FF00' })
    })

    it('should filter out undefined tags', () => {
      wrapper = createWrapper({
        modelValue: [1, 999, 2], // 999 doesn't exist in mock tags
      })

      const vm = wrapper.vm
      const selectedTags = vm.selectedTags

      expect(selectedTags).toHaveLength(2)
      expect(selectedTags[0].id).toBe(1)
      expect(selectedTags[1].id).toBe(2)
    })

    it('should return empty array when modelValue is not an array', () => {
      wrapper = createWrapper({
        modelValue: null,
      })

      const vm = wrapper.vm
      expect(vm.selectedTags).toEqual([])
    })

    it('should return empty array when modelValue is undefined', () => {
      wrapper = createWrapper({
        modelValue: undefined,
      })

      const vm = wrapper.vm
      expect(vm.selectedTags).toEqual([])
    })

    it('should return empty array when modelValue is empty array', () => {
      wrapper = createWrapper({
        modelValue: [],
      })

      const vm = wrapper.vm
      expect(vm.selectedTags).toEqual([])
    })

    it('should emit update:modelValue when selectedTags setter is called', async () => {
      wrapper = createWrapper()

      const vm = wrapper.vm
      const newTags = [
        { id: 1, name: 'Food', color: '#FF0000' },
        { id: 3, name: 'Entertainment', color: '#0000FF' },
      ]

      vm.selectedTags = newTags

      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
      expect(wrapper.emitted('update:modelValue')[0]).toEqual([[1, 3]])
    })
  })

  describe('onUpdate method', () => {
    it('should emit update:modelValue with tag IDs', async () => {
      wrapper = createWrapper()

      const vm = wrapper.vm
      const newTags = [
        { id: 1, name: 'Food', color: '#FF0000' },
        { id: 2, name: 'Transport', color: '#00FF00' },
      ]

      vm.onUpdate(newTags)

      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
      expect(wrapper.emitted('update:modelValue')[0]).toEqual([[1, 2]])
    })

    it('should not emit when tags is not an array', async () => {
      wrapper = createWrapper()

      const vm = wrapper.vm

      // Test with various non-array values
      const invalidValues = [null, undefined, 'string', 123, {}]

      invalidValues.forEach(value => {
        vm.onUpdate(value)
      })

      expect(wrapper.emitted('update:modelValue')).toBeFalsy()
    })

    it('should handle empty tags array', async () => {
      wrapper = createWrapper()

      const vm = wrapper.vm
      vm.onUpdate([])

      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
      expect(wrapper.emitted('update:modelValue')[0]).toEqual([[]])
    })
  })

  describe('onMounted lifecycle', () => {
    it('should fetch tags if store.list is empty', () => {
      const mockFetch = vi.fn()

      vi.doMock('../stores/tags', () => ({
        useTagsStore: () => ({
          list: [],
          loading: false,
          fetch: mockFetch,
        }),
      }))

      wrapper = createWrapper()

      expect(mockFetch).toHaveBeenCalled()
    })

    it('should not fetch tags if store.list is not empty', () => {
      const mockFetch = vi.fn()

      vi.doMock('../stores/tags', () => ({
        useTagsStore: () => ({
          list: mockTags,
          loading: false,
          fetch: mockFetch,
        }),
      }))

      wrapper = createWrapper()

      expect(mockFetch).not.toHaveBeenCalled()
    })
  })

  describe('error handling', () => {
    it('should handle malformed tag objects gracefully', () => {
      wrapper = createWrapper({
        modelValue: [1, 2],
      })

      const vm = wrapper.vm

      // Mock store with malformed tags
      vm.tagsStore.list = [
        { id: 1, name: 'Food' }, // Missing color
        { id: 2 }, // Missing name and color
        { id: 3, name: 'Transport', color: '#00FF00' },
      ]

      const selectedTags = vm.selectedTags

      expect(selectedTags).toHaveLength(2)
      expect(selectedTags[0]).toEqual({ id: 1, name: 'Food' })
      expect(selectedTags[1]).toEqual({ id: 3, name: 'Transport', color: '#00FF00' })
    })

    it('should handle null/undefined tag properties', () => {
      wrapper = createWrapper({
        modelValue: [1, 2],
      })

      const vm = wrapper.vm

      // Mock store with tags containing null/undefined properties
      vm.tagsStore.list = [
        { id: 1, name: null, color: undefined },
        { id: 2, name: 'Transport', color: '#00FF00' },
      ]

      const selectedTags = vm.selectedTags

      expect(selectedTags).toHaveLength(2)
      expect(selectedTags[0]).toEqual({ id: 1, name: null, color: undefined })
      expect(selectedTags[1]).toEqual({ id: 2, name: 'Transport', color: '#00FF00' })
    })
  })

  describe('component integration', () => {
    it('should pass correct props to v-combobox', () => {
      wrapper = createWrapper({
        modelValue: [1, 2],
        label: 'Test Label',
        placeholder: 'Test Placeholder',
        errorMessages: 'Test Error',
      })

      const combobox = wrapper.findComponent({ name: 'v-combobox' })

      expect(combobox.props('items')).toEqual(mockTags)
      expect(combobox.props('loading')).toBe(false)
      expect(combobox.props('label')).toBe('Test Label')
      expect(combobox.props('placeholder')).toBe('Test Placeholder')
      expect(combobox.props('errorMessages')).toBe('Test Error')
      expect(combobox.props('multiple')).toBe(true)
      expect(combobox.props('chips')).toBe(true)
      expect(combobox.props('closableChips')).toBe(true)
      expect(combobox.props('itemTitle')).toBe('name')
      expect(combobox.props('itemValue')).toBe('id')
    })

    it('should handle v-combobox update events', async () => {
      wrapper = createWrapper()

      const combobox = wrapper.findComponent({ name: 'v-combobox' })

      // Simulate v-combobox emitting update:model-value
      await combobox.vm.$emit('update:model-value', [
        { id: 1, name: 'Food', color: '#FF0000' },
        { id: 3, name: 'Entertainment', color: '#0000FF' },
      ])

      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
      expect(wrapper.emitted('update:modelValue')[0]).toEqual([[1, 3]])
    })
  })
})
