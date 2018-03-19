import * as moment from 'moment';
import * as $ from 'jquery';
import * as PanelSessionStatistics from '../panels/PanelSessionStatistics.vue';
import * as PanelSolvesList from '../panels/PanelSolvesList.vue';
import * as PanelScrambleImage from '../panels/PanelScrambleImage.vue';
import {Solve} from '../../modules/Models';
import * as Actions from '../../store/ActionTypes';
import TimerStateMachine from '../../modules/TimerStateMachine';

export default {
    data: function() {
        return {
            timerStart: 0,
            timerLabel: '00:00.00',
            generatingScramble: true,
            stackmatStarted: false,
            timerState: null,
            inspectionCountdown: 0,
            inspectionTimer: null
        }
    },
    computed: {
        scramble() {
            return this.$store.state.scramble;
        },
        timerTrigger() {
            return this.$store.state.options.timerTrigger;
        },
        showTimer() {
            return this.$store.state.options.showTimer;
        },
        holdToStart() {
            return this.$store.state.options.holdToStart;
        },
        useInspection() {
            return this.$store.state.options.useInspection;
        },
        currentPuzzle() {
            return { puzzle: this.$store.state.activePuzzle };
        },
        timerClass() {
            switch (this.timerState.state) {
                case 'inspection':
                    return 'timer-inspection';

                case 'starting':
                    return 'timer-starting';

                case 'ready':
                case 'running':
                    return 'timer-ready';

                default: return 'inherit';
            }
        }
    },
    created: function() {
        this.createTimerState();
        this.initTimers();
    },
    destroyed: function() {
        this.disconnectTimers();
    },
    methods: {
        initTimers() {
            if (this.timerTrigger === 'spacebar') {
                stackmat.stop();
                let view = this;

                $(document).on('keydown.aetherium', function(event) {
                    if (event.which === 32) {
                        event.preventDefault();
                        view.timerState.triggerDown();
                    }
                });

                $(document).on('keyup.aetherium', function(event) {
                    if (event.which === 32) {
                        event.preventDefault();
                        view.timerState.triggerUp();
                    }
                });
            } else if (this.timerTrigger === 'stackmat') {
                $(document).off('.aetherium');

                stackmat.setCallBack(this.onStackmatSignalReceived);
                stackmat.init();
            }
        },
        disconnectTimers() {
            $(document).off('.aetherium');
            stackmat.stop();

        },
        createTimerState() {
            let view = this;

            view.timerState = new TimerStateMachine({
                holdToStart: view.holdToStart,
                useInspection: view.useInspection,
                onSolveStart: view.startTimer,
                onSolveComplete: view.stopSolve,
                onInspectionStart: view.startInspection
            });
        },
        onStackmatSignalReceived(state) {
            /*
            if (this.stackmatStarted && !state.running) {
                // Timer just stopped
                this.stackmatStarted = false;
                this.timerStart = 0;
                this.completeSolve(state.time_milli);
            } else if (!this.stackmatStarted && state.running) {
                // Timer just started
                this.stackmatStarted = true;
                this.startTimer();
            } else if (!this.stackmatStarted && state.time_milli === 0) {
                this.timerLabel = '00:00.00';
            }
            */
        },
        startInspection() {
            this.inspectionCountdown = 15;
            this.timerLabel = this.inspectionCountdown;

            this.inspectionTimer = setInterval(this.updateInspection, 1000);
        },
        updateInspection() {
            this.inspectionCountdown -= 1;

            if (this.inspectionCountdown === 0) {
                this.timerState.inspectionExceeded();
                this.timerLabel = 'DNS';
                clearInterval(this.inspectionTimer);
            } else {
                this.timerLabel = this.inspectionCountdown;
            }
        },
        startTimer() {
            this.timerStart = moment().valueOf();
            clearInterval(this.inspectionTimer);
            this.generatingScramble = true;

            if (this.showTimer) {
                setTimeout(this.updateTimer, 10);
            } else {
                this.timerLabel = 'Solve!';
            }
        },
        updateTimer() {
            if (this.timerStart !== 0) {
                this.timerLabel = Solve.formatTime(moment().valueOf() - this.timerStart);
                setTimeout(this.updateTimer, 30);
            }
        },
        stopSolve() {
            let stop = moment().valueOf();
            let start = this.timerStart;
            this.timerStart = 0;
            this.completeSolve(stop - start);
        },
        completeSolve(delta) {
            this.timerLabel = Solve.formatTime(delta);

            this.$store.dispatch(Actions.STORE_SOLVE, delta);
        }
    },
    watch: {
        timerTrigger: function(oldTrigger, newTrigger) {
            if (oldTrigger !== newTrigger) {
                this.timerStart = 0;
                this.timerLabel = '00:00.00';
                this.disconnectTimers();
                this.initTimers();
            }
        },
        holdToStart: function() {
            this.createTimerState();
        },
        useInspection: function() {
            this.createTimerState();
        },
        scramble: function() {
            this.generatingScramble = false;
        },
        currentPuzzle: function() {
            this.generatingScramble = true;
        }
    },
    components: {
        'stats-panel': PanelSessionStatistics,
        'solves-panel': PanelSolvesList,
        'scramble-panel': PanelScrambleImage
    }
}