import * as firebase from 'firebase';
import * as moment from 'moment';
let Highcharts = require('highcharts');
require('highcharts/modules/exporting')(Highcharts);

import {Solve} from '../modules/Models.js';

export default {
    data: function() {
        return {
            historyChart: null
        }
    },
    created: function() {
        let vApp = this;

        setTimeout(function() {
            vApp.historyChart = Highcharts.chart('historyChart', {
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
                        data: [[0, 0]],
                        turboThreshold: 0
                    },
                    {
                        name: 'Session Best',
                        data: [[0, 0]],
                        turboThreshold: 0
                    }

                ],
                tooltip: {
                    formatter: function() { return `<b>${moment(this.x).utc().format('M/D/YYYY')}</b><br/>${Solve.formatTime(this.y)}` }
                }
            });

            vApp.updateHistoryChartData();
        }, 100);
    },
    props: ['aetherium'],
    methods: {
        updateHistoryChartData: function() {
            firebase.database().ref(`/users/${this.aetherium.user.uid}/sessions/${this.aetherium.activePuzzle.key}/${this.aetherium.activeCategory.key}`).orderByKey().once('value').then(snapshot => {
                let meanOfSession = [];
                let bestOfSession = [];

                snapshot.forEach(sessionSnapshot => {
                    let session = sessionSnapshot.val();
                    if (session.stats) {
                        meanOfSession.push([session.date, session.stats.mean]);
                        bestOfSession.push([session.date, session.stats.best]);
                    }
                });

                this.historyChart.series[0].setData(meanOfSession);
                this.historyChart.series[1].setData(bestOfSession);
            })
        }
    }
}