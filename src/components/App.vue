<template>
    <div id="app">
        <link rel="stylesheet" :href="themeUrl" />
        <transition name="fade">
            <navbar v-if="showNavbar"></navbar>
        </transition>

        <router-view></router-view>
    </div>
</template>

<script lang="ts">
    import AppNavbar from './AppNavbar.vue'

    export default {
        components: {
            navbar: AppNavbar,
        },
    }
</script>

<script lang="ts" setup>
    import { computed } from 'vue'
    import { useRoute } from 'vue-router'
    import { useStore } from 'vuex'

    const store = useStore()
    const route = useRoute()

    const showNavbar = computed<boolean>(() => !store.state.hideUI && route.name !== 'Login')
    const themeUrl = computed<string>(() => store.state.options.themeUrl)
</script>

<style>
    .fade-enter-active,
    .fade-leave-active {
        transition: opacity 0.5s;
    }
    .fade-enter-from,
    .fade-leave-to {
        opacity: 0;
    }
</style>
