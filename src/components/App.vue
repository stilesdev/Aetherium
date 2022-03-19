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
    import { useOptions } from '@/stores/options'
    import { useIsSolving } from '@/composables/useIsSolving'

    const options = useOptions()
    const route = useRoute()

    const { isSolving } = useIsSolving()

    const showNavbar = computed(() => !isSolving.value && route.name !== 'Login')
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
