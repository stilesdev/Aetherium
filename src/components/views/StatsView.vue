<script lang="ts" setup>
    import { Chart } from 'highcharts'
    import moment from 'moment'
    import { computed, onMounted, watch } from 'vue'
    import { useSession } from '@/stores/session'
    import type { Solve } from '@/classes/solve'
    import type { ChartSeries, ChartSeriesEntry } from '@/types'
    import { millisToTimerFormat } from '@/functions/millisToTimerFormat'
    import { millisToShortTimerFormat } from '@/functions/millisToShortTimerFormat'
    import { timestampToDateTime } from '@/functions/timestampToDateTime'

    const session = useSession()

    let sessionChart: Chart | undefined

    const allSolves = computed<ChartSeries>(() => session.solves.map((solve: Solve) => [solve.timestamp, solve.time] as ChartSeriesEntry).reverse())
    const bestSolves = computed(() => {
        const bestSolves: ChartSeries = []

        allSolves.value.forEach((solve) => {
            if (bestSolves.length === 0 || solve[1] < bestSolves[bestSolves.length - 1][1]) {
                bestSolves.push(solve)
            }
        })

        return bestSolves
    })

    // TODO: is deep: true necessary here? (Vue 3 deprecation WATCH_ARRAY)
    watch(allSolves, (newValue) => sessionChart?.series[0].setData(newValue), { deep: true })
    watch(bestSolves, (newValue) => sessionChart?.series[1].setData(newValue), { deep: true })

    onMounted(() => {
        sessionChart = new Chart('session-chart', {
            chart: {
                zooming: {
                    type: 'x',
                },
                type: 'line',
            },
            title: {
                text: 'Session Solves',
            },
            xAxis: {
                type: 'datetime',
                labels: {
                    formatter() {
                        return moment(this.value).format('h:mm A')
                    },
                },
            },
            yAxis: {
                title: {
                    text: 'Solve Time',
                },
                labels: {
                    formatter() {
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
                        formatter() {
                            return millisToShortTimerFormat(this.y as number)
                        },
                    },
                    marker: {
                        enabled: true,
                    },
                },
            },
            series: [
                {
                    name: 'Solve Time',
                    data: allSolves.value,
                    type: 'line',
                },
                {
                    name: 'Best Time',
                    data: bestSolves.value,
                    dashStyle: 'Dash',
                    color: '#FFD280',
                    type: 'line',
                },
            ],
            tooltip: {
                formatter() {
                    return `<b>${timestampToDateTime(this.x as number)}</b><br/>${millisToTimerFormat(this.y as number)}`
                },
            },
        })
    })
</script>

<template>
    <div class="container-fluid">
        <div id="session-chart" />
    </div>
</template>

<style>
    #session-chart {
        height: 80vh;
        width: 95vw;
    }
</style>
