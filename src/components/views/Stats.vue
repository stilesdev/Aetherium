<template>
    <div class="container-fluid">
        <div id="sessionChart"></div>
    </div>
</template>

<script lang="ts">
    import { Chart } from 'highcharts'
    import moment from 'moment'
    import Vue from 'vue'
    import { Component, Watch } from 'vue-property-decorator'
    import { formatTimeDelta, formatTimeDeltaShort, formatTimestamp } from '@/util/format'
    import { Solve } from '@/classes/solve'
    import { ChartSeries } from '@/types'

    @Component
    export default class Stats extends Vue {
        public sessionChart?: Chart

        get allSolves(): ChartSeries {
            return this.$store.state.solves.map((solve: Solve) => [solve.timestamp, solve.time]).reverse()
        }

        get bestSolves(): ChartSeries {
            const bestSolves: ChartSeries = []
            this.allSolves.forEach(solve => {
                if (bestSolves.length === 0 || solve[1] < bestSolves[bestSolves.length - 1][1]) {
                    bestSolves.push(solve)
                }
            })

            return bestSolves
        }

        @Watch('allSolves')
        public onAllSolvesChange(newValue: ChartSeries): void {
            this.sessionChart?.series[0]?.setData(newValue)
        }

        @Watch('bestSolves')
        public onBestSolvesChange(newValue: ChartSeries): void {
            this.sessionChart?.series[1]?.setData(newValue)
        }

        public mounted(): void {
            this.sessionChart = new Chart('sessionChart', {
                chart: {
                    zoomType: 'x',
                    type: 'line'
                },
                title: {
                    text: 'Session Solves'
                },
                xAxis: {
                    type: 'datetime',
                    labels: {
                        formatter() {
                            return moment(this.value).format('h:mm A')
                        }
                    }
                },
                yAxis: {
                    title: {
                        text: 'Solve Time'
                    },
                    labels: {
                        formatter() {
                            return formatTimeDelta(this.value)
                        }
                    },
                    min: 0
                },
                lang: {
                    noData: 'No solves yet!'
                },
                legend: {
                    enabled: true
                },
                plotOptions: {
                    line: {
                        dataLabels: {
                            enabled: true,
                            formatter() {
                                return formatTimeDeltaShort(this.y as number)
                            }
                        },
                        marker: {
                            enabled: true
                        }
                    }
                },
                series: [
                    {
                        name: 'Solve Time',
                        data: this.allSolves,
                        type: 'line'
                    },
                    {
                        name: 'Best Time',
                        data: this.bestSolves,
                        dashStyle: 'Dash',
                        color: '#FFD280',
                        type: 'line'
                    }
                ],
                tooltip: {
                    formatter() {
                        return `<b>${formatTimestamp(this.x)}</b><br/>${formatTimeDelta(this.y)}`
                    }
                }
            })
        }
    }
</script>

<style>
    #sessionChart {
        height: 80vh;
        width: 95vw;
    }
</style>
