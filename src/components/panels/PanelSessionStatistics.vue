<template>
    <div id="app">
        <panel panelTitle="Statistics">
            <table class="table table-condensed" v-if="stats">
                <tbody>
                    <tr>
                        <td>Mean</td>
                        <td>{{ formatSolve(stats.mean) }}</td>
                        <td></td>
                        <td></td>
                    </tr>
                    <tr>
                        <td>Count</td>
                        <td>{{ stats.count }}</td>
                        <td>Best</td>
                        <td>{{ formatSolve(stats.best) }}</td>
                    </tr>
                    <tr>
                        <td>Std Dev</td>
                        <td>{{ formatSolve(stats.stdDev) }}</td>
                        <td>Worst</td>
                        <td>{{ formatSolve(stats.worst) }}</td>
                    </tr>
                    <tr>
                        <td>Mo3</td>
                        <td>{{ formatSolve(stats.mo3) }}</td>
                        <td>Best Mo3</td>
                        <td>{{ formatSolve(stats.bestMo3) }}</td>
                    </tr>
                    <tr>
                        <td>Ao5</td>
                        <td>{{ formatSolve(stats.ao5) }}</td>
                        <td>Best Ao5</td>
                        <td>{{ formatSolve(stats.bestAo5) }}</td>
                    </tr>
                    <tr>
                        <td>Ao12</td>
                        <td>{{ formatSolve(stats.ao12) }}</td>
                        <td>Best Ao12</td>
                        <td>{{ formatSolve(stats.bestAo12) }}</td>
                    </tr>
                    <tr>
                        <td>Ao50</td>
                        <td>{{ formatSolve(stats.ao50) }}</td>
                        <td>Best Ao50</td>
                        <td>{{ formatSolve(stats.bestAo50) }}</td>
                    </tr>
                    <tr>
                        <td>Ao100</td>
                        <td>{{ formatSolve(stats.ao100) }}</td>
                        <td>Best Ao100</td>
                        <td>{{ formatSolve(stats.bestAo100) }}</td>
                    </tr>
                    <tr>
                        <td colspan="2">
                            <button class="btn btn-sm" @click="calculateAo1000">
                                Calculate Global Ao1000
                            </button>
                        </td>
                        <td>Global Ao1000</td>
                        <td>{{ formatSolve(ao1000) }}</td>
                    </tr>
                </tbody>
            </table>
            <div v-else>
                <h4>No Solves Yet!</h4>
            </div>
        </panel>
    </div>
</template>

<script lang="ts">
    import Vue from 'vue'
    import { Component, Watch } from 'vue-property-decorator'
    import PanelRoot from './PanelRoot.vue'
    import { formatTimeDelta } from '@/util/format'
    import firebase from 'firebase/app'
    import 'firebase/database'
    import { Solve } from '@/classes/solve'
    import { Stats } from '@/util/stats'
    import { StatisticsPayload } from '@/types/firebase'

    @Component({
        components: { panel: PanelRoot }
    })
    export default class PanelSessionStatistics extends Vue {
        public ao1000 = 0

        get stats(): StatisticsPayload | undefined {
            return this.$store.state.sessionStats
        }

        public formatSolve = formatTimeDelta

        public calculateAo1000(): void {
            this.$store.getters.solvesRef
                .orderByChild('timestamp')
                .limitToLast(1000)
                .once('value')
                .then((snapshot: firebase.database.DataSnapshot) => {
                    const solves: Solve[] = []
                    snapshot.forEach(childSnapshot => {
                        solves.push(Solve.fromSnapshot(childSnapshot))
                    })

                    this.ao1000 = Stats.average(solves)
                })
        }

        @Watch('stats')
        public onStatsChange(): void {
            this.ao1000 = 0
        }
    }
</script>
