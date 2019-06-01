<template>
    <panel panelTitle="Scramble Image">
        <div v-html="scrambleImage"></div>
    </panel>
</template>

<script>
    import PanelRoot from './PanelRoot.vue'

    export default {
        data: function() {
            return {}
        },
        computed: {
            scrambleImage() {
                return this.$store.state.scramble.svg
            }
        },
        components: {
            'panel': PanelRoot
        }
    }
</script>
