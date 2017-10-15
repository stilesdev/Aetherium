import * as firebase from 'firebase';
import * as moment from 'moment';
import * as $ from 'jquery';
import * as Mutations from '../store/MutationTypes';
import * as Actions from '../store/ActionTypes';
import { Solve } from '../modules/Models';
import * as Stats from '../modules/Statistics';
import { ImportValidator } from "../modules/ImportSchemaValidator";

export default {
    data: function() {
        return {
            showTimer: true,
            timerTrigger: 'spacebar',
            datePickerConfig: {
                format: 'MM/DD/YYYY'
            },
            importTextValid: true,
            importText: ''
        }
    },
    computed: {
        activeTab: {
            get() {
                return this.$store.state.activeView;
            },
            set(value) {
                this.$store.commit(Mutations.SET_ACTIVE_VIEW, value);
            }
        },
        puzzles() {
            return this.$store.state.puzzles;
        },
        activePuzzle: {
            get() {
                return this.$store.state.activePuzzle;
            },
            set(value) {
                this.$store.dispatch(Actions.SET_ACTIVE_PUZZLE, { puzzle: value, category: 'default' });
            }
        },
        activeCategory: {
            get() {
                return this.$store.state.activeCategory;
            },
            set(value) {
                this.$store.dispatch(Actions.SET_ACTIVE_PUZZLE, { puzzle: this.activePuzzle, category: value });
            }
        },
        storeOptions: {
            get() {
                return this.$store.state.options;
            },
            set(value) {
                this.$store.dispatch(Actions.SET_OPTIONS, value);
            }
        },
        sessionDate: {
            get() {
                return this.$store.state.sessionDate;
            },
            set(value) {
                this.$store.dispatch(Actions.UPDATE_SESSION_DATE, { moment: moment().utc().dayOfYear(value.dayOfYear()).startOf('day') });
            }
        }
    },
    methods: {
        onCloseSessionClick() {
            $('#closeSessionModal').modal();
        },
        onCloseSessionConfirm() {
            this.$store.dispatch(Actions.CLOSE_SESSION);
        },
        openOptionsModal() {
            this.showTimer = this.storeOptions.showTimer;
            this.timerTrigger = this.storeOptions.timerTrigger;
            $('#optionsModal').modal();
        },
        onOptionsModalSave() {
            this.storeOptions = {
                showTimer: this.showTimer,
                timerTrigger: this.timerTrigger
            };
        },
        openImportModal() {
            $('#importModal').modal();
        },
        validateImportText() {
            try {
                const input = JSON.parse(this.importText);
                if (input && typeof input === 'object') {
                    this.importTextValid = new ImportValidator().validate(input).valid;
                    return;
                }
            } catch (e) {}

            this.importTextValid = false;
        },
        runImport() {
            const userId = this.$store.state.userId;
            const input = JSON.parse(this.importText);
            if (!this.importTextValid) {
                alert('Invalid JSON entered.');
                return;
            }

            Object.keys(input).forEach(date => {
                let year = parseInt(date.split('/')[2]);
                let month = parseInt(date.split('/')[0]) - 1;
                let day = parseInt(date.split('/')[1]);
                let sessionMoment = moment().utc().year(year).month(month).date(day).startOf('day');

                let newSessionRef = firebase.database().ref(`/users/${userId}/sessions`).push();
                let newSessionId = newSessionRef.key;
                newSessionRef.set({
                    date: sessionMoment.format('M/D/YYYY'),
                    timestamp: sessionMoment.valueOf()
                });

                Object.keys(input[date]).forEach(puzzle => {
                    Object.keys(input[date][puzzle]).forEach(category => {
                        let solves = [];
                        input[date][puzzle][category].forEach(solve => {
                            let newSolveRef = firebase.database().ref(`/solves/${userId}/${puzzle}/${category}`).push();
                            newSolveRef.set({
                                sessionId: newSessionId,
                                time: solve.time,
                                timestamp: solve.timestamp,
                                scramble: solve.scramble,
                                penalty: solve.penalty
                            });
                            solves.push(new Solve(newSolveRef.key, solve.time, solve.timestamp, solve.scramble, solve.penalty));
                        });
                        firebase.database().ref(`/stats/${userId}/${puzzle}/${category}/${newSessionId}`).set({
                            mean: Stats.mean(solves),
                            count: Stats.count(solves),
                            best: Stats.best(solves),
                            worst: Stats.worst(solves),
                            stdDev: Stats.stdDev(solves),
                            mo3: Stats.mo3(solves),
                            ao5: Stats.ao5(solves),
                            ao12: Stats.ao12(solves),
                            ao50: Stats.ao50(solves),
                            ao100: Stats.ao100(solves),
                            bestMo3: Stats.bestMo3(solves),
                            bestAo5: Stats.bestAo5(solves),
                            bestAo12: Stats.bestAo12(solves),
                            bestAo50: Stats.bestAo50(solves),
                            bestAo100: Stats.bestAo100(solves)
                        })
                    });
                });
            });
        },
        logout() {
            firebase.auth().signOut().catch(error => alert(error.message));
        }
    }
}