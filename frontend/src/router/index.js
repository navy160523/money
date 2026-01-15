import { createRouter, createWebHashHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import DashboardView from '../views/DashboardView.vue'
import TransactionListView from '../views/TransactionListView.vue'

const routes = [
    {
        path: '/login',
        name: 'login',
        component: LoginView
    },
    {
        path: '/',
        name: 'dashboard',
        component: DashboardView,
        meta: { requiresAuth: true }
    },
    {
        path: '/transactions',
        name: 'transactions',
        component: TransactionListView,
        meta: { requiresAuth: true }
    },
    {
        path: '/daily/:date',
        name: 'daily-detail',
        component: () => import('../views/DailyDetailView.vue'),
        meta: { requiresAuth: true }
    }
]

const router = createRouter({
    history: createWebHashHistory(),
    routes
})

router.beforeEach((to, from, next) => {
    const isAuthenticated = sessionStorage.getItem('isLocked') === 'false'

    if (to.meta.requiresAuth && !isAuthenticated) {
        next({ name: 'login' })
    } else if (to.name === 'login' && isAuthenticated) {
        next({ name: 'dashboard' })
    } else {
        next()
    }
})

export default router
