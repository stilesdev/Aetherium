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
    import Vue from 'vue'
    import { Component } from 'vue-property-decorator'
    import PanelRoot from './PanelRoot.vue'
    import { formatTimeDelta } from '@/util/format'
    import { FirebaseList, SessionPayload, StatisticsPayload } from '@/types/firebase'
    import { Statistics } from '@/types'

    @Component({
        components: { panel: PanelRoot }
    })
    export default class PanelHistoryStatistics extends Vue {
        get sessionsArray(): Statistics[] {
            const allSessions: FirebaseList<SessionPayload> = this.$store.state.allSessions
            const allStats: FirebaseList<StatisticsPayload> = this.$store.state.allStats
            const sessions: Statistics[] = []
            if (allSessions && allStats) {
                Object.entries(allStats).forEach(entry => {
                    const sessionId = entry[0]
                    const stat = entry[1] as Statistics
                    stat.date = allSessions[sessionId].date
                    sessions.push(stat)
                })
            }
            return sessions
        }

        get bestDailyMean(): { time: string; date?: string } {
            return this.findBestSession('mean')
        }

        get bestSingle(): { time: string; date?: string } {
            return this.findBestSession('best')
        }

        get bestMo3(): { time: string; date?: string } {
            return this.findBestSession('bestMo3')
        }

        get bestAo5(): { time: string; date?: string } {
            return this.findBestSession('bestAo5')
        }

        get bestAo12(): { time: string; date?: string } {
            return this.findBestSession('bestAo12')
        }

        get bestAo50(): { time: string; date?: string } {
            return this.findBestSession('bestAo50')
        }

        get bestAo100(): { time: string; date?: string } {
            return this.findBestSession('bestAo100')
        }

        private findBestSession(statistic: keyof StatisticsPayload): { time: string; date?: string } {
            const filteredSessions = this.sessionsArray.filter((session: Statistics) => session[statistic] > 0)

            if (filteredSessions.length > 0) {
                const session = filteredSessions.reduce((previous, current) => (previous[statistic] < current[statistic] ? previous : current))
                return {
                    time: formatTimeDelta(session[statistic]),
                    date: session.date
                }
            } else {
                return { time: formatTimeDelta(0), date: undefined }
            }
        }
    }
</script>
