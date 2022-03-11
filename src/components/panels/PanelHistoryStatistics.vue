<template>
    <panel panelTitle="Statistics">
        <table class="table table-condensed">
            <tbody>
                <tr>
                    <td>Best Daily Mean</td>
                    <td>{{ bestDailyMean.time }}</td>
                    <td>{{ bestDailyMean.date }}</td>
                </tr>
                <tr>
                    <td>Best Single</td>
                    <td>{{ bestSingle.time }}</td>
                    <td>{{ bestSingle.date }}</td>
                </tr>
                <tr>
                    <td>Best Mean of 3</td>
                    <td>{{ bestMo3.time }}</td>
                    <td>{{ bestMo3.date }}</td>
                </tr>
                <tr>
                    <td>Best Average of 5</td>
                    <td>{{ bestAo5.time }}</td>
                    <td>{{ bestAo5.date }}</td>
                </tr>
                <tr>
                    <td>Best Average of 12</td>
                    <td>{{ bestAo12.time }}</td>
                    <td>{{ bestAo12.date }}</td>
                </tr>
                <tr>
                    <td>Best Average of 50</td>
                    <td>{{ bestAo50.time }}</td>
                    <td>{{ bestAo50.date }}</td>
                </tr>
                <tr>
                    <td>Best Average of 100</td>
                    <td>{{ bestAo100.time }}</td>
                    <td>{{ bestAo100.date }}</td>
                </tr>
            </tbody>
        </table>
    </panel>
</template>

<script lang="ts">
    import PanelRoot from './PanelRoot.vue'

    export default {
        components: {
            panel: PanelRoot,
        },
    }
</script>

<script lang="ts" setup>
    import { computed } from 'vue'
    import { useStore } from '@/composables/useStore'
    import { millisToTimerFormat } from '@/functions/millisToTimerFormat'
    import type { StatisticsPayload } from '@/types/firebase'
    import type { Statistics } from '@/types'

    const store = useStore()

    const sessionsArray = computed<Statistics[]>(() => {
        const allSessions = store.state.allSessions
        const allStats = store.state.allStats
        const sessions: Statistics[] = []
        if (allSessions && allStats) {
            Object.entries(allStats).forEach((entry) => {
                const sessionId = entry[0]
                const stat = Object.assign({}, entry[1]) as Statistics
                stat.date = allSessions[sessionId].date
                sessions.push(stat)
            })
        }
        return sessions
    })

    const bestDailyMean = computed(() => findBestSession('mean'))
    const bestSingle = computed(() => findBestSession('best'))
    const bestMo3 = computed(() => findBestSession('bestMo3'))
    const bestAo5 = computed(() => findBestSession('bestAo5'))
    const bestAo12 = computed(() => findBestSession('bestAo12'))
    const bestAo50 = computed(() => findBestSession('bestAo50'))
    const bestAo100 = computed(() => findBestSession('bestAo100'))

    const findBestSession = (statistic: keyof StatisticsPayload): { time: string; date?: string } => {
        const filteredSessions = sessionsArray.value.filter((session: Statistics) => session[statistic] > 0)

        if (filteredSessions.length > 0) {
            const session = filteredSessions.reduce((previous, current) => (previous[statistic] < current[statistic] ? previous : current))
            return {
                time: millisToTimerFormat(session[statistic]),
                date: session.date,
            }
        } else {
            return { time: millisToTimerFormat(0), date: undefined }
        }
    }
</script>
