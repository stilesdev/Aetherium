<template>
    <div id="app">
        <div class="container-fluid">
            <div id="timerTouchArea" v-on:touchend="">
                <div class="row">
                    <div id="scrambleArea" class="col-md-10 col-md-offset-1">
                        <h3 id="scrambleLabel" v-if="scramble.text">{{ scramble.text }}</h3>
                        <h3 v-else>No valid scrambler available for this puzzle</h3>
                    </div>
                </div>
                <div class="row">
                    <div id="timerArea">
                        <h1 id="timerLabel">00:00.00</h1>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script src="./Timer.js"></script>
<style src="./Timer.css"></style>