import { createRouter as _createRouter, createWebHistory } from 'vue-router'
import type { Store } from 'vuex'
const Login = () => import('@/components/Login.vue')
const Timer = () => import('@/components/views/Timer.vue')
const Stats = () => import('@/components/views/Stats.vue')
const History = () => import('@/components/views/History.vue')
const PersonalBests = () => import('@/components/views/PersonalBests.vue')

export function createRouter(store: Store<any>) {
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
                component: Login,
            },
            {
                path: '/timer',
                name: 'Timer',
                component: Timer,
            },
            {
                path: '/statistics',
                name: 'Statistics',
                component: Stats,
            },
            {
                path: '/history',
                name: 'History',
                component: History,
            },
            {
                path: '/personal-bests',
                name: 'PersonalBests',
                component: PersonalBests,
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
