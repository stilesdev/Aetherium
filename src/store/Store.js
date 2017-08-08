import * as firebase from 'firebase';
import * as firebaseConfig from '../../firebase.config';
import Vue from 'vue';
import Vuex from 'vuex';
import * as Mutations from './MutationTypes';
import * as Actions from './ActionTypes';
let ScramblerWorker = require('worker-loader?name=GenerateScramblerWorker.js!../workers/GenerateScramblerWorker.js');

const state = {
    userId: null,
    sessionId: null,
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
    },
    refs: {
        user: null,
        records: null,
        session: null,
        stats: null
    }
};

const getters = {

};

const mutations = {
    [Mutations.RECEIVE_USER_ID] (state, userId) {
        state.userId = userId;

        if (userId) {
            state.refs.user = firebase.database().ref(`/users/${userId}`);
            state.refs.records = firebase.database().ref(`/records/${userId}`);
        } else {
            state.refs.user = null;
            state.refs.records = null;
        }
    },
    [Mutations.RECEIVE_SESSION_ID] (state, sessionId) {
        state.session = sessionId;

        if (sessionId) {
            state.refs.session = firebase.database().ref(`/solves/${state.userId}/${sessionId}`);
            state.refs.stats = firebase.database().ref(`/stats/${state.userId}/${sessionId}`);
        } else {
            state.refs.session = null;
            state.refs.stats = null;
        }
    },
    [Mutations.RECEIVE_PUZZLES] (state, puzzles) {
        state.puzzles = puzzles;
    },
    [Mutations.SET_ACTIVE_VIEW] (state, newView) {
        state.activeView = newView;
    },
    [Mutations.SET_ACTIVE_PUZZLE] (state, puzzleKey) {
        state.activePuzzle = puzzleKey;
    },
    [Mutations.SET_ACTIVE_CATEGORY] (state, categoryKey) {
        state.activeCategory = categoryKey;
    },
    [Mutations.RECEIVE_SCRAMBLE] (state, scramble) {
        state.scramble = scramble;
    },
    [Mutations.SET_OPTION_SHOWTIMER] (state, showTimer) {
        state.option.showTimer = showTimer;
    },
    [Mutations.SET_OPTION_TIMERTRIGGER] (state, timerTrigger) {
        state.option.timerTrigger = timerTrigger;
    }
};

const actions = {
    [Actions.EMAIL_LOGIN] (context, credentials) {
        firebase.auth().signInWithEmailAndPassword(credentials.email, credentials.password).catch(error => alert(error.message));
    },
    [Actions.COMPLETE_LOGIN] (context, userId) {
        context.commit(Mutations.RECEIVE_USER_ID, userId);

        if (userId) {
            context.state.refs.user.once('value').then(snapshot => {
                if (snapshot.exists()) {

                } else {
                    // TODO: Finish this - create user snapshot? Or should it be created when user signs up?
                }
            });
        }
    },
    [Actions.LOGOUT] (context) {
        firebase.auth().signOut().catch(error => alert(error.message));
    },
    [Actions.REQUEST_SCRAMBLE] (context) {
        context.commit(Mutations.RECEIVE_SCRAMBLE, { text: 'Generating scramble...', svg: null });
        context.state.scramblerWorker.postMessage({
            scrambler: context.state.puzzles[context.state.activePuzzle].categories[context.state.activeCategory].scrambler
        })
    },
    [Actions.STORE_SOLVE] (context, solve) {
        const puzzle = context.state.activePuzzle;
        const category = context.state.activeCategory;

        const newSolveRef = context.state.refs.session.child(`solves/${puzzle}/${category}`).push();
        newSolveRef.set({
            time: solve.time,
            timestamp: firebase.database.ServerValue.TIMESTAMP,
            scramble: solve.scramble,
            penalty: ''
        })
    }
};

const plugins = [
    store => {
        firebase.auth().onAuthStateChanged(user => {
            store.commit(Mutations.RECEIVE_USER_ID, user ? user.uid : null);
        })
    },
    store => {
        firebase.database().ref('/puzzles').on('value', snapshot => {
            const firstRun = store.state.puzzles === null;

            store.commit(Mutations.RECEIVE_PUZZLES, snapshot.val());

            if (firstRun) {
                store.dispatch(Actions.REQUEST_SCRAMBLE);
            }
        })
    },
    store => {
        store.state.scramblerWorker.addEventListener('message', event => {
            if (event.data === null) {
                store.commit(Mutations.RECEIVE_SCRAMBLE, { text: 'Invalid scrambler!', svg: null });
            } else {
                store.commit(Mutations.RECEIVE_SCRAMBLE, { text: event.data.scramble, svg: event.data.svg });
            }
        })
    },
    store => {
        store.subscribe((mutation, state) => {
            if (mutation.type === Mutations.SET_ACTIVE_CATEGORY) {
                store.dispatch(Actions.REQUEST_SCRAMBLE);
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