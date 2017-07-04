<template>
    <div id="app">
        <div class="container-fluid noHighlight" v-if="aetherium">
            <div id="timerTouchArea" v-on:touchend="onSpacebarPress">
                <div class="row">
                    <div id="scrambleArea" class="col-md-10 col-md-offset-1">
                        <h3 id="scrambleLabel" v-if="aetherium.scramble.text">{{aetherium.scramble.text}}</h3>
                        <h3 v-else>No valid scrambler available for this puzzle</h3>
                    </div>
                </div>

                <div class="row">
                    <div id="timerArea">
                        <h1 id="timerLabel">{{timerLabel}}</h1>
                    </div>
                </div>
            </div>

            <div id="timerInfoPanel">
                <div class="col-md-3 visible-md visible-lg">
                    <div id="statsPanel" class="panel panel-default">
                        <div class="panel-heading">
                            <h3 class="panel-title">Statistics</h3>
                        </div>
                        <div class="panel-body infoPanel">
                            <table class="table table-condensed" v-if="aetherium.session">
                                <tbody>
                                    <tr>
                                        <td>Mean</td><td>{{ formatSolve(aetherium.session.stats.mean) }}</td>
                                        <td></td><td></td>
                                    </tr>
                                    <tr>
                                        <td>Count</td><td>{{ aetherium.session.stats.count }}</td>
                                        <td>Best</td><td>{{ formatSolve(aetherium.session.stats.best) }}</td>
                                    </tr>
                                    <tr>
                                        <td>Std Dev</td><td>{{ formatSolve(aetherium.session.stats.stdDev) }}</td>
                                        <td>Worst</td><td>{{ formatSolve(aetherium.session.stats.worst) }}</td>
                                    </tr>
                                    <tr>
                                        <td>Mo3</td><td>{{ formatSolve(aetherium.session.stats.mo3) }}</td>
                                        <td>Best Mo3</td><td>{{ formatSolve(aetherium.session.stats.bestMo3) }}</td>
                                    </tr>
                                    <tr>
                                        <td>Ao5</td><td>{{ formatSolve(aetherium.session.stats.ao5) }}</td>
                                        <td>Best Ao5</td><td>{{ formatSolve(aetherium.session.stats.bestAo5) }}</td>
                                    </tr>
                                    <tr>
                                        <td>Ao12</td><td>{{ formatSolve(aetherium.session.stats.ao12) }}</td>
                                        <td>Best Ao12</td><td>{{ formatSolve(aetherium.session.stats.bestAo12) }}</td>
                                    </tr>
                                    <tr>
                                        <td>Ao50</td><td>{{ formatSolve(aetherium.session.stats.ao50) }}</td>
                                        <td>Best Ao50</td><td>{{ formatSolve(aetherium.session.stats.bestAo50) }}</td>
                                    </tr>
                                    <tr>
                                        <td>Ao100</td><td>{{ formatSolve(aetherium.session.stats.ao100) }}</td>
                                        <td>Best Ao100</td><td>{{ formatSolve(aetherium.session.stats.bestAo100) }}</td>
                                    </tr>
                                </tbody>
                            </table>
                            <h4 v-else>Loading...</h4>
                        </div>
                    </div>
                </div>

                <div class="col-md-6 col-xs-12 col-sm-12">
                    <div id="timeListPanel" class="panel panel-default timerInfoPanel">
                        <div class="panel-heading">
                            <h3 class="panel-title">Solves this session</h3>
                        </div>
                        <div class="panel-body infoPanel">
                            <div v-if="aetherium.session">
                                <h4 v-if="aetherium.session.solves.length === 0">No Solves Yet!</h4>
                                <table class="table table-striped" v-else>
                                    <thead>
                                        <tr class="visible-md visible-lg">
                                            <td><strong>Timestamp</strong></td>
                                            <td><strong>Score</strong></td>
                                            <td><strong>Scramble</strong></td>
                                            <td><strong>Actions</strong></td>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr v-for="solve in aetherium.session.solves">
                                            <td>{{ solve.getFormattedTimestamp() }}</td>
                                            <td v-bind:class="{'penalty-active': solve.penalty !== ''}">{{ solve.getFormattedTime() }}</td>
                                            <td class="visible-md visible-lg">{{ solve.scramble }}</td>
                                            <td>
                                                <span class="penalty-link" v-bind:class="{'penalty-active': solve.penalty === '+2'}" v-on:click="setPenalty(solve, '+2')">+2</span>
                                                <span class="penalty-link" v-bind:class="{'penalty-active': solve.penalty === 'dnf'}" v-on:click="setPenalty(solve, 'dnf')">DNF</span>
                                                <span class="penalty-link" v-on:click="deleteSolve(solve.uid)"><span class="glyphicon glyphicon-remove"></span></span>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            <h4 v-else>Loading...</h4>
                        </div>
                    </div>
                </div>

                <div class="col-md-3 visible-md visible-lg">
                    <div id="scrambleImagePanel" class="panel panel-default">
                        <div class="panel-heading">
                            <h3 class="panel-title">Scramble Image</h3>
                        </div>
                        <div id="scrambleImage" class="panel-body infoPanel">
                            <div v-html="aetherium.scramble.svg"></div>
                            <hr/>
                            <label for="sessionControls">Session Management</label>
                            <div class="center-block" id="sessionControls">
                                <button class="btn btn-primary" type="button" v-if="aetherium.session && aetherium.session.date" v-on:click="closeSession()">Close session for {{aetherium.session.date.format('M/D/YYYY')}}</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script src="./Timer.js"></script>
<style src="./Timer.css"></style>