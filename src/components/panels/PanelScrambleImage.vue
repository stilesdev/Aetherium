<template>
    <panel panelTitle="Scramble Image">
        <div v-html="scrambleImage"></div>
    </panel>
</template>

<script lang="ts">
    import Vue from 'vue'
    import { Component } from 'vue-property-decorator'
    import PanelRoot from './PanelRoot.vue'

    @Component({
        components: { panel: PanelRoot },
    })
    export default class PanelScrambleImage extends Vue {
        get scrambleImage(): string {
            return this.$store.state.scramble.svg
        }
    }
</script>
