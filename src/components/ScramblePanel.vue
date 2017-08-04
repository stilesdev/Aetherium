<template>
    <div id="app">
        <div id="scrambleImagePanel" class="panel panel-default">
            <div class="panel-heading">
                <h3 class="panel-title">Scramble Image</h3>
            </div>
            <div id="scrambleImage" class="panel-body infoPanel">
                <div v-html="scrambleImage"></div>
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        data: function() {
            return {}
        },
        computed: {
            scrambleImage() {
                return this.$store.state.scramble.svg;
            }
        }
    }
</script>