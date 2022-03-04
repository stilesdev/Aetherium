<template>
    <div class="container-fluid">
        <div id="sessionHistoryChart"></div>
        <panel-history-statistics></panel-history-statistics>
    </div>
</template>

<script lang="ts">
    import PanelHistoryStatistics from '@/components/panels/PanelHistoryStatistics.vue'

    export default {
        components: {
            PanelHistoryStatistics,
        },
    }
</script>

<script lang="ts" setup>
    import { Chart } from 'highcharts'
    import moment from 'moment'
    import { computed, onMounted, watch } from 'vue'
    import { useStore } from 'vuex'
    import { formatTimeDelta, formatTimeDeltaShort } from '@/util/format'
    import type { FirebaseList, SessionPayload, StatisticsPayload } from '@/types/firebase'
    import type { ChartSeries } from '@/types'

    const store = useStore()

    let sessionHistoryChart: Chart | undefined

    const sessionMeans = computed<ChartSeries>(() => {
        const sessions: FirebaseList<SessionPayload> = store.state.allSessions
        const stats: FirebaseList<StatisticsPayload> = store.state.allStats
        return stats ? Object.entries(stats).map((stat) => [sessions[stat[0]].timestamp, stat[1].mean]) : []
    })

    const sessionBests = computed<ChartSeries>(() => {
        const sessions: FirebaseList<SessionPayload> = store.state.allSessions
        const stats: FirebaseList<StatisticsPayload> = store.state.allStats
        return stats ? Object.entries(stats).map((stat) => [sessions[stat[0]].timestamp, stat[1].best]) : []
    })

    const personalBests = computed<ChartSeries>(() => {
        const personalBests: ChartSeries = []
        sessionBests.value.forEach((bestTime) => {
            if (personalBests.length === 0 || bestTime[1] < personalBests[personalBests.length - 1][1]) {
                personalBests.push(bestTime)
            }
        })

        return personalBests
    })

    // TODO: is deep: true necessary here? (Vue 3 deprecation WATCH_ARRAY)
    watch(sessionMeans, (newValue: ChartSeries) => sessionHistoryChart?.series[0].setData(newValue), { deep: true })
    watch(sessionBests, (newValue: ChartSeries) => sessionHistoryChart?.series[1].setData(newValue), { deep: true })
    watch(personalBests, (newValue: ChartSeries) => sessionHistoryChart?.series[2].setData(newValue), { deep: true })

    onMounted(() => {
        sessionHistoryChart = new Chart('sessionHistoryChart', {
            chart: {
                zoomType: 'x',
                type: 'line',
            },
            title: {
                text: 'Session History',
            },
            xAxis: {
                type: 'datetime',
                dateTimeLabelFormats: {
                    day: {
                        main: '%m/%d/%Y',
                    },
                },
                tickInterval: 86400000,
                startOnTick: false,
            },
            yAxis: {
                title: {
                    text: 'Solve Time',
                },
                labels: {
                    formatter(): string {
                        return formatTimeDelta(this.value as number)
                    },
                },
                min: 0,
            },
            lang: {
                noData: 'No solves yet!',
            },
            legend: {
                enabled: true,
            },
            plotOptions: {
                line: {
                    dataLabels: {
                        enabled: true,
                        formatter(): string {
                            return this.y ? formatTimeDeltaShort(this.y) : ''
                        },
                    },
                    marker: {
                        enabled: true,
                    },
                    turboThreshold: 0,
                },
            },
            series: [
                {
                    type: 'line',
                    name: 'Session Mean',
                    data: sessionMeans.value,
                },
                {
                    type: 'line',
                    name: 'Session Best',
                    data: sessionBests.value,
                },
                {
                    type: 'line',
                    name: 'Personal Best',
                    data: personalBests.value,
                    dashStyle: 'Dash',
                    marker: {
                        symbol: 'triangle-down',
                    },
                },
            ],
            tooltip: {
                formatter(): string {
                    return `<b>${moment(this.x).utc().format('M/D/YYYY')}</b><br/>${formatTimeDelta(this.y)}`
                },
            },
        })
    })
</script>

<style>
    #sessionHistoryChart {
        height: 60vh;
        width: 95vw;
    }
</style>