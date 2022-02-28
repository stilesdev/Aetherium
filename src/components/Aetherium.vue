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
    import Navbar from './Navbar.vue'

    export default {
        components: {
            Navbar,
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
    .fade-enter,
    .fade-leave-to {
        opacity: 0;
    }
</style>
