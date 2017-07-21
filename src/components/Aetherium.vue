<template>
    <div id="app">
        <login v-if="!$store.state.userId"></login>
        <div v-else>
            Logged in!
        </div>
    </div>
</template>

<script src="./Aetherium.js"></script>