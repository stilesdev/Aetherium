import * as $ from 'jquery';
import * as Mutations from '../store/MutationTypes';
import * as Actions from '../store/ActionTypes';

export default {
    data: function() {
        return {

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
        }
    },
    methods: {
        openOptionsModal() {
            $('#optionsModal').modal();
        },
        onOptionsModalSave() {
            // TODO: Save user account options
        },
        logout() {
            this.$store.dispatch(Actions.LOGOUT);
        }
    }
}