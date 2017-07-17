import * as $ from 'jquery';
import * as moment from 'moment';
import {Solve} from '../modules/Models.js';

let timerStart = 0;
let stackmatStarted = false;

export default {
    data: function() {
        return {
            timerLabel: '00:00.00'
        }
    },
    props: ['aetherium', 'timerTrigger'],
    created: function() {
        let vApp = this;

        $(document).on('keydown.aetherium', function(event) {
            if (event.which === 32) {
                event.preventDefault();
            }
        });

        $(document).on('keyup.aetherium', function(event) {
            if (event.which === 32) {
                vApp.onSpacebarPress();
            }
        });
    },
    destroyed: function() {
        $(document).off('.aetherium');
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
                    this.startTimer();
                } else {
                    let stop = moment().valueOf();
                    let start = timerStart;
                    timerStart = 0;
                    this.completeSolve(stop - start);
                }
            }
        },
        onStackmatSignalReceived: function(state) {
            if (stackmatStarted && !state.running) {
                // Timer just stopped
                stackmatStarted = false;
                timerStart = 0;
                this.completeSolve(state.time_milli);
            } else if (!stackmatStarted && state.running) {
                // Timer just started
                stackmatStarted = true;
                this.startTimer();
            } else if (!stackmatStarted && state.time_milli === 0) {
                this.timerLabel = '00:00.00';
            }
        },
        startTimer: function() {
            timerStart = moment().valueOf();

            if (this.aetherium.options.showTimer) {
                setTimeout(this.updateTimer, 10);
            } else {
                this.timerLabel = 'Solve!';
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
        },
        closeSession: function () {
            this.aetherium.closeSession();
        }
    },
    watch: {
        timerTrigger: function(val) {
            timerStart = 0;
            this.timerLabel = '00:00.00';
            console.log(val);

            switch(val) {
                case 'spacebar': {
                    stackmat.stop();
                    break;
                }
                case 'stackmat': {
                    stackmat.setCallBack(this.onStackmatSignalReceived);
                    stackmat.init();
                    break;
                }
                default: {
                    break;
                }
            }
        }
    }
}