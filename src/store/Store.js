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
    }
};

const getters = {
    //TODO: implement getters for firebase refs?
};

const mutations = {
    [Mutations.RECEIVE_USER_ID] (state, userId) {
        state.userId = userId;
    },
    [Mutations.RECEIVE_SESSION_ID] (state, sessionId) {
        state.session = sessionId;
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
    [Mutations.SET_ACTIVE_PUZZLE_AND_CATEGORY] (state, puzzle) {
        state.activePuzzle = puzzle.puzzle;
        state.activeCategory = puzzle.category;
    },
    [Mutations.RECEIVE_SCRAMBLE] (state, scramble) {
        state.scramble = scramble;
    },
    [Mutations.SET_OPTION_SHOWTIMER] (state, showTimer) {
        state.options.showTimer = showTimer;
    },
    [Mutations.SET_OPTION_TIMERTRIGGER] (state, timerTrigger) {
        state.options.timerTrigger = timerTrigger;
    }
};

const actions = {
    [Actions.EMAIL_LOGIN] (context, credentials) {
        firebase.auth().signInWithEmailAndPassword(credentials.email, credentials.password).catch(error => alert(error.message));
    },
    [Actions.COMPLETE_LOGIN] (context, user) {
        if (user) {
            context.commit(Mutations.RECEIVE_USER_ID, user.uid);

            firebase.database().ref(`/users/${user.uid}`).once('value').then(snapshot => {
                const userData = snapshot.val();

                context.commit(Mutations.RECEIVE_SESSION_ID, userData.currentSession);

                context.commit(Mutations.SET_OPTION_SHOWTIMER, userData.options.showTimer);
                context.commit(Mutations.SET_OPTION_TIMERTRIGGER, userData.options.timerTrigger);

                firebase.database().ref('/puzzles').on('value', snapshot => {
                    const firstRun = context.state.puzzles === null;

                    context.commit(Mutations.RECEIVE_PUZZLES, snapshot.val());

                    if (firstRun) {
                        firebase.database().ref(`/users/${user.uid}/currentPuzzle`).on('value', snapshot => {
                            context.commit(Mutations.SET_ACTIVE_PUZZLE_AND_CATEGORY, snapshot.val());
                        });
                    }
                });
            });
        } else {
            context.commit(Mutations.RECEIVE_USER_ID, null);
            context.commit(Mutations.RECEIVE_SESSION_ID, null);
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

        const newSolveRef = firebase.database().ref(`/solves/${context.state.userId}/${context.state.sessionId}/solves/${puzzle}/${category}`).push();
        newSolveRef.set({
            time: solve.time,
            timestamp: firebase.database.ServerValue.TIMESTAMP,
            scramble: solve.scramble,
            penalty: ''
        })
    }
};

const plugins = [
    store => firebase.auth().onAuthStateChanged(user => store.dispatch(Actions.COMPLETE_LOGIN, user)),
    store => store.state.scramblerWorker.addEventListener('message', event => {
        if (event.data === null) {
            store.commit(Mutations.RECEIVE_SCRAMBLE, { text: 'Invalid scrambler!', svg: null });
        } else {
            store.commit(Mutations.RECEIVE_SCRAMBLE, { text: event.data.scramble, svg: event.data.svg });
        }
    }),
    store => store.subscribe((mutation, state) => {
        const userRef = firebase.database().ref(`/users/${state.userId}`);

        if (mutation.type === Mutations.SET_OPTION_SHOWTIMER) {
            userRef.child('options/showTimer').set(state.options.showTimer);
        }

        if (mutation.type === Mutations.SET_OPTION_TIMERTRIGGER) {
            userRef.child('options/timerTrigger').set(state.options.timerTrigger);
        }

        if (mutation.type === Mutations.SET_ACTIVE_PUZZLE) {
            userRef.child('currentPuzzle/puzzle').set(state.activePuzzle);
            store.commit(Mutations.SET_ACTIVE_CATEGORY, 'default');
        }

        if (mutation.type === Mutations.SET_ACTIVE_CATEGORY) {
            userRef.child('/currentPuzzle/category').set(state.activeCategory);
            store.dispatch(Actions.REQUEST_SCRAMBLE);
        }

        if (mutation.type === Mutations.SET_ACTIVE_PUZZLE_AND_CATEGORY) {
            store.dispatch(Actions.REQUEST_SCRAMBLE);
        }
    })
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