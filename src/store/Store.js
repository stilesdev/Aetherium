import * as firebase from 'firebase';
import * as firebaseConfig from '../../firebase.config';
import Vue from 'vue';
import Vuex from 'vuex';
import * as Types from './MutationTypes';
import { Solve, Session } from '../modules/Models';
let ScramblerWorker = require('worker-loader?name=GenerateScramblerWorker.js!../workers/GenerateScramblerWorker.js');

const state = {
    userId: null,
    puzzles: null,
    activeView: 'timer',
    activePuzzle: 333,
    activeCategory: 'default',
    scramblerWorker: new ScramblerWorker(),
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
    },
    [Types.SET_ACTIVE_PUZZLE] (state, puzzleKey) {
        state.activePuzzle = puzzleKey;
    },
    [Types.SET_ACTIVE_CATEGORY] (state, categoryKey) {
        state.activeCategory = categoryKey;
    },
    [Types.RECEIVE_SCRAMBLE] (state, scramble) {
        state.scramble = scramble;
    },
    [Types.SET_OPTION_SHOWTIMER] (state, showTimer) {
        state.option.showTimer = showTimer;
    },
    [Types.SET_OPTION_TIMERTRIGGER] (state, timerTrigger) {
        state.option.timerTrigger = timerTrigger;
    }
};

const actions = {
    emailLogin(context, credentials) {
        firebase.auth().signInWithEmailAndPassword(credentials.email, credentials.password).catch(error => alert(error.message));
    },
    logout(context) {
        firebase.auth().signOut().catch(error => alert(error.message));
    },
    requestScramble(context) {
        context.commit(Types.RECEIVE_SCRAMBLE, { text: 'Generating scramble...', svg: null });
        context.state.scramblerWorker.postMessage({
            scrambler: context.state.puzzles[context.state.activePuzzle].categories[context.state.activeCategory].scrambler
        })
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
            const firstRun = store.state.puzzles === null;

            store.commit(Types.RECEIVE_PUZZLES, snapshot.val());

            if (firstRun) {
                store.dispatch('requestScramble');
            }
        })
    },
    store => {
        store.state.scramblerWorker.addEventListener('message', event => {
            if (event.data === null) {
                store.commit(Types.RECEIVE_SCRAMBLE, { text: 'Invalid scrambler!', svg: null });
            } else {
                store.commit(Types.RECEIVE_SCRAMBLE, { text: event.data.scramble, svg: event.data.svg });
            }
        })
    },
    store => {
        store.subscribe((mutation, state) => {
            if (mutation.type === Types.SET_ACTIVE_CATEGORY) {
                store.dispatch('requestScramble');
            }
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