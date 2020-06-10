import Vue from 'vue'
import VueRouter, { RouteConfig } from 'vue-router'
import Store from '@/store'
import Timer from '@/components/views/Timer.vue'
import Login from '@/components/Login.vue'

Vue.use(VueRouter)

const routes: RouteConfig[] = [
    {
        path: '/',
        name: 'Home',
        redirect: '/timer'
    },
    {
        path: '/login',
        name: 'Login',
        component: Login
    },
    {
        path: '/timer',
        name: 'Timer',
        component: Timer
    },
    {
        path: '/statistics',
        name: 'Statistics',
        component: () => import(/* webpackChunkName: "stats" */ '@/components/views/Stats.vue')
    },
    {
        path: '/history',
        name: 'History',
        component: () => import(/* webpackChunkName: "history" */ '@/components/views/History.vue')
    },
    {
        path: '/personal-bests',
        name: 'PersonalBests',
        component: () => import(/* webpackChunkName: "pb" */ '@/components/views/PersonalBests.vue')
    }
]

const router = new VueRouter({
    mode: 'history',
    base: process.env.BASE_URL,
    routes
})

router.beforeEach((to, from, next) => {
    if (to.name === 'Login') {
        next()
    } else if (Store.getters.isLoggedIn) {
        next()
    } else {
        next({ name: 'Login' })
    }
})

export default router
