<template>
    <div id="app">
        <div class="container-fluid">
            <div id="timerTouchArea" v-on:touchstart="timerState.triggerDown()" v-on:touchend="timerState.triggerUp()"> <!-- this needs to go to 100vh height when timing -->
                <div class="row">
                    <transition name="fade">
                        <div id="scrambleArea" class="col-md-10 col-md-offset-1" v-if="!hideUI">
                            <h3>{{ scramble.text }}</h3>
                        </div>
                    </transition>
                </div>

                <div class="row"> <!-- This needs to be verically aligned in the parent div -->
                    <div id="timerArea">
                        <h1 id="timerLabel" v-bind:class="timerClass">{{ timerLabel }}</h1>
                    </div>
                </div>
            </div>

            <transition name="fade">
                <div id="timerInfoArea" v-if="!hideUI">
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
            </transition>
        </div>
    </div>
</template>
<script src="./Timer.js"></script>
<style src="./Timer.css"></style>