import Login from './Login.vue';
import Navbar from './Navbar.vue';

export default {
    data: function() {
        return {

        }
    },
    computed: {
        loggedIn() {
            return this.$store.state.userId !== null;
        }
    },
    created: function() {
        // Initialize event listeners, etc
    },
    destroyed: function() {
        // Destroy event listeners, etc
    },
    methods: {

    },
    components: { Login, Navbar }
}