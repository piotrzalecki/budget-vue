# .

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Type-Check, Compile and Minify for Production

```sh
npm run build
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```

### Code Quality Scripts

The project includes comprehensive lint and format scripts for maintaining code quality:

#### Linting

- `npm run lint` - Lint and auto-fix all files
- `npm run lint:check` - Check for linting issues without fixing
- `npm run lint:fix` - Fix linting issues automatically

#### Formatting

- `npm run format` - Format all source files with Prettier
- `npm run format:check` - Check formatting without making changes
- `npm run format:fix` - Fix formatting issues automatically

#### Combined Operations

- `npm run code:check` - Run all checks (lint, format, type-check) without fixing
- `npm run code:fix` - Run all fixes (lint and format)

#### Type Checking

- `npm run type-check` - Run TypeScript type checking

### Pre-commit Setup

To ensure code quality before commits, you can set up pre-commit hooks:

```sh
npm install --save-dev husky lint-staged
npx husky install
npx husky add .husky/pre-commit "npm run code:check"
```

This will automatically run linting, formatting, and type checking before each commit.

## Linting and Code Quality

This project uses ESLint and Prettier to maintain consistent code quality and formatting across the Vue 3 + TypeScript codebase.

### ESLint Configuration

The project uses ESLint with the following configuration:

- **Vue 3** support with `eslint-plugin-vue`
- **TypeScript** support with `@vue/eslint-config-typescript`
- **Prettier** integration to avoid conflicts
- **Flat config** format (ESLint 9+)

#### Key ESLint Rules

```javascript
// Vue-specific rules
'vue/multi-word-component-names': 'off', // Allow single word component names
'vue/no-unused-vars': 'error',
'vue/no-unused-components': 'error',

// TypeScript rules
'@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
'@typescript-eslint/no-explicit-any': 'warn',
'@typescript-eslint/prefer-const': 'error',

// General rules
'no-console': 'warn',
'no-debugger': 'error',
'prefer-const': 'error',
'no-var': 'error',
```

### Prettier Configuration

Prettier is configured for consistent code formatting:

- **Semicolons**: Disabled (Vue style)
- **Quotes**: Single quotes
- **Line width**: 100 characters
- **Indentation**: 2 spaces
- **Vue support**: Script and style indentation enabled

### IDE Setup

#### VS Code (Recommended)

1. Install the following extensions:

   - [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) - Vue 3 support
   - [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) - ESLint integration
   - [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) - Prettier formatting

2. The project includes `.vscode/settings.json` with:
   - Format on save enabled
   - ESLint auto-fix on save
   - Prettier as default formatter
   - Vue file associations

#### Other IDEs

For other IDEs, ensure you have:

- ESLint integration
- Prettier integration
- Vue 3 language support
- TypeScript support

### Linting Workflow

#### Development Workflow

1. **Before starting work**:

   ```bash
   npm run code:check  # Check for any existing issues
   ```

2. **During development**:

   - Your IDE should auto-format on save
   - ESLint errors will show in real-time
   - Use `npm run lint:fix` to fix issues quickly

3. **Before committing**:
   ```bash
   npm run code:fix    # Fix all linting and formatting issues
   npm run code:check  # Verify everything is clean
   ```

#### Common Linting Issues and Solutions

##### Vue Component Issues

```vue
<!-- ❌ Bad: Unused component -->
<template>
  <UnusedComponent />
</template>

<script setup lang="ts">
  import UnusedComponent from './UnusedComponent.vue' // ESLint error
</script>

<!-- ✅ Good: Remove unused import -->
<script setup lang="ts">
  // Component removed if not used
</script>
```

##### TypeScript Issues

```typescript
// ❌ Bad: Using 'any' type
const data: any = fetchData()

// ✅ Good: Use proper typing
const data: ApiResponse = fetchData()

// ❌ Bad: Unused variable
const unusedVar = 'hello'

// ✅ Good: Prefix with underscore if intentionally unused
const _unusedVar = 'hello'
```

##### Import/Export Issues

```typescript
// ❌ Bad: Unused import
import { unusedFunction } from './utils'

// ✅ Good: Remove unused imports
import { usedFunction } from './utils'

// ❌ Bad: Console statements in production code
console.log('debug info')

// ✅ Good: Use proper logging or remove
// console.log('debug info') // Commented out
```

### Troubleshooting

#### ESLint Not Working

1. **Check ESLint installation**:

   ```bash
   npx eslint --version
   ```

2. **Verify configuration**:

   ```bash
   npx eslint --print-config src/App.vue
   ```

3. **Clear cache**:
   ```bash
   npx eslint --cache-location .eslintcache --cache src/
   ```

#### Prettier Conflicts

1. **Check Prettier configuration**:

   ```bash
   npx prettier --check src/
   ```

2. **Format specific files**:

   ```bash
   npx prettier --write src/components/MyComponent.vue
   ```

3. **Ignore specific lines** (use sparingly):
   ```javascript
   // eslint-disable-next-line no-console
   console.log('This line is intentionally ignored')
   ```

#### TypeScript Errors

1. **Check TypeScript configuration**:

   ```bash
   npm run type-check
   ```

2. **Verify Vue component types**:
   ```bash
   vue-tsc --noEmit
   ```

### Continuous Integration

For CI/CD pipelines, use:

```bash
npm run code:check  # Fails if any issues found
```

This ensures that:

- All code is properly formatted
- No linting errors exist
- TypeScript types are correct
- No unused imports or variables remain

### Customizing Rules

To modify ESLint rules, edit `eslint.config.ts`:

```typescript
{
  rules: {
    // Add or modify rules here
    'no-console': 'off', // Example: allow console statements
  },
}
```

To modify Prettier settings, edit `.prettierrc.json`:

```json
{
  "printWidth": 80, // Example: change line width
  "semi": true // Example: enable semicolons
}
```
