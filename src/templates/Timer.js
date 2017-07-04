import * as $ from 'jquery';
import * as moment from 'moment';
import {Solve} from '../modules/Models.js';

let timerStart = 0;

export default {
    data: function() {
        return {
            timerLabel: '00:00.00'
        }
    },
    props: ['aetherium'],
    created: function() {
        let vApp = this;

        $(document).keydown(function(event) {
            if (event.which === 32) {
                event.preventDefault();
            }
        });

        $(document).keyup(function(event) {
            if (event.which === 32) {
                vApp.onSpacebarPress();
            }
        });
    },
    destroyed: function() {
        $(document).off();
    },
    methods: {
        formatSolve: Solve.formatTime,
        setPenalty: function(solve, penalty) {
            this.aetherium.setPenalty(solve, penalty);
        },
        deleteSolve: function(solveUid) {
            this.aetherium.deleteSolve(solveUid);
        },
        onSpacebarPress: function() {
            if (this.aetherium.options.timerTrigger === 'spacebar') {
                if (timerStart === 0) {
                    timerStart = moment().valueOf();

                    if (this.aetherium.options.showTimer) {
                        setTimeout(this.updateTimer, 10);
                    } else {
                        this.timerLabel = 'Solve!';
                    }
                } else {
                    let stop = moment().valueOf();
                    let start = timerStart;
                    timerStart = 0;
                    this.completeSolve(stop - start);
                }
            }
        },
        updateTimer: function() {
            if (timerStart !== 0) {
                this.timerLabel = Solve.formatTime(moment().valueOf() - timerStart);
                setTimeout(this.updateTimer, 30)
            }
        },
        completeSolve: function(delta) {
            this.timerLabel = Solve.formatTime(delta);

            if (this.aetherium.user) {
                this.aetherium.addSolve(delta);
            }

            this.aetherium.newScramble();
        }
    }
}