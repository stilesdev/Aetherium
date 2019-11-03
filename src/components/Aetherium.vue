<template>
    <div id="app">
        <login v-if="!loggedIn"></login>
        <div v-else>
            <link rel="stylesheet" :href="themeUrl">
            <transition name="fade">
                <navbar v-if="showNavbar || activeView !== View.TIMER"></navbar>
            </transition>

            <div v-if="activeView === View.TIMER">
                <timer></timer>
            </div>
            <div v-if="activeView === View.STATS">
                <stats></stats>
            </div>
            <div v-if="activeView === View.HISTORY">
                <history></history>
            </div>
            <div v-if="activeView === View.PB">
                <personal-bests></personal-bests>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
    import Vue from 'vue'
    import { Component } from 'vue-property-decorator'
    import Login from './Login.vue'
    import Navbar from './Navbar.vue'
    import Timer from './views/Timer.vue'
    import Stats from './views/Stats.vue'
    import History from './views/History.vue'
    import PersonalBests from './views/PersonalBests.vue'
    import { View } from '@/types/store'

    @Component({
        components: {Login, Navbar, Timer, Stats, History, PersonalBests}
    })
    export default class Aetherium extends Vue {
        public View = View

        get showNavbar(): boolean {
            return !this.$store.state.hideUI
        }
        get loggedIn(): boolean {
            return this.$store.state.userId !== undefined
        }
        get themeUrl(): string {
            return this.$store.state.options.themeUrl
        }
        get activeView(): View {
            return this.$store.state.activeView
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
