import { createRouter as _createRouter, createWebHistory } from 'vue-router'
import type { Store } from 'vuex'
import type { RootState } from '@/types/store'
const LoginView = () => import('@/components/views/LoginView.vue')
const TimerView = () => import('@/components/views/TimerView.vue')
const StatsView = () => import('@/components/views/StatsView.vue')
const HistoryView = () => import('@/components/views/HistoryView.vue')
const PersonalBestsView = () => import('@/components/views/PersonalBestsView.vue')

export function createRouter(store: Store<RootState>) {
    const router = _createRouter({
        history: createWebHistory(),
        routes: [
            {
                path: '/',
                name: 'Home',
                redirect: '/timer',
            },
            {
                path: '/login',
                name: 'Login',
                component: LoginView,
            },
            {
                path: '/timer',
                name: 'Timer',
                component: TimerView,
            },
            {
                path: '/statistics',
                name: 'Statistics',
                component: StatsView,
            },
            {
                path: '/history',
                name: 'History',
                component: HistoryView,
            },
            {
                path: '/personal-bests',
                name: 'PersonalBests',
                component: PersonalBestsView,
            },
        ],
    })

    router.beforeEach((to) => {
        if (!store.getters.isLoggedIn && to.name !== 'Login') {
            return { name: 'Login' }
        }
    })

    return router
}
