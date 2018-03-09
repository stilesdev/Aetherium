<template>
    <panel panelTitle="Statistics">
        <table class="table table-condensed">
            <tbody>
                <tr><td>Best Single</td><td>{{ bestSingle.time }}</td><td>{{ bestSingle.date }}</td></tr>
                <tr><td>Best Daily Mean</td><td>{{ bestDailyMean.time }}</td><td>{{ bestDailyMean.date }}</td></tr>
                <tr><td>Best Mean of 3</td><td>{{ bestMo3.time }}</td><td>{{ bestMo3.date }}</td></tr>
                <tr><td>Best Average of 5</td><td>{{ bestAo5.time }}</td><td>{{ bestAo5.date }}</td></tr>
                <tr><td>Best Average of 12</td><td>{{ bestAo12.time }}</td><td>{{ bestAo12.date }}</td></tr>
                <tr><td>Best Average of 50</td><td>{{ bestAo50.time }}</td><td>{{ bestAo50.date }}</td></tr>
                <tr><td>Best Average of 100</td><td>{{ bestAo100.time }}</td><td>{{ bestAo100.date }}</td></tr>
            </tbody>
        </table>
    </panel>
</template>

<script>
    import * as PanelRoot from './PanelRoot.vue';
    import { Solve } from '../../modules/Models';

    function findBestSession(sessions, statistic) {
        let filteredSessions = sessions.filter(session => session[statistic] > 0);

        if (filteredSessions.length > 0) {
            let session = filteredSessions.reduce((previous, current) => previous[statistic] < current[statistic] ? previous : current);
            return {time: Solve.formatTime(session[statistic]), date: session.date};
        } else {
            return {time: Solve.formatTime(0), date: null}
        }
    }

    export default {
        data: function() {
            return {}
        },
        computed: {
            sessionsArray() {
                let allSessions = this.$store.state.allSessions;
                let allStats = this.$store.state.allStats;
                let sessions = [];
                if (allSessions && allStats) {
                    Object.entries(allStats).forEach(entry => {
                        let sessionId = entry[0];
                        let stat = entry[1];
                        stat.date = allSessions[sessionId].date;
                        sessions.push(stat);
                    })
                }
                return sessions;
            },
            bestSingle() {
                return findBestSession(this.sessionsArray, 'best');
            },
            bestDailyMean() {
                return findBestSession(this.sessionsArray, 'mean');
            },
            bestMo3() {
                return findBestSession(this.sessionsArray, 'bestMo3')
            },
            bestAo5() {
                return findBestSession(this.sessionsArray, 'bestAo5');
            },
            bestAo12() {
                return findBestSession(this.sessionsArray, 'bestAo12');
            },
            bestAo50() {
                return findBestSession(this.sessionsArray, 'bestAo50');
            },
            bestAo100() {
                return findBestSession(this.sessionsArray, 'bestAo100');
            }
        },
        components: {
            'panel': PanelRoot
        }
    }
</script>

<style>

</style>