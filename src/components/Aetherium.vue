<template>
    <div id="app">
        <link rel="stylesheet" :href="themeUrl">
        <transition name="fade">
            <navbar v-if="showNavbar"></navbar>
        </transition>

        <router-view></router-view>
    </div>
</template>

<script lang="ts">
    import { Vue, Component } from 'vue-property-decorator'
    import Navbar from './Navbar.vue'

    @Component({
        components: {Navbar}
    })
    export default class Aetherium extends Vue {
        get showNavbar(): boolean {
            return !this.$store.state.hideUI && this.$route.name !== 'Login'
        }
        get themeUrl(): string {
            return this.$store.state.options.themeUrl
        }
    }
</script>

<style>
    .fade-enter-active, .fade-leave-active {
        transition: opacity .5s;
    }
    .fade-enter, .fade-leave-to {
        opacity: 0;
    }
</style>
