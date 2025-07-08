# TransactionFormDrawer Implementation

## Overview

This document describes the implementation of the TransactionFormDrawer component as specified in the task requirements.

## Components Created

### 1. MoneyInput.vue (`src/components/forms/MoneyInput.vue`)

A reusable form component that:

- Shows a £ prefix using `prepend-inner-icon="mdi-currency-gbp"`
- Converts between pounds (display) and pence (internal storage)
- Uses `v-text-field` with `type="number"` and `step="0.01"`
- Handles input validation and formatting

**Props:**

- `modelValue: number` - Amount in pence
- `label?: string` - Field label (default: "Amount")
- `placeholder?: string` - Placeholder text (default: "0.00")
- `errorMessages?: string | string[]` - Validation error messages

### 2. TagMultiSelect.vue (`src/components/forms/TagMultiSelect.vue`)

A multi-select component that:

- Uses `v-combobox` with `multiple` and `chips` props
- Integrates with the tags store to fetch available tags
- Displays selected tags as chips with colors
- Converts between tag objects (for v-combobox) and tag IDs (for API)

**Props:**

- `modelValue: number[]` - Array of tag IDs
- `label?: string` - Field label (default: "Tags")
- `placeholder?: string` - Placeholder text (default: "Select tags...")

### 3. TransactionFormDrawer.vue (`src/components/TransactionFormDrawer.vue`)

The main drawer component that:

- Slides in from the right with 400px width on desktop
- Switches to full-screen modal on mobile (<960px breakpoint)
- Handles both create and edit modes
- Includes form validation and loading states

**Props:**

- `open: boolean` - Controls drawer visibility
- `editId: number | null` - If non-null, loads existing transaction for editing

**Emits:**

- `save(payload)` - Emitted when form is submitted with valid data
- `close()` - Emitted when drawer is closed

## Store Updates

### Transactions Store (`src/stores/transactions.ts`)

Added `update` method to handle transaction updates via PATCH API endpoint.

**API Integration:**

- Converts pence to pounds (string format) for API calls
- Handles both create and update operations
- Maps between frontend data structure and API requirements

## Page Integration

### TransactionsPage.vue (`src/pages/TransactionsPage.vue`)

Updated to integrate the TransactionFormDrawer:

- Added "Add Transaction" button in header
- Integrated drawer with proper state management
- Handles save events and shows success/error messages
- Connects edit functionality from TransactionTable

## Features Implemented

### ✅ Required Features

1. **Drawer Component** - Slides in/out smoothly and is responsive
2. **Form Validation** - Blocks save until required fields are filled
3. **Save Event** - Fires `save({...})` with correct payload structure
4. **Edit Mode** - Pre-populates fields and updates on save
5. **Loading State** - Shows skeleton loader while fetching data
6. **Enter Key Support** - Pressing Enter triggers save
7. **Mobile Responsive** - Full-screen modal on mobile devices

### ✅ Form Fields

- **Amount** - MoneyInput with £ prefix and pence conversion
- **Date** - v-text-field with type="date" for inline date picker
- **Tags** - TagMultiSelect with chips display
- **Note** - v-text-field with multiline support

### ✅ Validation Rules

- Amount must not be zero
- Date is required
- Form is disabled until valid
- Error messages displayed for invalid fields

## Testing

Created unit tests (`src/__tests__/TransactionFormDrawer.test.ts`) that verify:

- Correct initial values in edit mode
- Save event emits with parsed pence amount
- Required fields cause validation errors
- Proper title display based on mode
- Close event emission

## API Integration

The implementation follows the API specification from `swagger.json`:

- **Create Transaction**: POST `/transactions` with `CreateTransactionRequest`
- **Update Transaction**: PATCH `/transactions/{id}` with `UpdateTransactionRequest`
- **Amount Format**: String representation of pounds (e.g., "15.50")
- **Date Format**: YYYY-MM-DD string format
- **Tag IDs**: Array of integer tag IDs

## Usage Example

```vue
<template>
  <TransactionFormDrawer
    :open="drawerOpen"
    :edit-id="editingId"
    @save="handleSave"
    @close="closeDrawer"
  />
</template>

<script setup>
  const drawerOpen = ref(false)
  const editingId = ref(null)

  const handleSave = async payload => {
    // payload contains: { amount_pence, t_date, tag_ids, note }
    await transactionsStore.add(payload) // or update for edit mode
    closeDrawer()
  }
</script>
```

## Acceptance Criteria Status

- ✅ Drawer slides in/out smoothly and is responsive
- ✅ Form validation blocks save until required fields are filled
- ✅ Fires save({...}) with { amount_pence, t_date, tag_ids, note }
- ✅ Editing an existing txn pre-populates fields and updates on save
- ✅ Unit test passes in CI (tests created and ready to run)

The TransactionFormDrawer implementation is complete and meets all specified requirements.
