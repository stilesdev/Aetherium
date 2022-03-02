<template>
    <div class="container-fluid">
        <div id="sessionChart"></div>
    </div>
</template>

<script lang="ts" setup>
    import { Chart } from 'highcharts'
    import moment from 'moment'
    import { computed, onMounted, watch } from 'vue'
    import { useStore } from 'vuex'
    import { formatTimeDelta, formatTimeDeltaShort, formatTimestamp } from '@/util/format'
    import { Solve } from '@/classes/solve'
    import { ChartSeries } from '@/types'

    const store = useStore()

    let sessionChart: Chart | undefined

    const allSolves = computed<ChartSeries>(() => store.state.solves.map((solve: Solve) => [solve.timestamp, solve.time]).reverse())
    const bestSolves = computed<ChartSeries>(() => {
        const bestSolves: ChartSeries = []

        allSolves.value.forEach((solve) => {
            if (bestSolves.length === 0 || solve[1] < bestSolves[bestSolves.length - 1][1]) {
                bestSolves.push(solve)
            }
        })

        return bestSolves
    })

    // TODO: is deep: true necessary here? (Vue 3 deprecation WATCH_ARRAY)
    watch(allSolves, (newValue: ChartSeries) => sessionChart?.series[0].setData(newValue), { deep: true })
    watch(bestSolves, (newValue: ChartSeries) => sessionChart?.series[1].setData(newValue), { deep: true })

    onMounted(() => {
        sessionChart = new Chart('sessionChart', {
            chart: {
                zoomType: 'x',
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
                        formatter() {
                            return formatTimeDeltaShort(this.y as number)
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
                    return `<b>${formatTimestamp(this.x)}</b><br/>${formatTimeDelta(this.y)}`
                },
            },
        })
    })
</script>

<style>
    #sessionChart {
        height: 80vh;
        width: 95vw;
    }
</style>
