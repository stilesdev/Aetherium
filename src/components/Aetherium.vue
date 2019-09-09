<template>
    <div id="app">
        <login v-if="!loggedIn"></login>
        <div v-else>
            <link rel="stylesheet" :href="themeUrl">
            <transition name="fade">
                <navbar v-if="showNavbar || activeView !== 'timer'"></navbar>
            </transition>

            <div v-if="activeView === 'timer'">
                <timer></timer>
            </div>
            <div v-if="activeView === 'stats'">
                <stats></stats>
            </div>
            <div v-if="activeView === 'history'">
                <history></history>
            </div>
            <div v-if="activeView === 'pb'">
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

    @Component({
        components: {Login, Navbar, Timer, Stats, History, PersonalBests}
    })
    export default class Aetherium extends Vue {
        get showNavbar(): boolean {
            return !this.$store.state.hideUI
        }
        get loggedIn(): boolean {
            return this.$store.state.userId !== null
        }
        get themeUrl(): string {
            return this.$store.state.options.themeUrl
        }
        get activeView(): string {
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
