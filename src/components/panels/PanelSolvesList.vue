<template>
    <panel panelTitle="Session Solves">
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
                <td class="timestamp-column">{{ solve.getFormattedTimestamp() }}</td>
                <td class="time-column" v-bind:class="{ 'penalty-active': solve.penalty !== '' }">{{ solve.getFormattedTime() }}</td>
                <td class="scramble-column visible-md visible-lg">{{ solve.scramble }}</td>
                <td class="actions-column">
                    <span class="penalty-link" v-bind:class="{ 'penalty-active': solve.penalty === '+2' }" v-on:click="setPenalty(solve, '+2')">+2</span>
                    <span class="penalty-link" v-bind:class="{ 'penalty-active': solve.penalty === 'dnf' }" v-on:click="setPenalty(solve, 'dnf')">DNF</span>
                    <span class="penalty-link" v-on:click="deleteSolve(solve.uid)"><span class="glyphicon glyphicon-remove"></span></span>
                </td>
            </tr>
            </tbody>
        </table>
    </panel>
</template>

<script>
    import PanelRoot from './PanelRoot.vue'
    import * as Actions from '../../store/ActionTypes';

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
        },
        components: {
            'panel': PanelRoot
        }
    }
</script>

<style>
    .timestamp-column {
        width: 8em;
    }

    .time-column {
        width: 4em;
    }

    .scramble-column {
        text-align: justify;
        text-align-last: center;
    }

    .actions-column {
        width: 8em;
    }
</style>
