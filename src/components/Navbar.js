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
            set (value) {
                this.$store.commit(Types.SET_ACTIVE_VIEW, value);
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