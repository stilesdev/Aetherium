<template>
    <div id="app">
        <login v-if="!loggedIn"></login>
        <div v-else>
            <link rel="stylesheet" v-bind:href="themeUrl">
            <navbar></navbar>
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

<script>
    import Login from './Login.vue';
    import Navbar from './Navbar.vue';
    import Timer from './views/Timer.vue';
    import Stats from './views/Stats.vue';
    import History from './views/History.vue';
    import PersonalBests from './views/PersonalBests.vue';

    export default {
        data: function() {
            return {}
        },
        computed: {
            loggedIn() {
                return this.$store.state.userId !== null;
            },
            themeUrl() {
                return this.$store.state.options.themeUrl;
            },
            activeView() {
                return this.$store.state.activeView;
            }
        },
        components: { Login, Navbar, Timer, Stats, History, PersonalBests }
    }
</script>