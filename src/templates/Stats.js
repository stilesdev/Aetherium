let Highcharts = require('highcharts');
import * as moment from 'moment';
require('highcharts/modules/exporting')(Highcharts);

import {Solve} from '../modules/Models.js';

export default {
    data: function() {
        return {
            sessionChart: null
        }
    },
    created: function() {
        let vApp = this;

        setTimeout(function() {
            let chartData = vApp.getChartData();

            vApp.sessionChart = Highcharts.chart('sessionChart', {
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
                        data: chartData.allSolves
                    }, {
                        name: 'Best Time',
                        data: chartData.bestSolves,
                        dashStyle: 'Dash',
                        color: '#FFD280'
                    }

                ],
                tooltip: {
                    formatter: function() { return `<b>${Solve.formatTimestamp(this.x)}</b><br/>${Solve.formatTime(this.y)}` }
                }
            })
        }, 100);
    },
    props: ['session'],
    methods: {
        getChartData() {
            let allSolves = this.session.solves.map(solve => [solve.timestamp, solve.time]).reverse();
            let bestSolves = [];
            allSolves.forEach(solve => {
                if (bestSolves.length === 0 || solve[1] < bestSolves[bestSolves.length - 1][1]) {
                    bestSolves.push(solve);
                }
            });

            return {
                allSolves: allSolves,
                bestSolves: bestSolves
            }
        }
    }
}