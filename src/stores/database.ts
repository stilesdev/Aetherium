import { child, equalTo, getDatabase, off, onChildAdded, onChildChanged, onChildRemoved, onValue, orderByChild, push, query, ref, remove, serverTimestamp, set, update } from 'firebase/database'
import { defineStore } from 'pinia'
import { useUser } from '@/stores/user'
import { usePuzzles } from './puzzles'
import { useOptions } from './options'
import { useSession } from './session'
import moment, { type Moment } from 'moment'
import { Solve } from '@/classes/solve'
import type { ProfileOptions, SolvePenalty } from '@/types/firebase'
import type { ISolve } from '@/types'
import { useScramble } from './scramble'
import { Stats } from '@/util/stats'

interface DatabaseState {
    previousOptionsRef?: string
    previousCurrentSessionIdRef?: string
    previousCurrentPuzzleRef?: string
    previousCurrentSessionRef?: string
    previousSolvesRef?: string
    previousSessionStatsRef?: string
    previousAllSessionsRef?: string
    previousAllStatsRef?: string
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function debug(...args: any[]) {
    if (import.meta.env.DEV) {
        console.debug('[database]', ...args)
    }
}

export const useDatabase = defineStore('database', {
    state: (): DatabaseState => ({
        previousOptionsRef: undefined,
        previousCurrentSessionIdRef: undefined,
        previousCurrentPuzzleRef: undefined,
        previousCurrentSessionRef: undefined,
        previousSolvesRef: undefined,
        previousSessionStatsRef: undefined,
        previousAllSessionsRef: undefined,
        previousAllStatsRef: undefined,
    }),
    getters: {
        optionsRef() {
            const user = useUser()
            return `/users/${user.userId}/options`
        },
        currentSessionIdRef() {
            const user = useUser()
            return `/users/${user.userId}/currentSessionId`
        },
        currentPuzzleRef() {
            const user = useUser()
            return `/users/${user.userId}/currentPuzzle`
        },
        currentSessionRef() {
            const user = useUser()
            const session = useSession()
            return `/users/${user.userId}/sessions/${session.sessionId}`
        },
        solvesRef() {
            const user = useUser()
            const puzzles = usePuzzles()
            return `/solves/${user.userId}/${puzzles.selectedPuzzleId}`
        },
        sessionStatsRef() {
            const user = useUser()
            const puzzles = usePuzzles()
            const session = useSession()
            return `/stats/${user.userId}/${puzzles.selectedPuzzleId}/${session.sessionId}`
        },
        allSessionsRef() {
            const user = useUser()
            return `/users/${user.userId}/sessions`
        },
        allStatsRef() {
            const user = useUser()
            const puzzles = usePuzzles()
            return `/stats/${user.userId}/${puzzles.selectedPuzzleId}`
        },
    },
    actions: {
        // external calls: things that modify the database from various areas in the app
        setOptions(options: ProfileOptions) {
            set(ref(getDatabase(), this.optionsRef), options)
        },
        setSelectedPuzzle(puzzleId: string) {
            set(ref(getDatabase(), this.currentPuzzleRef), puzzleId)
        },
        setCurrentSessionDate(moment: Moment) {
            set(ref(getDatabase(), this.currentSessionRef), {
                date: moment.format('M/D/YYYY'),
                timestamp: moment.valueOf(),
            })
        },
        createNewSessionIfNotExists() {
            return new Promise<void>((resolve) => {
                const session = useSession()

                if (!session.sessionId) {
                    const newSessionRef = push(ref(getDatabase(), this.allSessionsRef))

                    set(ref(getDatabase(), this.currentSessionIdRef), newSessionRef.key).then(() => {
                        this.setCurrentSessionDate(moment().utc().dayOfYear(moment().dayOfYear()).startOf('day'))
                        resolve()
                    })
                } else {
                    resolve()
                }
            })
        },
        closeCurrentSession() {
            set(ref(getDatabase(), this.currentSessionIdRef), undefined)
        },
        storeNewSolve(solveTime: number) {
            this.createNewSessionIfNotExists().then(() => {
                const session = useSession()
                const scramble = useScramble()

                push(ref(getDatabase(), this.solvesRef), {
                    sessionId: session.sessionId,
                    time: solveTime,
                    timestamp: serverTimestamp(),
                    scramble: scramble.text,
                    penalty: '',
                })

                scramble.requestNew()
            })
        },
        setSolvePenalty(solve: ISolve, penalty: SolvePenalty) {
            const newPenalty = solve.penalty === penalty ? '' : penalty
            update(child(ref(getDatabase(), this.solvesRef), solve.uid), { penalty: newPenalty }).then(() => this.updateCurrentSessionStats())
        },
        deleteSolve(solveId: string) {
            remove(child(ref(getDatabase(), this.solvesRef), solveId)).then(() => this.updateCurrentSessionStats())
        },
        updateCurrentSessionStats() {
            const session = useSession()

            if (session.solves.length === 0) {
                remove(ref(getDatabase(), this.sessionStatsRef))
                session.sessionStats = undefined
            } else {
                update(ref(getDatabase(), this.sessionStatsRef), {
                    mean: Stats.mean(session.solves),
                    count: Stats.count(session.solves),
                    best: Stats.best(session.solves),
                    worst: Stats.worst(session.solves),
                    stdDev: Stats.stdDev(session.solves),
                    mo3: Stats.mo3(session.solves),
                    ao5: Stats.ao5(session.solves),
                    ao12: Stats.ao12(session.solves),
                    ao50: Stats.ao50(session.solves),
                    ao100: Stats.ao100(session.solves),
                    bestMo3: Stats.bestMo3(session.solves),
                    bestAo5: Stats.bestAo5(session.solves),
                    bestAo12: Stats.bestAo12(session.solves),
                    bestAo50: Stats.bestAo50(session.solves),
                    bestAo100: Stats.bestAo100(session.solves),
                })
            }
        },

        // move this to a watcher somehow? don't want to rewrite this whole store as a setup function, but this currently needs to be called when the user is signed in or out
        setUpDatabaseOnAuthStateChanged() {
            debug('setUpDatabaseOnAuthStateChanged')
            const user = useUser()

            this.disconnectAllRefs()

            if (user.userId) {
                this.connectOptionsRef()
                this.connectCurrentSessionIdRef()
                this.connectCurrentPuzzleRef()
                this.connectAllSessionsRef()
            }
        },

        // internal calls: setting up database references, and reacting to changes from the database
        connectOptionsRef() {
            debug('connectOptionsRef')
            const options = useOptions()
            this.previousOptionsRef = this.optionsRef
            onValue(ref(getDatabase(), this.optionsRef), (snapshot) => {
                options.$patch({
                    showTimer: snapshot.val().showTimer,
                    timerTrigger: snapshot.val().timerTrigger,
                    themeUrl: snapshot.val().themeUrl,
                    holdToStart: snapshot.val().holdToStart,
                    useInspection: snapshot.val().useInspection,
                })
            })
        },
        connectCurrentSessionIdRef() {
            debug('connectCurrentSessionIdRef')
            const session = useSession()
            const user = useUser()
            this.previousCurrentSessionIdRef = this.currentSessionIdRef
            onValue(ref(getDatabase(), this.currentSessionIdRef), (snapshot) => {
                this.disconnectCurrentSessionRef()
                this.disconnectSessionStatsRef()

                session.sessionId = snapshot.val()

                if (user.userId && session.sessionId) {
                    this.connectCurrentSessionRef()
                    this.connectSessionStatsRef()
                }
            })
        },
        connectCurrentPuzzleRef() {
            debug('connectCurrentPuzzleRef')
            const puzzles = usePuzzles()
            const scramble = useScramble()
            const user = useUser()
            const session = useSession()
            this.previousCurrentPuzzleRef = this.currentPuzzleRef
            onValue(ref(getDatabase(), this.currentPuzzleRef), (snapshot) => {
                this.disconnectSolvesRef()
                this.disconnectAllStatsRef()
                this.disconnectSessionStatsRef()

                puzzles.selectedPuzzleId = snapshot.val()
                scramble.requestNew()

                if (user.userId) {
                    this.connectSolvesRef()
                    this.connectAllStatsRef()

                    if (session.sessionId) {
                        this.connectSessionStatsRef()
                    }
                }
            })
        },
        connectCurrentSessionRef() {
            debug('connectCurrentSessionRef')
            const session = useSession()
            this.previousCurrentSessionRef = this.currentSessionRef
            onValue(ref(getDatabase(), this.currentSessionRef), (snapshot) => {
                if (snapshot.exists()) {
                    session.updateSessionDate(snapshot.val().timestamp)
                }
            })
        },
        connectSolvesRef() {
            debug('connectSolvesRef')
            const session = useSession()
            this.previousSolvesRef = this.solvesRef
            onChildAdded(query(ref(getDatabase(), this.solvesRef), orderByChild('sessionId'), equalTo(session.sessionId as string)), (snapshot) => {
                session.addSolve(Solve.fromSnapshot(snapshot))
            })
            onChildChanged(query(ref(getDatabase(), this.solvesRef), orderByChild('sessionId'), equalTo(session.sessionId as string)), (snapshot) => {
                if (snapshot.key) {
                    session.updateSolve(snapshot.key, Solve.fromSnapshot(snapshot))
                }
            })
            onChildRemoved(query(ref(getDatabase(), this.solvesRef), orderByChild('sessionId'), equalTo(session.sessionId as string)), (snapshot) => {
                if (snapshot.key) {
                    session.removeSolve(snapshot.key)
                }
            })
        },
        connectSessionStatsRef() {
            debug('connectSessionStatsRef')
            const session = useSession()
            this.previousSessionStatsRef = this.sessionStatsRef
            onValue(ref(getDatabase(), this.sessionStatsRef), (snapshot) => {
                session.sessionStats = snapshot.val()
            })
        },
        connectAllSessionsRef() {
            debug('connectAllSessionsRef')
            const session = useSession()
            this.previousAllSessionsRef = this.allSessionsRef
            onValue(ref(getDatabase(), this.allSessionsRef), (snapshot) => {
                session.allSessions = snapshot.val()
            })
        },
        connectAllStatsRef() {
            debug('connectAllStatsRef')
            const session = useSession()
            this.previousAllStatsRef = this.allStatsRef
            onValue(ref(getDatabase(), this.allStatsRef), (snapshot) => {
                session.allStats = snapshot.val()
            })
        },
        disconnectOptionsRef() {
            debug('disconnectOptionsRef')
            if (this.previousOptionsRef) {
                off(ref(getDatabase(), this.previousOptionsRef))
                this.previousOptionsRef = undefined
            }
        },
        disconnectCurrentSessionIdRef() {
            debug('disconnectCurrentSessionIdRef')
            if (this.previousCurrentSessionIdRef) {
                off(ref(getDatabase(), this.previousCurrentSessionIdRef))
                this.previousCurrentSessionIdRef = undefined
            }
        },
        disconnectCurrentPuzzleRef() {
            debug('disconnectCurrentPuzzleRef')
            if (this.previousCurrentPuzzleRef) {
                off(ref(getDatabase(), this.previousCurrentPuzzleRef))
                this.previousCurrentPuzzleRef = undefined
            }
        },
        disconnectCurrentSessionRef() {
            debug('disconnectCurrentSessionRef')
            if (this.previousCurrentSessionRef) {
                off(ref(getDatabase(), this.previousCurrentSessionRef))
                this.previousCurrentSessionRef = undefined
            }
        },
        disconnectSolvesRef() {
            debug('disconnectSolvesRef')
            const session = useSession()
            session.clearSolves()

            if (this.previousSolvesRef) {
                off(ref(getDatabase(), this.previousSolvesRef))
                this.previousSolvesRef = undefined
            }
        },
        disconnectSessionStatsRef() {
            debug('disconnectSessionStatsRef')
            if (this.previousSessionStatsRef) {
                off(ref(getDatabase(), this.previousSessionStatsRef))
                this.previousSessionStatsRef = undefined
            }
        },
        disconnectAllSessionsRef() {
            debug('disconnectAllSessionsRef')
            if (this.previousAllSessionsRef) {
                off(ref(getDatabase(), this.previousAllSessionsRef))
                this.previousAllSessionsRef = undefined
            }
        },
        disconnectAllStatsRef() {
            debug('disconnectAllStatsRef')
            if (this.previousAllStatsRef) {
                off(ref(getDatabase(), this.previousAllStatsRef))
                this.previousAllStatsRef = undefined
            }
        },
        disconnectAllRefs() {
            debug('disconnectAllRefs')
            this.disconnectOptionsRef()
            this.disconnectCurrentSessionIdRef()
            this.disconnectCurrentPuzzleRef()
            this.disconnectCurrentSessionRef()
            this.disconnectSolvesRef()
            this.disconnectSessionStatsRef()
            this.disconnectAllSessionsRef()
            this.disconnectAllStatsRef()
        },
    },
})
