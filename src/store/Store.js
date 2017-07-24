import * as firebase from 'firebase';
import * as firebaseConfig from '../../firebase.config';
import Vue from 'vue';
import Vuex from 'vuex';
import * as Types from './MutationTypes';

const state = {
    userId: null,
    puzzles: null,
    activeView: 'timer',
    activePuzzle: 333,
    activeCategory: 'default',
    scramble: {
        text: 'Generating scramble...',
        svg: null
    },
    options: {
        showTimer: true,
        timerTrigger: 'spacebar'
    }
};

const getters = {

};

const mutations = {
    [Types.RECEIVE_USER_ID] (state, userId) {
        state.userId = userId;
    },
    [Types.RECEIVE_PUZZLES] (state, puzzles) {
        state.puzzles = puzzles;
    },
    [Types.SET_ACTIVE_VIEW] (state, newView) {
        state.activeView = newView;
    }
};

const actions = {
    emailLogin(context, credentials) {
        firebase.auth().signInWithEmailAndPassword(credentials.email, credentials.password).catch(error => alert(error.message));
    },
    logout(context) {
        firebase.auth().signOut().catch(error => alert(error.message));
    }
};

const plugins = [
    store => {
        firebase.auth().onAuthStateChanged(user => {
            store.commit(Types.RECEIVE_USER_ID, user ? user.uid : null);
        })
    },
    store => {
        firebase.database().ref('/puzzles').on('value', snapshot => {
            store.commit(Types.RECEIVE_PUZZLES, snapshot.val());
        })
    }
];

try {
    firebase.initializeApp(firebaseConfig);
} catch (e) {
    console.error(e);
}

Vue.use(Vuex);

export default new Vuex.Store({
    state,
    getters,
    mutations,
    actions,
    plugins,
    strict: true //TODO: disable this before deploying to production
})