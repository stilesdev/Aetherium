import * as $ from 'jquery';
import * as Types from '../store/MutationTypes';

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
                this.$store.commit(Types.SET_ACTIVE_VIEW, value);
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
                this.$store.commit(Types.SET_ACTIVE_PUZZLE, value);
                this.activeCategory = 'default';
            }
        },
        activeCategory: {
            get() {
                return this.$store.state.activeCategory;
            },
            set(value) {
                this.$store.commit(Types.SET_ACTIVE_CATEGORY, value);
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
            this.$store.dispatch('logout')
        }
    }
}