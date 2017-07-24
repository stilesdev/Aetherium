import Login from './Login.vue';
import Navbar from './Navbar.vue';
import Timer from './views/Timer.vue';

export default {
    data: function() {
        return {

        }
    },
    computed: {
        loggedIn() {
            return this.$store.state.userId !== null;
        },
        activeView() {
            return this.$store.state.activeView;
        }
    },
    components: { Login, Navbar, Timer }
}