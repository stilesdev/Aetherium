import firebase, { auth, database } from 'firebase'
import moment, { Moment } from 'moment'
import Vue from 'vue'
import Vuex, { ActionContext, MutationPayload } from 'vuex'
import { Actions, Mutations, References, RootState, ScramblePayload } from '@/types/store'
import FirebaseManager from '@/util/firebase-manager'
import { Stats } from '@/util/stats'
import { ISolve } from '@/types'
import { ScramblerWorker } from '@/workers'
import firebaseConfig from '../firebase.config'
import { FirebaseList, ProfileOptions, Puzzle, SessionPayload, SolvePenalty, StatisticsPayload, TimerTrigger } from '@/types/firebase'
import DataSnapshot = firebase.database.DataSnapshot

try {
    firebase.initializeApp(firebaseConfig.development)
} catch (e) {
    // tslint:disable-next-line: no-console
    console.error(e)
}
Vue.use(Vuex)

export default new Vuex.Store<RootState>({
    strict: true, // TODO: disable this before deploying to production
    state: {
        hideUI: false,
        scramblerWorker: new ScramblerWorker(),
        scramble: {
            text: 'Generating scramble...',
            svg: undefined
        },
        puzzles: undefined,
        userId: undefined,
        options: {
            showTimer: true,
            timerTrigger: TimerTrigger.SPACEBAR,
            themeUrl: '/themes/default.min.css',
            holdToStart: true,
            useInspection: true
        },
        sessionId: undefined,
        sessionDate: undefined,
        activePuzzle: '333',
        solves: [],
        sessionStats: undefined,
        allSessions: undefined,
        allStats: undefined
    },
    getters: {
        isLoggedIn(state: RootState): boolean {
            return state.userId !== undefined
        },
        puzzlesRef(): database.Reference {
            return database().ref('/puzzles')
        },
        optionsRef(state: RootState): database.Reference {
            return database().ref(`/users/${state.userId}/options`)
        },
        currentSessionIdRef(state: RootState): database.Reference {
            return database().ref(`/users/${state.userId}/currentSessionId`)
        },
        currentPuzzleRef(state: RootState): database.Reference {
            return database().ref(`/users/${state.userId}/currentPuzzle`)
        },
        sessionsRef(state: RootState): database.Reference {
            return database().ref(`/users/${state.userId}/sessions`)
        },
        currentSessionRef(state: RootState): database.Reference {
            return database().ref(`/users/${state.userId}/sessions/${state.sessionId}`)
        },
        solvesRef(state: RootState): database.Reference {
            return database().ref(`/solves/${state.userId}/${state.activePuzzle}`)
        },
        statsRef(state: RootState): database.Reference {
            return database().ref(`/stats/${state.userId}/${state.activePuzzle}`)
        },
        sessionStatsRef(state: RootState): database.Reference {
            return database().ref(`/stats/${state.userId}/${state.activePuzzle}/${state.sessionId}`)
        }
    },
    mutations: {
        [Mutations.RECEIVE_USER_ID](state: RootState, userId: string): void {
            state.userId = userId
        },
        [Mutations.RECEIVE_SESSION_ID](state: RootState, sessionId: string): void {
            state.sessionId = sessionId
        },
        [Mutations.RECEIVE_PUZZLES](state: RootState, puzzles: FirebaseList<Puzzle>): void {
            state.puzzles = puzzles
        },
        [Mutations.RECEIVE_SESSION_DATE](state: RootState, payload: { moment: string }): void {
            state.sessionDate = payload.moment
        },
        [Mutations.SET_HIDE_UI](state: RootState, hide: boolean): void {
            state.hideUI = hide
        },
        [Mutations.RECEIVE_ACTIVE_PUZZLE](state: RootState, payload: string): void {
            state.activePuzzle = payload
        },
        [Mutations.RECEIVE_SCRAMBLE](state: RootState, scramble: ScramblePayload): void {
            state.scramble = scramble
        },
        [Mutations.SET_OPTION_SHOWTIMER](state: RootState, showTimer: boolean): void {
            state.options.showTimer = showTimer
        },
        [Mutations.SET_OPTION_TIMERTRIGGER](state: RootState, timerTrigger: TimerTrigger): void {
            state.options.timerTrigger = timerTrigger
        },
        [Mutations.SET_OPTION_THEME_URL](state: RootState, themeUrl: string): void {
            state.options.themeUrl = themeUrl
        },
        [Mutations.SET_OPTION_HOLD_TO_START](state: RootState, holdToStart: boolean): void {
            state.options.holdToStart = holdToStart
        },
        [Mutations.SET_OPTION_USE_INSPECTION](state: RootState, useInspection: boolean): void {
            state.options.useInspection = useInspection
        },
        [Mutations.CLEAR_SOLVES](state: RootState): void {
            state.solves = []
        },
        [Mutations.ADD_SOLVE](state: RootState, solve: ISolve): void {
            state.solves.unshift(solve)
        },
        [Mutations.UPDATE_SOLVE](state: RootState, payload: { uid: string; solve: ISolve }): void {
            Vue.set(
                state.solves,
                state.solves.findIndex((solve: ISolve) => solve.uid === payload.uid),
                payload.solve
            )
        },
        [Mutations.DELETE_SOLVE](state: RootState, solveId: string): void {
            state.solves.splice(
                state.solves.findIndex((solve: ISolve) => solve.uid === solveId),
                1
            )
        },
        [Mutations.RECEIVE_SESSION_STATS](state: RootState, stats: StatisticsPayload): void {
            state.sessionStats = stats
        },
        [Mutations.RECEIVE_ALL_SESSIONS](state: RootState, sessions: FirebaseList<SessionPayload>): void {
            state.allSessions = sessions
        },
        [Mutations.RECEIVE_ALL_STATS](state: RootState, stats: FirebaseList<StatisticsPayload>): void {
            state.allStats = stats
        }
    },
    actions: {
        [Actions.SET_OPTIONS](context: ActionContext<RootState, RootState>, payload: ProfileOptions): void {
            context.getters.optionsRef.set(payload)
        },
        [Actions.SET_ACTIVE_PUZZLE](context: ActionContext<RootState, RootState>, payload: { puzzle: string }): void {
            context.getters.currentPuzzleRef.set(payload.puzzle)
        },
        [Actions.UPDATE_SESSION_DATE](context: ActionContext<RootState, RootState>, payload: { moment: Moment }): void {
            context.getters.currentSessionRef.update({
                date: payload.moment.format('M/D/YYYY'),
                timestamp: payload.moment.valueOf()
            })
        },
        [Actions.REQUEST_SCRAMBLE](context: ActionContext<RootState, RootState>): void {
            context.commit(Mutations.RECEIVE_SCRAMBLE, {
                text: 'Generating scramble...',
                svg: undefined
            })

            if (context.state.puzzles) {
                context.state.scramblerWorker.postMessage({
                    scrambler: context.state.puzzles[context.state.activePuzzle].scrambler
                })
            }
        },
        [Actions.CHECK_SESSION](context: ActionContext<RootState, RootState>): Promise<void> {
            return new Promise(resolve => {
                if (!context.state.sessionId) {
                    const date = moment()
                        .utc()
                        .dayOfYear(moment().dayOfYear())
                        .startOf('day')
                    const newSessionRef = context.getters.sessionsRef.push()

                    context.getters.currentSessionIdRef.set(newSessionRef.key).then(() => {
                        newSessionRef.set({
                            date: date.format('M/D/YYYY'),
                            timestamp: date.valueOf()
                        })

                        resolve()
                    })
                } else {
                    resolve()
                }
            })
        },
        [Actions.CLOSE_SESSION](context: ActionContext<RootState, RootState>): void {
            context.getters.currentSessionIdRef.set(undefined)
        },
        [Actions.STORE_SOLVE](context: ActionContext<RootState, RootState>, delta: number): void {
            context.dispatch(Actions.CHECK_SESSION).then(() => {
                context.getters.solvesRef
                    .push()
                    .set({
                        sessionId: context.state.sessionId,
                        time: delta,
                        timestamp: database.ServerValue.TIMESTAMP,
                        scramble: context.state.scramble.text,
                        penalty: ''
                    })
                    .then(() => context.dispatch(Actions.UPDATE_STATS))

                context.dispatch(Actions.REQUEST_SCRAMBLE)
            })
        },
        [Actions.SET_PENALTY](context: ActionContext<RootState, RootState>, update: { solve: ISolve; penalty: SolvePenalty }): void {
            const newPenalty = update.solve.penalty === update.penalty ? '' : update.penalty
            context.getters.solvesRef
                .child(update.solve.uid)
                .update({ penalty: newPenalty })
                .then(() => context.dispatch(Actions.UPDATE_STATS))
        },
        [Actions.DELETE_SOLVE](context: ActionContext<RootState, RootState>, solveId: string): void {
            context.getters.solvesRef
                .child(solveId)
                .remove()
                .then(() => context.dispatch(Actions.UPDATE_STATS))
        },
        [Actions.UPDATE_STATS](context: ActionContext<RootState, RootState>): void {
            if (context.state.solves.length === 0) {
                context.getters.sessionStatsRef.remove()
                context.commit(Mutations.RECEIVE_SESSION_STATS, undefined)
            } else {
                context.getters.sessionStatsRef.update({
                    mean: Stats.mean(context.state.solves),
                    count: Stats.count(context.state.solves),
                    best: Stats.best(context.state.solves),
                    worst: Stats.worst(context.state.solves),
                    stdDev: Stats.stdDev(context.state.solves),
                    mo3: Stats.mo3(context.state.solves),
                    ao5: Stats.ao5(context.state.solves),
                    ao12: Stats.ao12(context.state.solves),
                    ao50: Stats.ao50(context.state.solves),
                    ao100: Stats.ao100(context.state.solves),
                    bestMo3: Stats.bestMo3(context.state.solves),
                    bestAo5: Stats.bestAo5(context.state.solves),
                    bestAo12: Stats.bestAo12(context.state.solves),
                    bestAo50: Stats.bestAo50(context.state.solves),
                    bestAo100: Stats.bestAo100(context.state.solves)
                })
            }
        }
    },
    plugins: [
        store =>
            auth().onAuthStateChanged(user => {
                if (user) {
                    const userRef = database().ref(`/users/${user.uid}`)
                    userRef.once('value').then(snapshot => {
                        if (!snapshot.exists()) {
                            userRef.set({
                                currentPuzzle: '333',
                                email: user.email,
                                options: {
                                    showTimer: true,
                                    timerTrigger: 'spacebar',
                                    holdToStart: true,
                                    useInspection: true
                                }
                            })
                        }

                        store.commit(Mutations.RECEIVE_USER_ID, user.uid)
                    })
                } else {
                    store.commit(Mutations.RECEIVE_USER_ID, undefined)
                }
            }),
        store =>
            store.state.scramblerWorker.addEventListener('message', (event: MessageEvent) => {
                if (event.data === undefined) {
                    store.commit(Mutations.RECEIVE_SCRAMBLE, {
                        text: 'No valid scrambler for this puzzle',
                        svg: undefined
                    })
                } else {
                    store.commit(Mutations.RECEIVE_SCRAMBLE, {
                        text: event.data.scramble,
                        svg: event.data.svg
                    })
                }
            }),
        store =>
            store.getters.puzzlesRef.on('value', (snapshot: DataSnapshot) => {
                store.commit(Mutations.RECEIVE_PUZZLES, snapshot.val())
            }),
        store =>
            store.subscribe((mutation: MutationPayload, state: RootState) => {
                if (mutation.type === Mutations.RECEIVE_USER_ID) {
                    FirebaseManager.disconnectAllRefs()

                    if (state.userId) {
                        FirebaseManager.connectRef(References.OPTIONS, store)
                        FirebaseManager.connectRef(References.CURRENT_SESSION_ID, store)
                        FirebaseManager.connectRef(References.CURRENT_PUZZLE, store)
                    }
                }
            }),
        store =>
            store.subscribe((mutation: MutationPayload, state: RootState) => {
                if (mutation.type === Mutations.RECEIVE_SESSION_ID) {
                    FirebaseManager.disconnectRef(References.SESSION)

                    if (state.sessionId) {
                        FirebaseManager.connectRef(References.SESSION, store)
                    }
                }
            }),
        store =>
            store.subscribe((mutation: MutationPayload) => {
                if (mutation.type === Mutations.RECEIVE_ACTIVE_PUZZLE) {
                    FirebaseManager.disconnectRef(References.SOLVES)
                    FirebaseManager.disconnectRef(References.SESSION_STATS)
                    FirebaseManager.disconnectRef(References.ALL_SESSIONS)
                    FirebaseManager.disconnectRef(References.ALL_STATS)
                    store.commit(Mutations.CLEAR_SOLVES)

                    FirebaseManager.connectRef(References.SOLVES, store)
                    FirebaseManager.connectRef(References.SESSION_STATS, store)
                    FirebaseManager.connectRef(References.ALL_SESSIONS, store)
                    FirebaseManager.connectRef(References.ALL_STATS, store)
                    store.dispatch(Actions.REQUEST_SCRAMBLE)
                }
            }),
        store =>
            store.subscribe((mutation: MutationPayload) => {
                // tslint:disable-next-line: no-console
                console.log(mutation.type)
                // tslint:disable-next-line: no-console
                console.log(mutation.payload)
            })
    ]
})
