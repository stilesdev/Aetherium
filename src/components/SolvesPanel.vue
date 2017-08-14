<template>
    <div id="app">
        <div class="panel panel-default">
            <div class="panel-heading">
                <h3 class="panel-title">Solves this session</h3>
            </div>
            <div class="panel-body infoPanel">
                <h4 v-if="solves.length === 0">No Solves Yet!</h4>
                <table class="table table-striped" v-else>
                    <thead>
                        <tr class="visible-md visible-lg">
                            <td><strong>Timestamp</strong></td>
                            <td><strong>Time</strong></td>
                            <td><strong>Scramble</strong></td>
                            <td><strong>Actions</strong></td>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="solve in solves">
                            <td>{{ solve.getFormattedTimestamp() }}</td>
                            <td v-bind:class="{ 'penalty-active': solve.penalty !== '' }">{{ solve.getFormattedTime() }}</td>
                            <td class="visible-md visible-lg">{{ solve.scramble }}</td>
                            <td>
                                <span class="penalty-link" v-bind:class="{ 'penalty-active': solve.penalty === '+2' }" v-on:click="setPenalty(solve, '+2')">+2</span>
                                <span class="penalty-link" v-bind:class="{ 'penalty-active': solve.penalty === 'dnf' }" v-on:click="setPenalty(solve, 'dnf')">DNF</span>
                                <span class="penalty-link" v-on:click="deleteSolve(solve.uid)"><span class="glyphicon glyphicon-remove"></span></span>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</template>

<script>
    import { Solve } from '../modules/Models';
    import * as Actions from '../store/ActionTypes';

    export default {
        data: function() {
            return {}
        },
        computed: {
            solves() {
                return this.$store.state.solves;
            }
        },
        methods: {
            setPenalty(solve, newPenalty) {
                this.$store.dispatch(Actions.SET_PENALTY, {solve: solve, penalty: newPenalty});
            },
            deleteSolve(solveId) {
                this.$store.dispatch(Actions.DELETE_SOLVE, solveId);
            }
        }
    }
</script>

<style>
    #timeList {
        display: -webkit-flex;
        display: -moz-flex;
        display: -ms-flex;
        display: -o-flex;
        -webkit-flex-direction: column-reverse;
        -moz-flex-direction: column-reverse;
        -ms-flex-direction: column-reverse;
        -o-flex-direction: column-reverse;
    }

    .infoPanel {
        overflow-y: auto;
    }

    .penalty-link {
        padding-left: 1em;
        cursor: pointer;
        color: #337ab7;
    }

    .penalty-active {
        color: red;
    }
</style>