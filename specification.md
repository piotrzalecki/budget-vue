# **Budget App – Vue Front-End Specification**

_Last updated: 18 June 2025_

---

## **1. Tech Stack Overview**

| **Concern**      | **Choice**                                                     |
| ---------------- | -------------------------------------------------------------- |
| Build tool       | **Vite 5** + Vue 3 (Composition API, TypeScript)               |
| UI kit           | **Vuetify 3** (Material Design)                                |
| State management | **Pinia** (modular stores)                                     |
| Router           | **vue-router 4** (HTML5 history mode)                          |
| HTTP client      | **axios** wrapped in useApi() composable                       |
| Charts           | **Apache ECharts** via vue-echarts                             |
| Auth strategy    | Single **API key** held in memory/sessionStorage               |
| Money format     | Intl.NumberFormat('en-GB',{style:'currency',currency:'GBP'})   |
| Colour cues      | text-success (green) for income, text-error (red) for expenses |

---

## **2. Project Structure**

```
src/
  assets/
  components/
    charts/
    forms/
    shared/
  pages/
    DashboardPage.vue
    TransactionsPage.vue
    RecurringPage.vue
    TagsPage.vue
    SettingsPage.vue
    LoginPage.vue
    NotFound.vue
  composables/
    useApi.ts            # axios instance + API key interceptor
    useMoneyFormat.ts    # £ formatting helper
    useSnackbar.ts       # global Vuetify snackbar
  stores/
    session.ts
    transactions.ts
    recurring.ts
    tags.ts
    reports.ts
  router/
    index.ts
  App.vue
  main.ts
```

> **Lazy-load** every page except Login to keep first paint snappy.

---

## **3. Routing**

```
// router/index.ts
export const routes = [
  { path: '/',              redirect: '/dashboard' },
  { path: '/login',         component: () => import('../pages/LoginPage.vue') },
  { path: '/dashboard',     component: () => import('../pages/DashboardPage.vue') },
  { path: '/transactions',  component: () => import('../pages/TransactionsPage.vue') },
  { path: '/recurring',     component: () => import('../pages/RecurringPage.vue') },
  { path: '/tags',          component: () => import('../pages/TagsPage.vue') },
  { path: '/settings',      component: () => import('../pages/SettingsPage.vue') },
  { path: '/:pathMatch(.*)',component: () => import('../pages/NotFound.vue') }
]
```

### **Navigation guard**

Redirect any route (except /login) to /login if the API key is missing.

---

## **4. Authentication Flow**

1. On app start, sessionStorage.getItem('apiKey') populates the Pinia session store.
2. If empty → user lands on **LoginPage**.
3. User enters key → stored in Pinia _and_ sessionStorage (for current tab session).
4. Axios instance injects X-API-Key header via request interceptor.
5. Response interceptor captures **401** → clears key and redirects to /login.

LoginPage design:

```
<v-card width="400">
  <v-card-title>Enter API Key</v-card-title>
  <v-card-text>
    <v-text-field v-model="key" type="password" label="API Key" />
  </v-card-text>
  <v-card-actions>
    <v-btn color="primary" :disabled="!key" @click="save">Continue</v-btn>
  </v-card-actions>
</v-card>
```

---

## **5. State Stores (Pinia)**

| **Store**    | **State**      | **Key Actions**                   |
| ------------ | -------------- | --------------------------------- |
| session      | apiKey         | setKey(), loadFromStorage()       |
| transactions | list, loading  | fetch(range), add, softDelete(id) |
| recurring    | same structure | fetch(), add, update, toggle(id)  |
| tags         | list           | fetch(), add, remove              |
| reports      | monthly map    | fetchMonth(ym)                    |

_Transactions and reports fetch once per date-range then paginate_ **_client-side_** _with Vuetify’s_ _v-data-table\_\_._

---

## **6. Core Components**

| **Component**                 | **Purpose**                                                              |
| ----------------------------- | ------------------------------------------------------------------------ |
| **MoneyInput.vue**            | <v-text-field> wrapper that shows £ prefix and converts pounds ↔ pence. |
| **TagMultiSelect.vue**        | <v-combobox multiple chips> backed by tags store.                        |
| **TransactionTable.vue**      | v-data-table with coloured amount cell and edit/delete actions.          |
| **TransactionFormDrawer.vue** | Side drawer to create/edit; uses MoneyInput & TagMultiSelect.            |
| **DashboardCharts**           | Pie (spend by tag) & bar (net cash) built with vue-echarts.              |
| **ConfirmDialog.vue**         | Reusable yes/no modal.                                                   |

---

## **7. Money & Colour Formatting**

```
// composables/useMoneyFormat.ts
export const useMoneyFormat = () => {
  const fmt = new Intl.NumberFormat('en-GB', {
    style: 'currency', currency: 'GBP'
  })
  return (pence: number) => fmt.format(pence / 100)
}
```

Amount cell in TransactionTable:

```
<span :class="item.amount_pence < 0 ? 'text-error' : 'text-success'">
  {{ money(item.amount_pence) }}
</span>
```

---

## **8. Charts Setup**

```
// DashboardPage.vue
<vue-echarts :option="pieOption" style="height:260px" />
<vue-echarts :option="barOption" style="height:240px" />
```

Configure ECharts via lazy plugin import to keep bundle small.

---

## **9. Build & Dev Commands**

```
npm install          # dependencies
npm run dev          # Vite dev server (http://localhost:5173)
npm run build        # Production build to dist/
```

Serve dist/ behind Caddy/Nginx or via Vite’s preview on the Pi.

---

## **10. Future Enhancements**

- **PWA** installability using vite-plugin-pwa.
- Switch transactions to **server-side pagination** if row count >1 k per view.
- Add **virtual-scroll** (vue-virtual-scroller) for very long lists.
- Responsive bar at top for offline indicator (useNetwork() from vueuse).

---

_End of document._
