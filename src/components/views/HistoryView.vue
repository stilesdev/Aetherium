<script lang="ts" setup>
    import { Chart } from 'highcharts'
    import moment from 'moment'
    import { computed, onMounted, watch } from 'vue'
    import { useSessionHistory } from '@/stores/sessionHistory'
    import type { ChartSeries } from '@/types'
    import { millisToTimerFormat } from '@/functions/millisToTimerFormat'
    import { millisToShortTimerFormat } from '@/functions/millisToShortTimerFormat'
    import PanelHistoryStatistics from '@/components/panels/PanelHistoryStatistics.vue'

    const sessionHistory = useSessionHistory()

    let sessionHistoryChart: Chart | undefined

    const sessionMeans = computed<ChartSeries>(() => {
        const sessions = sessionHistory.allSessions
        const stats = sessionHistory.allStats

        return sessions && stats ? Object.entries(stats).map((stat) => [sessions[stat[0]].timestamp, stat[1].mean]) : []
    })

    const sessionBests = computed<ChartSeries>(() => {
        const sessions = sessionHistory.allSessions
        const stats = sessionHistory.allStats

        return sessions && stats ? Object.entries(stats).map((stat) => [sessions[stat[0]].timestamp, stat[1].best]) : []
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
    watch(sessionMeans, (newValue) => sessionHistoryChart?.series[0].setData(newValue), { deep: true })
    watch(sessionBests, (newValue) => sessionHistoryChart?.series[1].setData(newValue), { deep: true })
    watch(personalBests, (newValue) => sessionHistoryChart?.series[2].setData(newValue), { deep: true })

    onMounted(() => {
        sessionHistoryChart = new Chart('session-history-chart', {
            chart: {
                zooming: {
                    type: 'x',
                },
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
                        return millisToTimerFormat(this.value as number)
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
                            return this.y ? millisToShortTimerFormat(this.y) : ''
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
                    return `<b>${moment(this.x).utc().format('M/D/YYYY')}</b><br/>${millisToTimerFormat(this.y as number)}`
                },
            },
        })
    })
</script>

<template>
    <div class="container-fluid">
        <div id="session-history-chart" />
        <PanelHistoryStatistics />
    </div>
</template>

<style>
    #session-history-chart {
        height: 60vh;
        width: 95vw;
    }
</style>
