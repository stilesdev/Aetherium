<script lang="ts" setup>
    import { get, getDatabase, ref as dbRef } from 'firebase/database'
    import { computed, onMounted, ref } from 'vue'
    import { usePuzzles } from '@/stores/puzzles'
    import { useUser } from '@/stores/user'
    import { useSessionHistory } from '@/stores/sessionHistory'
    import type { FirebaseList, StatisticsPayload } from '@/types/firebase'
    import type { Statistics } from '@/types'
    import { millisToTimerFormat } from '@/functions/millisToTimerFormat'
    import { millisToShortTimerFormat } from '@/functions/millisToShortTimerFormat'

    const puzzles = usePuzzles()
    const user = useUser()
    const sessionHistory = useSessionHistory()

    const personalBests = ref<Record<string, Record<string, { time: string; date: string | undefined }>>>({}) // TODO: define a type for this

    const userId = computed(() => user.userId)
    const allPuzzles = computed(() => (puzzles.allPuzzles ? Object.values(puzzles.allPuzzles).sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)) : []))
    const allSessions = computed(() => sessionHistory.allSessions)
    const puzzleStatsRef = computed(() => (puzzle: string) => dbRef(getDatabase(), `/stats/${userId.value}/${puzzle}`))

    const findBestStatistic = (sessions: Statistics[], statistic: keyof StatisticsPayload): { time: string; date: string | undefined } => {
        const filteredSessions = sessions.filter((session) => session[statistic] > 0)

        if (filteredSessions.length > 0) {
            const session = filteredSessions.reduce((previous, current) => (previous[statistic] < current[statistic] ? previous : current))

            return {
                time: millisToShortTimerFormat(session[statistic]),
                date: session.date,
            }
        } else {
            return { time: millisToTimerFormat(0), date: undefined }
        }
    }

    const findBestStatistics = (allSessions: Statistics[]): Record<string, { time: string; date: string | undefined }> => {
        return {
            best: findBestStatistic(allSessions, 'best'),
            bestMo3: findBestStatistic(allSessions, 'bestMo3'),
            bestAo5: findBestStatistic(allSessions, 'bestAo5'),
            bestAo12: findBestStatistic(allSessions, 'bestAo12'),
            bestAo50: findBestStatistic(allSessions, 'bestAo50'),
            bestAo100: findBestStatistic(allSessions, 'bestAo100'),
        }
    }

    onMounted(() => {
        allPuzzles.value.forEach((puzzle) => {
            get(puzzleStatsRef.value(puzzle.key)).then((snapshot) => {
                const allStats: FirebaseList<Statistics> = snapshot.val()
                const sessions: Statistics[] = []
                if (allStats && allSessions.value) {
                    Object.entries(allStats).forEach((entry) => {
                        const sessionId = entry[0]
                        const stat = entry[1]
                        stat.date = allSessions.value ? allSessions.value[sessionId].date : ''
                        sessions.push(stat)
                    })
                }

                personalBests.value[puzzle.key] = findBestStatistics(sessions)
            })
        })
    })
</script>

<template>
    <div class="container-fluid">
        <table class="table table-striped text-center">
            <thead>
                <tr class="h3">
                    <td />
                    <td>Single</td>
                    <td>Mean of 3</td>
                    <td>Avg of 5</td>
                    <td>Avg of 12</td>
                    <td>Avg of 50</td>
                    <td>Avg of 100</td>
                </tr>
            </thead>
            <tbody>
                <template v-for="puzzle in allPuzzles">
                    <tr v-if="personalBests[puzzle.key]" :key="puzzle.key" class="h4">
                        <td rowspan="2">
                            <h3>{{ puzzle.name }}</h3>
                        </td>
                        <td>{{ personalBests[puzzle.key].best.time }}</td>
                        <td>{{ personalBests[puzzle.key].bestMo3.time }}</td>
                        <td>{{ personalBests[puzzle.key].bestAo5.time }}</td>
                        <td>{{ personalBests[puzzle.key].bestAo12.time }}</td>
                        <td>{{ personalBests[puzzle.key].bestAo50.time }}</td>
                        <td>{{ personalBests[puzzle.key].bestAo100.time }}</td>
                    </tr>
                    <tr v-if="personalBests[puzzle.key]" :key="`${puzzle.key}-date`">
                        <td>{{ personalBests[puzzle.key].best.date }}</td>
                        <td>{{ personalBests[puzzle.key].bestMo3.date }}</td>
                        <td>{{ personalBests[puzzle.key].bestAo5.date }}</td>
                        <td>{{ personalBests[puzzle.key].bestAo12.date }}</td>
                        <td>{{ personalBests[puzzle.key].bestAo50.date }}</td>
                        <td>{{ personalBests[puzzle.key].bestAo100.date }}</td>
                    </tr>
                </template>
            </tbody>
        </table>
    </div>
</template>
