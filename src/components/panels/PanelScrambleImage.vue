<template>
    <panel panelTitle="Scramble Image">
        <div v-html="scrambleImage"></div>
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
    import { computed } from 'vue'
    import { useStore } from 'vuex'

    const store = useStore()

    const scrambleImage = computed(() => store.state.scramble.svg)
</script>
