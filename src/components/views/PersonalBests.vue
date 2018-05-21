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
                        <td>{{personalBests[puzzle.key].mo3.time}}</td>
                        <td>{{personalBests[puzzle.key].ao5.time}}</td>
                        <td>{{personalBests[puzzle.key].ao12.time}}</td>
                        <td>{{personalBests[puzzle.key].ao50.time}}</td>
                        <td>{{personalBests[puzzle.key].ao100.time}}</td>
                    </tr>
                    <tr>
                        <td>{{personalBests[puzzle.key].best.date}}</td>
                        <td>{{personalBests[puzzle.key].mo3.date}}</td>
                        <td>{{personalBests[puzzle.key].ao5.date}}</td>
                        <td>{{personalBests[puzzle.key].ao12.date}}</td>
                        <td>{{personalBests[puzzle.key].ao50.date}}</td>
                        <td>{{personalBests[puzzle.key].ao100.date}}</td>
                    </tr>
                </template>
            </tbody>
        </table>
    </div>
</template>

<script>
    import * as firebase from 'firebase';
    import Vue from 'vue';
    import { Solve } from '../../modules/Models';

    export default {
        data: function() {
            return {
                personalBests: {}
            }
        },
        computed: {
            userId() {
                return this.$store.state.userId;
            },
            puzzles() {
                return Object.values(this.$store.state.puzzles).sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
            },
            allSessions() {
                return this.$store.state.allSessions;
            },
            puzzleStatsRef() {
                return (puzzle) => firebase.database().ref(`/stats/${this.userId}/${puzzle}`);
            }
        },
        mounted: function() {
            this.puzzles.forEach(puzzle => {
                this.puzzleStatsRef(puzzle.key).once('value').then(snapshot => {
                    let allStats = snapshot.val();
                    let sessions = [];
                    if (allStats && this.allSessions) {
                        Object.entries(allStats).forEach(entry => {
                            let sessionId = entry[0];
                            let stat = entry[1];
                            stat.date = this.allSessions[sessionId].date;
                            sessions.push(stat);
                        });
                    }

                    Vue.set(this.personalBests, puzzle.key, this.findBestStatistics(sessions));
                });
            });
        },
        methods: {
            findBestStatistics(allSessions) {
                let bests = {
                    best: null,
                    mo3: null,
                    ao5: null,
                    ao12: null,
                    ao50: null,
                    ao100: null
                };

                Object.keys(bests).forEach(key => bests[key] = this.findBestStatistic(allSessions, key));
                return bests;
            },
            findBestStatistic(sessions, statistic) {
                let filteredSessions = sessions.filter(session => session[statistic] > 0);

                if (filteredSessions.length > 0) {
                    let session = filteredSessions.reduce((previous, current) => previous[statistic] < current[statistic] ? previous : current);
                    return {time: Solve.formatTimeShort(session[statistic]), date: session.date};
                } else {
                    return {time: Solve.formatTime(0), date: null}
                }
            }
        }
    }
</script>

<style scoped>

</style>