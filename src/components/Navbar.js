import * as firebase from 'firebase';
import * as moment from 'moment';
import * as $ from 'jquery';
import * as Mutations from '../store/MutationTypes';
import * as Actions from '../store/ActionTypes';

export default {
    data: function() {
        return {
            showTimer: true,
            timerTrigger: 'spacebar',
            datePickerConfig: {
                format: 'MM/DD/YYYY'
            },
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
        runImport() {
            //TODO: implement
        },
        logout() {
            firebase.auth().signOut().catch(error => alert(error.message));
        }
    }
}