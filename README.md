# Budget Vue App

A modern Vue 3 budget management application built with Vuetify 3, TypeScript, and Pinia for state management. This application provides comprehensive financial tracking with transaction management, recurring payments, tag categorization, and interactive dashboard charts.

## 🚀 Features

- **Transaction Management**: Create, edit, and delete transactions with amount tracking in GBP
- **Recurring Payments**: Set up and manage recurring transactions
- **Tag System**: Categorize transactions with custom tags and colors
- **Interactive Dashboard**: Visual charts showing spending patterns and cash flow
- **Dark/Light Theme**: Toggle between themes with persistent preferences
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **API Integration**: RESTful API integration with authentication via API key

## 🛠️ Tech Stack

| **Technology** | **Version** | **Purpose**                             |
| -------------- | ----------- | --------------------------------------- |
| Vue 3          | ^3.5.17     | Frontend framework with Composition API |
| TypeScript     | ~5.8.0      | Type safety and development experience  |
| Vite           | ^7.0.0      | Build tool and development server       |
| Vuetify 3      | ^3.8.12     | Material Design UI components           |
| Pinia          | ^3.0.3      | State management                        |
| Vue Router     | ^4.5.1      | Client-side routing                     |
| Axios          | ^1.10.0     | HTTP client for API calls               |
| ECharts        | ^5.6.0      | Interactive charts and visualizations   |
| Vitest         | ^3.2.4      | Unit testing framework                  |

## 📁 Project Structure

```
src/
├── assets/                 # Static assets (CSS, images)
├── components/            # Reusable Vue components
│   ├── charts/           # Chart components (DashboardCharts.vue)
│   ├── forms/            # Form components (MoneyInput.vue, TagMultiSelect.vue)
│   ├── icons/            # Icon components
│   └── shared/           # Shared components (ThemeToggle.vue)
├── composables/          # Vue composables
│   ├── useApi.ts         # API client with authentication
│   ├── useMoneyFormat.ts # Currency formatting utilities
│   └── useSnackbar.ts    # Global notification system
├── pages/                # Route components
│   ├── DashboardPage.vue # Main dashboard with charts
│   ├── TransactionsPage.vue # Transaction management
│   ├── RecurringPage.vue # Recurring payments
│   ├── TagsPage.vue      # Tag management
│   ├── SettingsPage.vue  # Application settings
│   ├── LoginPage.vue     # API key authentication
│   └── NotFound.vue      # 404 page
├── plugins/              # Vue plugins
│   └── vuetify.ts        # Vuetify configuration
├── router/               # Vue Router configuration
│   └── index.ts          # Route definitions
├── stores/               # Pinia state stores
│   ├── session.ts        # Authentication state
│   ├── transactions.ts   # Transaction data
│   ├── recurring.ts      # Recurring payments
│   ├── tags.ts           # Tag management
│   ├── reports.ts        # Analytics data
│   ├── theme.ts          # Theme preferences
│   └── settings.ts       # App settings
├── __tests__/            # Unit tests
├── App.vue               # Root component
└── main.ts               # Application entry point
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn package manager

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd budget-vue
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start development server**

   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

## 📋 Available Scripts

### Development

```bash
# Start development server with hot reload
npm run dev

# Type checking
npm run type-check

# Run tests in watch mode
npm run test

# Run tests with UI
npm run test:ui

# Run tests once
npm run test:run
```

### Production

```bash
# Build for production
npm run build

# Preview production build locally
npm run preview
```

### Code Quality

```bash
# Lint and type-check
npm run lint

# Format code with Prettier
npm run format

# Type checking only
npm run type-check
```

## 🔧 Development Setup

### IDE Configuration

#### VS Code (Recommended)

1. **Install extensions**:

   - [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) - Vue 3 support
   - [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) - ESLint integration
   - [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) - Code formatting

2. **Configure settings** (already included in `.vscode/settings.json`):
   - Format on save enabled
   - ESLint auto-fix on save
   - Prettier as default formatter

### Pre-commit Hooks

Set up automatic code quality checks:

```bash
npm install --save-dev husky lint-staged
npx husky install
npx husky add .husky/pre-commit "npm run lint && npm run format"
```

## 🎨 Theme System

The application supports both light and dark themes with automatic persistence:

### Features

- **Theme Toggle**: Switch between light and dark modes
- **Persistent Storage**: Theme preference saved in localStorage
- **Material Design**: Consistent theming across all components
- **Responsive**: Theme toggle available in app bar

### Usage

```vue
<script setup lang="ts">
  import { useThemeStore } from '@/stores/theme'

  const themeStore = useThemeStore()

  // Toggle theme
  themeStore.toggleTheme()

  // Set specific theme
  themeStore.setTheme(true) // dark mode
  themeStore.setTheme(false) // light mode
