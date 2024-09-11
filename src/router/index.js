import { createRouter, createWebHistory } from 'vue-router'
import Body from './../components/AppBody.vue'
import LoginComposition from './../components/AppLoginComposition.vue'
import Users from './../components/AppUsers.vue'
import User from './../components/AppUsersEdit.vue'
import Security from '../components/security'

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
    }
]

const router = createRouter({ history: createWebHistory(), routes })
router.beforeEach(() => {
    Security.checkToken();
})

export default router