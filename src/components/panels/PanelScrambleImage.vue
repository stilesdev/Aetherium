<template>
    <panel panelTitle="Scramble Image">
        <div v-html="scramble.svg"></div>
    </panel>
</template>

<script lang="ts">
    import PanelRoot from './PanelRoot.vue'

    export default {
        components: {
            panel: PanelRoot,
        },
    }
</script>

<script lang="ts" setup>
    import { useScramble } from '@/stores/scramble'

    const scramble = useScramble()
</script>