</script>
```

### Color Scheme

**Light Theme**:

- Primary: `#1867C0` (Blue)
- Secondary: `#5CBBF6` (Light Blue)
- Accent: `#82B1FF` (Light Blue)

**Dark Theme**:

- Primary: `#2196F3` (Blue)
- Secondary: `#424242` (Gray)
- Accent: `#FF4081` (Pink)

## 💰 Money Formatting

The application uses a consistent money formatting system:

```typescript
// composables/useMoneyFormat.ts
export const useMoneyFormat = () => {
  const fmt = new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
  })
  return (pence: number) => fmt.format(pence / 100)
}
```

**Features**:

- Internal storage in pence (integers)
- Display formatting in pounds with £ symbol
- Automatic conversion between display and storage formats
- Color coding: green for income, red for expenses

## 🔐 Authentication

The application uses API key authentication:

1. **Login Flow**: Users enter API key on LoginPage
2. **Storage**: Key stored in sessionStorage and Pinia store
3. **Interceptor**: Axios automatically adds `X-API-Key` header
4. **Session Management**: Automatic redirect to login on 401 responses

## 📊 Charts and Analytics

Interactive charts powered by Apache ECharts:

- **Pie Charts**: Spending breakdown by tags
- **Bar Charts**: Monthly cash flow visualization
- **Responsive**: Charts adapt to container size
- **Lazy Loading**: Chart components loaded on demand

## 🧪 Testing

The project includes comprehensive unit tests:

```bash
# Run tests in watch mode
npm run test

# Run tests with UI
npm run test:ui

# Run tests once
npm run test:run
```

**Test Coverage**:

- Component rendering and interactions
- Store state management
- API integration
- Form validation
- Utility functions

## 📦 Dependencies

### Production Dependencies

| Package       | Version | Purpose                 |
| ------------- | ------- | ----------------------- |
| `vue`         | ^3.5.17 | Vue 3 framework         |
| `vuetify`     | ^3.8.12 | Material Design UI      |
| `pinia`       | ^3.0.3  | State management        |
| `vue-router`  | ^4.5.1  | Client-side routing     |
| `axios`       | ^1.10.0 | HTTP client             |
| `echarts`     | ^5.6.0  | Chart library           |
| `vue-echarts` | ^7.0.3  | Vue wrapper for ECharts |
| `@mdi/font`   | ^7.4.47 | Material Design Icons   |

### Development Dependencies

| Package      | Version | Purpose                 |
| ------------ | ------- | ----------------------- |
| `typescript` | ~5.8.0  | TypeScript compiler     |
| `vite`       | ^7.0.0  | Build tool              |
| `vitest`     | ^3.2.4  | Testing framework       |
| `eslint`     | ^9.29.0 | Code linting            |
| `prettier`   | 3.5.3   | Code formatting         |
| `vue-tsc`    | ^2.2.10 | Vue TypeScript compiler |

## 🚀 Deployment

### Production Build

```bash
# Create production build
npm run build

# Preview build locally
npm run preview
```

### Deployment Options

1. **Static Hosting**: Deploy `dist/` folder to any static hosting service
2. **Docker**: Use the included Dockerfile for containerized deployment
3. **Nginx/Caddy**: Serve behind a reverse proxy for production

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes** and ensure tests pass
4. **Run code quality checks**: `npm run lint && npm run format`
5. **Commit your changes**: `git commit -m 'Add amazing feature'`
6. **Push to the branch**: `git push origin feature/amazing-feature`
7. **Open a Pull Request**

### Code Quality Standards

- **TypeScript**: All code must be properly typed
- **ESLint**: No linting errors allowed
- **Prettier**: Consistent code formatting
- **Tests**: New features should include tests
- **Vue 3**: Use Composition API and `<script setup>`

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Troubleshooting

### Common Issues

**ESLint Not Working**:

```bash
npx eslint --version
npx eslint --print-config src/App.vue
```

**TypeScript Errors**:

```bash
npm run type-check
vue-tsc --noEmit
```

**Prettier Conflicts**:

```bash
npx prettier --check src/
npx prettier --write src/components/MyComponent.vue
```

**Build Issues**:

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

For additional help, please check the [Issues](https://github.com/your-repo/issues) page or create a new issue.
