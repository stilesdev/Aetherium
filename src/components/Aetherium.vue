<template>
    <div id="app">
        <login v-if="!loggedIn"></login>
        <div v-else>
            <navbar></navbar>
            <div v-if="activeView === 'timer'">
                <timer></timer>
            </div>
            <div v-if="activeView === 'stats'">
                <stats></stats>
            </div>
        </div>
    </div>
</template>

<script src="./Aetherium.js"></script>