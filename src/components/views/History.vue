<template>
    <div class="container-fluid">
        <div id="sessionHistoryChart"></div>
        <panel-history-statistics></panel-history-statistics>
    </div>
</template>

<script lang="ts">
    import { Chart } from 'highcharts'
    import moment from 'moment'
    import Vue from 'vue'
    import { Component, Watch } from 'vue-property-decorator'

    import PanelHistoryStatistics from '@/components/panels/PanelHistoryStatistics.vue'
    import { formatTimeDelta, formatTimeDeltaShort } from '@/util/format'
    import { FirebaseList, SessionPayload, StatisticsPayload } from '@/types/firebase'
    import { ChartSeries } from '@/types'

    @Component({
        components: { 'panel-history-statistics': PanelHistoryStatistics }
    })
    export default class History extends Vue {
        public sessionHistoryChart?: Chart

        get sessionMeans(): ChartSeries {
            const sessions: FirebaseList<SessionPayload> = this.$store.state.allSessions
            const stats: FirebaseList<StatisticsPayload> = this.$store.state.allStats
            return stats ? Object.entries(stats).map(stat => [sessions[stat[0]].timestamp, stat[1].mean]) : []
        }

        get sessionBests(): ChartSeries {
            const sessions: FirebaseList<SessionPayload> = this.$store.state.allSessions
            const stats: FirebaseList<StatisticsPayload> = this.$store.state.allStats
            return stats ? Object.entries(stats).map(stat => [sessions[stat[0]].timestamp, stat[1].best]) : []
        }

        get personalBests(): ChartSeries {
            const personalBests: ChartSeries = []
            this.sessionBests.forEach(bestTime => {
                if (personalBests.length === 0 || bestTime[1] < personalBests[personalBests.length - 1][1]) {
                    personalBests.push(bestTime)
                }
            })

            return personalBests
        }

        @Watch('sessionMeans')
        public onSessionMeansChange(newValue: ChartSeries): void {
            this.sessionHistoryChart?.series[0]?.setData(newValue)
        }

        @Watch('sessionBests')
        public onSessionBestsChange(newValue: ChartSeries): void {
            this.sessionHistoryChart?.series[1]?.setData(newValue)
        }

        @Watch('personalBests')
        public onPersonalBestsChange(newValue: ChartSeries): void {
            this.sessionHistoryChart?.series[2]?.setData(newValue)
        }

        public mounted(): void {
            this.sessionHistoryChart = new Chart('sessionHistoryChart', {
                chart: {
                    zoomType: 'x',
                    type: 'line'
                },
                title: {
                    text: 'Session History'
                },
                xAxis: {
                    type: 'datetime',
                    dateTimeLabelFormats: {
                        day: {
                            main: '%m/%d/%Y'
                        }
                    },
                    tickInterval: 86400000,
                    startOnTick: false
                },
                yAxis: {
                    title: {
                        text: 'Solve Time'
                    },
                    labels: {
                        formatter(): string {
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
                            formatter(): string {
                                return this.y ? formatTimeDeltaShort(this.y) : ''
                            }
                        },
                        marker: {
                            enabled: true
                        },
                        turboThreshold: 0
                    }
                },
                series: [
                    {
                        type: 'line',
                        name: 'Session Mean',
                        data: this.sessionMeans
                    },
                    {
                        type: 'line',
                        name: 'Session Best',
                        data: this.sessionBests
                    },
                    {
                        type: 'line',
                        name: 'Personal Best',
                        data: this.personalBests,
                        dashStyle: 'Dash',
                        marker: {
                            symbol: 'triangle-down'
                        }
                    }
                ],
                tooltip: {
                    formatter(): string {
                        return `<b>${moment(this.x)
                            .utc()
                            .format('M/D/YYYY')}</b><br/>${formatTimeDelta(this.y)}`
                    }
                }
            })
        }
    }
</script>

<style>
    #sessionHistoryChart {
        height: 60vh;
        width: 95vw;
    }
</style>
