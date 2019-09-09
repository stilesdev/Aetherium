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

<script lang="ts">
    import Vue from 'vue'
    import { Component, Prop } from 'vue-property-decorator'

    @Component
    export default class PanelRoot extends Vue {
        @Prop(String)
        public readonly panelTitle?: string
    }
</script>

<style>
    #panel-root {
        text-align: center;
    }

    #panel-body {
        overflow-y: auto;
    }
</style>
