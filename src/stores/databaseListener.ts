import { equalTo, getDatabase, off, onChildAdded, onChildChanged, onChildRemoved, onValue, orderByChild, query, ref } from 'firebase/database'
import { defineStore } from 'pinia'
import { Solve } from '@/classes/solve'
import { useDatabase } from './database'
import { useOptions } from './options'
import { usePuzzles } from './puzzles'
import { useScramble } from './scramble'
import { useSession } from './session'
import { useUser } from './user'

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

export const useDatabaseListener = defineStore('databaseListener', {
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
    actions: {
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
        connectOptionsRef() {
            debug('connectOptionsRef')
            const database = useDatabase()
            const options = useOptions()
            this.previousOptionsRef = database.optionsRef
            onValue(ref(getDatabase(), database.optionsRef), (snapshot) => {
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
            const database = useDatabase()
            const session = useSession()
            const user = useUser()
            this.previousCurrentSessionIdRef = database.currentSessionIdRef
            onValue(ref(getDatabase(), database.currentSessionIdRef), (snapshot) => {
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
            const database = useDatabase()
            const puzzles = usePuzzles()
            const scramble = useScramble()
            const user = useUser()
            const session = useSession()
            this.previousCurrentPuzzleRef = database.currentPuzzleRef
            onValue(ref(getDatabase(), database.currentPuzzleRef), (snapshot) => {
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
            const database = useDatabase()
            const session = useSession()
            this.previousCurrentSessionRef = database.currentSessionRef
            onValue(ref(getDatabase(), database.currentSessionRef), (snapshot) => {
                if (snapshot.exists()) {
                    session.updateSessionDate(snapshot.val().timestamp)
                }
            })
        },
        connectSolvesRef() {
            debug('connectSolvesRef')
            const database = useDatabase()
            const session = useSession()
            this.previousSolvesRef = database.solvesRef
            onChildAdded(query(ref(getDatabase(), database.solvesRef), orderByChild('sessionId'), equalTo(session.sessionId as string)), (snapshot) => {
                session.addSolve(Solve.fromSnapshot(snapshot))
            })
            onChildChanged(query(ref(getDatabase(), database.solvesRef), orderByChild('sessionId'), equalTo(session.sessionId as string)), (snapshot) => {
                if (snapshot.key) {
                    session.updateSolve(snapshot.key, Solve.fromSnapshot(snapshot))
                }
            })
            onChildRemoved(query(ref(getDatabase(), database.solvesRef), orderByChild('sessionId'), equalTo(session.sessionId as string)), (snapshot) => {
                if (snapshot.key) {
                    session.removeSolve(snapshot.key)
                }
            })
        },
        connectSessionStatsRef() {
            debug('connectSessionStatsRef')
            const database = useDatabase()
            const session = useSession()
            this.previousSessionStatsRef = database.sessionStatsRef
            onValue(ref(getDatabase(), database.sessionStatsRef), (snapshot) => {
                session.sessionStats = snapshot.val()
            })
        },
        connectAllSessionsRef() {
            debug('connectAllSessionsRef')
            const database = useDatabase()
            const session = useSession()
            this.previousAllSessionsRef = database.allSessionsRef
            onValue(ref(getDatabase(), database.allSessionsRef), (snapshot) => {
                session.allSessions = snapshot.val()
            })
        },
        connectAllStatsRef() {
            debug('connectAllStatsRef')
            const database = useDatabase()
            const session = useSession()
            this.previousAllStatsRef = database.allStatsRef
            onValue(ref(getDatabase(), database.allStatsRef), (snapshot) => {
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
