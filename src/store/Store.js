import * as firebase from 'firebase';
import * as firebaseConfig from '../../firebase.config';
import * as moment from 'moment';
import Vue from 'vue';
import Vuex from 'vuex';
import { Solve } from '../modules/Models';
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
    solves: [],
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
    puzzlesRef() {
        return firebase.database().ref('/puzzles');
    },
    userRef(state) {
        return firebase.database().ref(`/users/${state.userId}`);
    },
    solvesRootRef(state) {
        return firebase.database().ref(`/solves/${state.userId}`)
    },
    sessionRef(state, getters) {
        return getters.solvesRootRef.child(`${state.sessionId}`);
    },
    solvesRef(state, getters) {
        return getters.sessionRef.child(`solves/${state.activePuzzle}/${state.activeCategory}`);
    }
};

const mutations = {
    [Mutations.RECEIVE_USER_ID] (state, userId) {
        state.userId = userId;
    },
    [Mutations.RECEIVE_SESSION_ID] (state, sessionId) {
        state.sessionId = sessionId;
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
    },
    [Mutations.CLEAR_SOLVES] (state) {
        state.solves = [];
    },
    [Mutations.ADD_SOLVE] (state, solve) {
        state.solves.push(solve);
    }
};

const actions = {
    [Actions.EMAIL_LOGIN] (context, credentials) {
        firebase.auth().signInWithEmailAndPassword(credentials.email, credentials.password).catch(error => alert(error.message));
    },
    [Actions.COMPLETE_LOGIN] (context, user) {
        if (user) {
            context.commit(Mutations.RECEIVE_USER_ID, user.uid);

            context.getters.userRef.once('value').then(snapshot => {
                const userData = snapshot.val();

                context.commit(Mutations.SET_OPTION_SHOWTIMER, userData.options.showTimer);
                context.commit(Mutations.SET_OPTION_TIMERTRIGGER, userData.options.timerTrigger);

                context.getters.puzzlesRef.on('value', snapshot => {
                    const firstRun = context.state.puzzles === null;

                    context.commit(Mutations.RECEIVE_PUZZLES, snapshot.val());

                    if (firstRun) {
                        context.getters.userRef.child('currentSessionId').on('value', snapshot => {
                            context.commit(Mutations.RECEIVE_SESSION_ID, snapshot.val());
                        });

                        context.getters.userRef.child('currentPuzzle').on('value', snapshot => {
                            context.commit(Mutations.SET_ACTIVE_PUZZLE_AND_CATEGORY, snapshot.val());
                        });
                    }
                });
            });
        } else {
            context.commit(Mutations.RECEIVE_USER_ID, null);
            context.commit(Mutations.RECEIVE_SESSION_ID, null);
            // TODO: unset everything set in if block above
        }
    },
    [Actions.LOGOUT] (context) {
        firebase.auth().signOut().catch(error => alert(error.message));
    },
    [Actions.REQUEST_SCRAMBLE] (context) {
        context.commit(Mutations.RECEIVE_SCRAMBLE, { text: null, svg: null });
        context.state.scramblerWorker.postMessage({
            scrambler: context.state.puzzles[context.state.activePuzzle].categories[context.state.activeCategory].scrambler
        })
    },
    [Actions.CHECK_SESSION] (context) {
        return new Promise((resolve, reject) => {
            if (!context.state.sessionId) {
                const date = moment().utc().dayOfYear(moment().dayOfYear()).startOf('day');
                const newSessionRef = context.getters.solvesRootRef.push();

                context.getters.userRef.child('currentSessionId').set(newSessionRef.key).then(() => {
                    newSessionRef.set({
                        date: date.format('M/D/YYYY'),
                        timestamp: date.valueOf()
                    });

                    resolve();
                });
            } else {
                resolve();
            }
        });
    },
    [Actions.CLOSE_SESSION] (context) {
        context.getters.userRef.child('currentSessionId').set(null);
    },
    [Actions.STORE_SOLVE] (context, delta) {
        context.dispatch(Actions.CHECK_SESSION).then(() => {
            context.getters.solvesRef.push().set({
                time: delta,
                timestamp: firebase.database.ServerValue.TIMESTAMP,
                scramble: context.state.scramble.text,
                penalty: ''
            });

            context.dispatch(Actions.REQUEST_SCRAMBLE);
        });
    },
    [Actions.SET_PENALTY] (context, update) {
        const newPenalty = (solve.penalty === update.penalty) ? '' : update.penalty;
        context.getters.solvesRef.child(update.solve.uid).set({penalty : newPenalty});
    },
    [Actions.DELETE_SOLVE] (context, solveId) {
        context.getters.solvesRef.child(solveId).remove();
    }
};

const plugins = [
    store => firebase.auth().onAuthStateChanged(user => store.dispatch(Actions.COMPLETE_LOGIN, user)),
    store => store.state.scramblerWorker.addEventListener('message', event => {
        if (event.data === null) {
            store.commit(Mutations.RECEIVE_SCRAMBLE, { text: 'No valid scrambler for this puzzle', svg: null });
        } else {
            store.commit(Mutations.RECEIVE_SCRAMBLE, { text: event.data.scramble, svg: event.data.svg });
        }
    }),
    store => store.subscribe((mutation, state) => {
        if (mutation.type === Mutations.SET_OPTION_SHOWTIMER) {
            store.getters.userRef.child('options/showTimer').set(state.options.showTimer);
        }

        if (mutation.type === Mutations.SET_OPTION_TIMERTRIGGER) {
            store.getters.userRef.child('options/timerTrigger').set(state.options.timerTrigger);
        }

        if (mutation.type === Mutations.SET_ACTIVE_PUZZLE) {
            store.getters.userRef.child('currentPuzzle/puzzle').set(state.activePuzzle);
            store.commit(Mutations.SET_ACTIVE_CATEGORY, 'default');
        }

        if (mutation.type === Mutations.SET_ACTIVE_CATEGORY) {
            store.getters.userRef.child('currentPuzzle/category').set(state.activeCategory);
            store.dispatch(Actions.REQUEST_SCRAMBLE);
        }

        if (mutation.type === Mutations.SET_ACTIVE_PUZZLE_AND_CATEGORY) {
            store.dispatch(Actions.REQUEST_SCRAMBLE);
        }
    }),
    store => {
        let prevPuzzle = store.state.activePuzzle;
        let prevCategory = store.state.activeCategory;

        store.subscribe((mutation, state) => {
            if (mutation.type === Mutations.SET_ACTIVE_CATEGORY || mutation.type === Mutations.SET_ACTIVE_PUZZLE_AND_CATEGORY) {
                store.getters.sessionRef.child(`solves/${prevPuzzle}/${prevCategory}`).off();
                store.commit(Mutations.CLEAR_SOLVES);

                store.getters.solvesRef.on('child_added', snapshot => {
                    store.commit(Mutations.ADD_SOLVE, Solve.fromSnapshot(snapshot));
                });
            }

            prevPuzzle = state.activePuzzle;
            prevCategory = state.activeCategory;
        });
    },
    store => store.subscribe((mutation, state) => {
        console.log(mutation);
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