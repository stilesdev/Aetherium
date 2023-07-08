<script lang="ts" setup>
    import { computed } from 'vue'
    import { useRoute } from 'vue-router'
    import { useOptions } from '@/stores/options'
    import { useIsSolving } from '@/composables/useIsSolving'
    import AppNavbar from './AppNavbar.vue'

    const options = useOptions()
    const route = useRoute()

    const { isSolving } = useIsSolving()

    const showNavbar = computed(() => !isSolving.value && route.name !== 'Login')
</script>

<template>
    <div id="app">
        <link rel="stylesheet" :href="options.themeUrl">
        <Transition name="fade">
            <AppNavbar v-if="showNavbar" />
        </Transition>

        <RouterView />
    </div>
</template>

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
