import * as Highcharts from 'highcharts';
import * as moment from 'moment';
import { Solve } from '../../modules/Models.js';

export default {
    data: function() {
        return {
            sessionChart: null
        }
    },
    computed: {
        allSolves() {
            return this.$store.state.solves.map(solve => [solve.timestamp, solve.time]).reverse();
        },
        bestSolves() {
            let bestSolves = [];
            this.allSolves.forEach(solve => {
                if (bestSolves.length === 0 || solve[1] < bestSolves[bestSolves.length - 1][1]) {
                    bestSolves.push(solve);
                }
            });

            return bestSolves;
        }
    },
    watch: {
        allSolves: function(newValue) {
            this.sessionChart.series[0].setData(newValue);
        },
        bestSolves: function(newValue) {
            this.sessionChart.series[1].setData(newValue);
        }
    },
    mounted: function() {
        this.sessionChart = Highcharts.chart('sessionChart', {
            chart: {
                zoomType: 'x',
                type: 'line'
            },
            title: {
                text: 'Session Solves'
            },
            xAxis: {
                type: 'datetime',
                labels: {
                    formatter: function() { return moment(this.value).format('h:mm A') }
                }
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
                    name: 'Solve Time',
                    data: this.allSolves
                }, {
                    name: 'Best Time',
                    data: this.bestSolves,
                    dashStyle: 'Dash',
                    color: '#FFD280'
                }
            ],
            tooltip: {
                formatter: function() { return `<b>${Solve.formatTimestamp(this.x)}</b><br/>${Solve.formatTime(this.y)}` }
            }
        });
    }
}