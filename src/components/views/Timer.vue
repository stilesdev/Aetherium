<template>
    <div id="app">
        <div class="container-fluid">
            <div id="timerTouchArea" v-on:touchstart="timerState.triggerDown()" v-on:touchend="timerState.triggerUp()">
                <div class="row">
                    <div id="scrambleArea" class="col-md-10 col-md-offset-1" v-if="timerState.state === 'idle' || timerState.state === 'complete'">
                        <h3 v-if="generatingScramble">Generating scramble...</h3>
                        <h3 v-else>{{ scramble.text }}</h3>
                    </div>
                </div>
                <div class="row">
                    <div id="timerArea">
                        <h1 id="timerLabel" v-bind:class="timerClass">{{ timerLabel }}</h1>
                    </div>
                </div>
            </div>

            <div id="timerInfoArea">
                <div class="col-md-3 visible-md visible-lg">
                    <stats-panel></stats-panel>
                </div>
                <div class="col-md-6 col-xs-12 col-sm-12">
                    <solves-panel></solves-panel>
                </div>
                <div class="col-md-3 visible-md visible-lg">
                    <scramble-panel></scramble-panel>
                </div>
            </div>
        </div>
    </div>
</template>
<script src="./Timer.js"></script>
<style src="./Timer.css"></style>