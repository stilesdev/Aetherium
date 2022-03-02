import { createRouter as _createRouter, createWebHistory, RouterLink, RouterView } from 'vue-router'
import { Store } from 'vuex'
import Timer from '@/components/views/Timer.vue'
import Login from '@/components/Login.vue'

// TODO: remove this when removing the compatibility build
RouterLink.compatConfig = { MODE: 3 }
RouterView.compatConfig = { MODE: 3 }

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
                component: () => import(/* webpackChunkName: "stats" */ '@/components/views/Stats.vue'),
            },
            {
                path: '/history',
                name: 'History',
                component: () => import(/* webpackChunkName: "history" */ '@/components/views/History.vue'),
            },
            {
                path: '/personal-bests',
                name: 'PersonalBests',
                component: () => import(/* webpackChunkName: "pb" */ '@/components/views/PersonalBests.vue'),
            },
        ],
    })

    router.beforeEach((to, from, next) => {
        if (to.name === 'Login') {
            next()
        } else if (store.getters.isLoggedIn) {
            next()
        } else {
            next({ name: 'Login' })
        }
    })

    return router
}
