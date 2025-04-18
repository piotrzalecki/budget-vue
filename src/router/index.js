import { createRouter, createWebHistory } from 'vue-router'
// import Body from './../components/AppBody.vue'
import LoginComposition from './../components/AppLoginComposition.vue'
import Users from './../components/AppUsers.vue'
import User from './../components/AppUsersEdit.vue'
import Security from '../components/security'
import Tags from './../components/AppTags.vue'
import AppTagsAddEdit from './../components/AppTagsAddEdit.vue'
import Budgets from './../components/AppBudgets.vue'
import AppBudgetsAddEdit from './../components/AppBudgetsAddEdit.vue'
import Logs from './../components/AppLogs.vue'
import TransactionsRecurrences from './../components/AppTransactionsRecurrences.vue'
import TransactionsRecurrencesAdd from './../components/AppTransactionsRecurrencesAdd.vue'
import TransactionsAddEdit from './../components/AppTransactionsAddEdit.vue'
import Transactions from './../components/AppTransactions.vue'
import TransactionDetails from './../components/AppTransactionDetails.vue'

const routes = [
    {
        path: '/',
        name: 'Home',
        component: Transactions,
    },
    {
        path: '/login',
        name: 'LoginComposition',
        component: LoginComposition,
    },
    {
        path: '/admin/users',
        name: 'Users',
        component: Users,
    },
    {
        path: '/admin/users/:userId',
        name: 'User',
        component: User,
    },
    {
        path: '/admin/dashboard/tags',
        name: 'Tags',
        component: Tags,
    },
    {
        path: '/admin/dashboard/tags/:tagId',
        name: 'TagsAddEdit',
        component: AppTagsAddEdit,
    },
    {
        path: '/admin/dashboard/budgets',
        name: 'Budgets',
        component: Budgets,
    },
    {
        path: '/admin/dashboard/budgets/:budgetId',
        name: 'BudgetsAddEdit',
        component: AppBudgetsAddEdit,
    },
    {
        path: '/admin/dashboard/logs',
        name: 'Logs',
        component: Logs,
    },
    {
        path: '/admin/dashboard/transactions-recurrences',
        name: 'TransactionsRecurrences',
        component: TransactionsRecurrences,
    },
    {
        path: '/admin/dashboard/transactions-recurrences/new',
        name: 'TransactionsRecurrencesAdd',
        component: TransactionsRecurrencesAdd,
    },
    {
        path: '/admin/dashboard/transactions',
        name: 'Transactions',
        component: Transactions,
    },
    {
        path: '/admin/dashboard/transactions/details/:transactionId',
        name: 'TransactionDetails',
        component: TransactionDetails,
    },
    {
        path: '/admin/dashboard/transactions/edit/:transactionId',
        name: 'TransactionsAddEdit',
        component: TransactionsAddEdit,
    },
]

const router = createRouter({ history: createWebHistory(), routes })
router.beforeEach(() => {
    Security.checkToken();
})

export default router