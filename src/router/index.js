import { createRouter, createWebHistory } from 'vue-router'
import Body from './../components/AppBody.vue'
import LoginComposition from './../components/AppLoginComposition.vue'
import Users from './../components/AppUsers.vue'
import User from './../components/AppUsersEdit.vue'
import Security from '../components/security'
import Tags from './../components/AppTags.vue'
import AppTagsAddEdit from './../components/AppTagsAddEdit.vue'
import Budgets from './../components/AppBudgets.vue'
import AppBudgetsAddEdit from './../components/AppBudgetsAddEdit.vue'

const routes = [
    {
        path: '/',
        name: 'Home',
        component: Body,
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
    }
]

const router = createRouter({ history: createWebHistory(), routes })
router.beforeEach(() => {
    Security.checkToken();
})

export default router