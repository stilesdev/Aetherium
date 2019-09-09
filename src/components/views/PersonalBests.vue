<template>
    <div class="container-fluid">
        <table class="table table-striped text-center">
            <thead>
                <tr class="h3"><td></td><td>Single</td><td>Mean of 3</td><td>Avg of 5</td><td>Avg of 12</td><td>Avg of 50</td><td>Avg of 100</td></tr>
            </thead>
            <tbody>
                <template v-for="puzzle in puzzles" v-if="personalBests[puzzle.key]">
                    <tr class="h4">
                        <td rowspan="2"><h3>{{puzzle.name}}</h3></td>
                        <td>{{personalBests[puzzle.key].best.time}}</td>
                        <td>{{personalBests[puzzle.key].bestMo3.time}}</td>
                        <td>{{personalBests[puzzle.key].bestAo5.time}}</td>
                        <td>{{personalBests[puzzle.key].bestAo12.time}}</td>
                        <td>{{personalBests[puzzle.key].bestAo50.time}}</td>
                        <td>{{personalBests[puzzle.key].bestAo100.time}}</td>
                    </tr>
                    <tr>
                        <td>{{personalBests[puzzle.key].best.date}}</td>
                        <td>{{personalBests[puzzle.key].bestMo3.date}}</td>
                        <td>{{personalBests[puzzle.key].bestAo5.date}}</td>
                        <td>{{personalBests[puzzle.key].bestAo12.date}}</td>
                        <td>{{personalBests[puzzle.key].bestAo50.date}}</td>
                        <td>{{personalBests[puzzle.key].bestAo100.date}}</td>
                    </tr>
                </template>
            </tbody>
        </table>
    </div>
</template>

<script lang="ts">
    import { database } from 'firebase'
    import Vue from 'vue'
    import { Component } from 'vue-property-decorator'
    import { formatTimeDelta, formatTimeDeltaShort } from '@/util/format'
    import { ISession, Session, Statistics } from '@/types'

    @Component
    export default class PersonalBests extends Vue {
        public personalBests: {} = {}

        get userId(): string {
            return this.$store.state.userId
        }

        get puzzles(): any[] {
            return Object.values(this.$store.state.puzzles).sort((a: any, b: any) => (a.sortOrder || 0) - (b.sortOrder || 0))
        }

        get allSessions(): { [id: string]: Session } {
            return this.$store.state.allSessions
        }

        get puzzleStatsRef(): (puzzle: string) => database.Reference {
            return (puzzle) => database().ref(`/stats/${this.userId}/${puzzle}`)
        }

        public findBestStatistics(allSessions: any[]): {} {
            return {
                best: this.findBestStatistic(allSessions, 'best'),
                bestMo3: this.findBestStatistic(allSessions, 'bestMo3'),
                bestAo5: this.findBestStatistic(allSessions, 'bestAo5'),
                bestAo12: this.findBestStatistic(allSessions, 'bestAo12'),
                bestAo50: this.findBestStatistic(allSessions, 'bestAo50'),
                bestAo100: this.findBestStatistic(allSessions, 'bestAo100')
            }
        }

        public findBestStatistic(sessions: any[], statistic: string): {time: string, date?: any} {
            const filteredSessions = sessions.filter(session => session[statistic] > 0)

            if (filteredSessions.length > 0) {
                const session = filteredSessions.reduce((previous, current) => previous[statistic] < current[statistic] ? previous : current)
                return {time: formatTimeDeltaShort(session[statistic]), date: session.date}
            } else {
                return {time: formatTimeDelta(0), date: null}
            }
        }

        public mounted(): void {
            this.puzzles.forEach(puzzle => {
                this.puzzleStatsRef(puzzle.key).once('value').then(snapshot => {
                    const allStats: { [id: string]: Statistics } = snapshot.val()
                    const sessions: Statistics[] = []
                    if (allStats && this.allSessions) {
                        Object.entries(allStats).forEach(entry => {
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
