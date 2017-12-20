<template>
    <div id="panel-root" class="panel panel-default">
        <div id="panel-heading" class="panel-heading">
            <h3 class="panel-title">{{ panelTitle }}</h3>
        </div>
        <div id="panel-body" class="panel-body">
            <slot></slot>
        </div>
    </div>
</template>

<script>
    export default {
        data: function() {
            return {}
        },
        props: [ 'panelTitle' ]
    }
</script>

<style>
    #panel-root {

    }

    #panel-heading {
        text-align: center;
    }

    #panel-body {
        overflow-y: auto;
        text-align: center;
    }
</style>