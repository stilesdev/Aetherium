<template>
    <div id="app">
        <link rel="stylesheet" :href="options.themeUrl" />
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
    import { useStore } from '@/composables/useStore'
    import { useOptions } from '@/stores/options'

    const store = useStore()
    const options = useOptions()
    const route = useRoute()

    const showNavbar = computed(() => !store.state.hideUI && route.name !== 'Login')
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
