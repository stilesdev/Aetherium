import * as moment from 'moment';
import * as $ from 'jquery';
import * as StatsPanel from '../StatsPanel.vue';
import * as ScramblePanel from '../ScramblePanel.vue';
import {Solve} from '../../modules/Models';

export default {
    data: function() {
        return {
            timerStart: 0,
            timerLabel: '00:00.00',
            stackmatStarted: false
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
        }
    },
    created: function() {
        let view = this;

        $(document).on('keydown.aetherium', function(event) {
            if (event.which === 32) {
                event.preventDefault();
            }
        });

        $(document).on('keyup.aetherium', function(event) {
            if (event.which === 32) {
                view.onSpacebarPress();
            }
        })
    },
    destroyed: function() {
        $(document).off('.aetherium');
    },
    methods: {
        onSpacebarPress() {
            if (this.timerTrigger === 'spacebar') {
                if (this.timerStart === 0) {
                    this.startTimer();
                } else {
                    let stop = moment().valueOf();
                    let start = this.timerStart;
                    this.timerStart = 0;
                    this.completeSolve(stop - start);
                }
            }
        },
        onStackmatSignalReceived(state) {
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
        },
        startTimer() {
            this.timerStart = moment().valueOf();

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
        completeSolve(delta) {
            this.timerLabel = Solve.formatTime(delta);

            //TODO: commit new solve to store
        }
    },
    watch: {
        timerTrigger: function(val) {
            this.timerStart = 0;
            this.timerLabel = '00:00.00';

            switch (val) {
                case 'spacebar':
                    stackmat.stop();
                    break;

                case 'stackmat':
                    stackmat.setCallBack(this.onStackmatSignalReceived);
                    stackmat.init();
                    break;

                default:
                    break;
            }
        }
    },
    components: {
        'stats-panel': StatsPanel,
        'scramble-panel': ScramblePanel
    }
}