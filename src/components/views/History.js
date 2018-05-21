import * as Highcharts from 'highcharts';
import * as moment from 'moment';
import { Solve } from '../../modules/Models.js';
import * as PanelHistoryStatistics from '../panels/PanelHistoryStatistics.vue';

export default {
    data: function() {
        return {
            sessionHistoryChart: null
        }
    },
    computed: {
        sessionMeans() {
            let sessions = this.$store.state.allSessions;
            let stats = this.$store.state.allStats;
            return stats ? Object.entries(stats).map(stats => [sessions[stats[0]].timestamp, stats[1].mean]) : [];
        },
        sessionBests() {
            let sessions = this.$store.state.allSessions;
            let stats = this.$store.state.allStats;
            return stats ? Object.entries(stats).map(stats => [sessions[stats[0]].timestamp, stats[1].best]) : [];
        },
        personalBests() {
            let personalBests = [];
            this.sessionBests.forEach(bestTime => {
                if (personalBests.length === 0 || bestTime[1] < personalBests[personalBests.length - 1][1]) {
                    personalBests.push(bestTime);
                }
            });

            return personalBests;
        }
    },
    watch: {
        sessionMeans: function(newValue) {
            this.sessionHistoryChart.series[0].setData(newValue);
        },
        sessionBests: function(newValue) {
            this.sessionHistoryChart.series[1].setData(newValue);
        },
        personalBests: function(newValue) {
            this.sessionHistoryChart.series[2].setData(newValue);
        }
    },
    mounted: function() {
        this.sessionHistoryChart = Highcharts.chart('sessionHistoryChart', {
            chart: {
                zoomType: 'x',
                type: 'line'
            },
            title: {
                text: 'Session History'
            },
            xAxis: {
                type: 'datetime',
                dateTimeLabelFormats: {
                    day: '%m/%d/%Y'
                },
                tickInterval: 86400000,
                startOnTick: false
            },
            yAxis: {
                title: {
                    text: 'Solve Time'
                },
                labels: {
                    formatter: function() { return Solve.formatTime(this.value) }
                },
                min: 0
            },
            lang: {
                noData: "No solves yet!"
            },
            legend: {
                enabled: true
            },
            plotOptions: {
                line: {
                    dataLabels: {
                        enabled: true,
                        formatter: function() { return Solve.formatTimeShort(this.y) }
                    },
                    marker: {
                        enabled: true
                    }
                }
            },
            series: [
                {
                    name: 'Session Mean',
                    data: this.sessionMeans,
                    turboThreshold: 0
                },
                {
                    name: 'Session Best',
                    data: this.sessionBests,
                    turboThreshold: 0
                },
                {
                    name: 'Personal Best',
                    data: this.personalBests,
                    dashStyle: 'Dash',
                    marker: {
                        symbol: 'triangle-down'
                    },
                    turboThreshold: 0
                }
            ],
            tooltip: {
                formatter: function() { return `<b>${moment(this.x).utc().format('M/D/YYYY')}</b><br/>${Solve.formatTime(this.y)}` }
            }
        });
    },
    components: {
        'panel-history-statistics': PanelHistoryStatistics
    }
}