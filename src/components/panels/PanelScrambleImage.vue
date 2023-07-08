<script lang="ts" setup>
    import { useScramble } from '@/stores/scramble'
    import Panel from './PanelRoot.vue'

    const scramble = useScramble()
</script>

<template>
    <Panel panel-title="Scramble Image">
        <!-- eslint-disable-next-line vue/no-v-html -->
        <div v-html="scramble.svg" />
    </Panel>
</template>
