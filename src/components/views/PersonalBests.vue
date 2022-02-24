<template>
    <div class="container-fluid">
        <table class="table table-striped text-center">
            <thead>
                <tr class="h3">
                    <td></td>
                    <td>Single</td>
                    <td>Mean of 3</td>
                    <td>Avg of 5</td>
                    <td>Avg of 12</td>
                    <td>Avg of 50</td>
                    <td>Avg of 100</td>
                </tr>
            </thead>
            <tbody>
                <template v-for="puzzle in puzzles">
                    <tr class="h4" :key="puzzle.key" v-if="personalBests[puzzle.key]">
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
                    <tr :key="puzzle.key + '-date'" v-if="personalBests[puzzle.key]">
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

<script lang="ts">
    import { DatabaseReference, get, getDatabase, ref } from 'firebase/database'
    import Vue from 'vue'
    import { Component } from 'vue-property-decorator'
    import { formatTimeDelta, formatTimeDeltaShort } from '@/util/format'
    import { FirebaseList, Puzzle, SessionPayload, StatisticsPayload } from '@/types/firebase'
    import { Statistics } from '@/types'

    @Component
    export default class PersonalBests extends Vue {
        public personalBests: Record<string, unknown> = {} // TODO: define a type for this

        get userId(): string {
            return this.$store.state.userId
        }

        get puzzles(): Puzzle[] {
            const puzzles: FirebaseList<Puzzle> = this.$store.state.puzzles
            return Object.values(puzzles).sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
        }

        get allSessions(): FirebaseList<SessionPayload> {
            return this.$store.state.allSessions
        }

        get puzzleStatsRef(): (puzzle: string) => DatabaseReference {
            return (puzzle) => ref(getDatabase(), `/stats/${this.userId}/${puzzle}`)
        }

        public findBestStatistics(allSessions: Statistics[]): Record<string, unknown> {
            return {
                best: this.findBestStatistic(allSessions, 'best'),
                bestMo3: this.findBestStatistic(allSessions, 'bestMo3'),
                bestAo5: this.findBestStatistic(allSessions, 'bestAo5'),
                bestAo12: this.findBestStatistic(allSessions, 'bestAo12'),
                bestAo50: this.findBestStatistic(allSessions, 'bestAo50'),
                bestAo100: this.findBestStatistic(allSessions, 'bestAo100'),
            }
        }

        public findBestStatistic(sessions: Statistics[], statistic: keyof StatisticsPayload): { time: string; date?: string } {
            const filteredSessions = sessions.filter((session) => session[statistic] > 0)

            if (filteredSessions.length > 0) {
                const session = filteredSessions.reduce((previous, current) => (previous[statistic] < current[statistic] ? previous : current))
                return {
                    time: formatTimeDeltaShort(session[statistic]),
                    date: session.date,
                }
            } else {
                return { time: formatTimeDelta(0), date: undefined }
            }
        }

        public mounted(): void {
            this.puzzles.forEach((puzzle) => {
                get(this.puzzleStatsRef(puzzle.key)).then((snapshot) => {
                    const allStats: FirebaseList<Statistics> = snapshot.val()
                    const sessions: Statistics[] = []
                    if (allStats && this.allSessions) {
                        Object.entries(allStats).forEach((entry) => {
                            const sessionId = entry[0]
                            const stat = entry[1]
                            stat.date = this.allSessions[sessionId].date
                            sessions.push(stat)
                        })
                    }

                    Vue.set(this.personalBests, puzzle.key, this.findBestStatistics(sessions))
                })
            })
        }
    }
</script>
