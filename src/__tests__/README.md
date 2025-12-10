# Test Suite for Budget Vue App

This test suite is designed to prevent the JavaScript runtime errors that occurred after deployment. The tests focus on data handling edge cases and error boundaries.

## Test Files

### 1. `dataHandling.test.ts` - Core Data Safety Tests

**Purpose**: Tests the most critical data handling scenarios that caused the original runtime errors.

**Key Test Categories**:

- **Array Safety**: Tests handling of null/undefined arrays in API responses
- **Object Property Safety**: Tests handling of null/undefined object properties
- **Array Processing Safety**: Tests safe array operations (map, filter, etc.)
- **String Processing Safety**: Tests handling of invalid string data
- **Error Boundary Tests**: Ensures functions don't throw on malformed data
- **API Error Handling**: Tests graceful handling of network/API errors

**Critical Scenarios Covered**:

- `t.map is not a function` - Tests array safety before calling `.map()`
- `Right side of assignment cannot be destructured` - Tests safe destructuring
- `null is not an object` - Tests null checks before property access

### 2. `transactions.test.ts` - Store Logic Tests

**Purpose**: Tests the transactions store functionality including the `processTransaction` function.

**Key Test Categories**:

- Transaction processing with various data formats
- Tag handling (both `tags` array and `tag_ids` array)
- Amount conversion (string to pence)
- API response handling
- Error scenarios

### 3. `useApi.test.ts` - API Integration Tests

**Purpose**: Tests the API composable and error handling.

### 4. `useMoneyFormat.test.ts` - Utility Function Tests

**Purpose**: Tests the money formatting utility.

## Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test src/__tests__/dataHandling.test.ts

# Run tests in watch mode
npm test -- --watch
```

## Test Configuration

The tests use:

- **Vitest** as the test runner
- **jsdom** environment for DOM testing
- **Pinia** for state management testing
- **Vue Test Utils** for component testing

## Key Testing Principles

1. **Defensive Programming**: All functions handle null/undefined inputs gracefully
2. **Type Safety**: Array checks before calling array methods
3. **Error Boundaries**: Functions never throw on malformed data
4. **API Resilience**: Graceful handling of network errors and malformed responses
5. **Data Validation**: Safe processing of external data

## Preventing Future Issues

These tests specifically prevent:

- `TypeError: t.map is not a function` - By testing array safety
- `TypeError: Right side of assignment cannot be destructured` - By testing safe destructuring
- `TypeError: null is not an object` - By testing null checks
- Runtime crashes from malformed API responses
- Component crashes from unexpected data structures

## Adding New Tests

When adding new features:

1. Add tests for null/undefined data handling
2. Test array operations with safety checks
3. Test API response processing
4. Test error scenarios
5. Follow the existing test patterns

## Test Coverage

The tests cover:

- ✅ Array safety operations
- ✅ Object property access safety
- ✅ API response handling
- ✅ Error boundary scenarios
- ✅ Data transformation functions
- ✅ Store state management
- ✅ Component prop handling
