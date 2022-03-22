import { equalTo, getDatabase, off, onChildAdded, onChildChanged, onChildRemoved, onValue, orderByChild, query, ref } from 'firebase/database'
import { defineStore } from 'pinia'
import { Solve } from '@/classes/solve'
import { debugLog } from '@/functions/debugLog'
import { useDatabase } from './database'
import { useOptions } from './options'
import { usePuzzles } from './puzzles'
import { useScramble } from './scramble'
import { useSession } from './session'
import { useSessionHistory } from './sessionHistory'
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
            debugLog('setUpDatabaseOnAuthStateChanged')
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
            debugLog('connectOptionsRef')
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
            debugLog('connectCurrentSessionIdRef')
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
            debugLog('connectCurrentPuzzleRef')
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
            debugLog('connectCurrentSessionRef')
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
            debugLog('connectSolvesRef')
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
            debugLog('connectSessionStatsRef')
            const database = useDatabase()
            const session = useSession()
            this.previousSessionStatsRef = database.sessionStatsRef
            onValue(ref(getDatabase(), database.sessionStatsRef), (snapshot) => {
                session.sessionStats = snapshot.val()
            })
        },
        connectAllSessionsRef() {
            debugLog('connectAllSessionsRef')
            const database = useDatabase()
            const sessionHistory = useSessionHistory()
            this.previousAllSessionsRef = database.allSessionsRef
            onValue(ref(getDatabase(), database.allSessionsRef), (snapshot) => {
                sessionHistory.allSessions = snapshot.val()
            })
        },
        connectAllStatsRef() {
            debugLog('connectAllStatsRef')
            const database = useDatabase()
            const sessionHistory = useSessionHistory()
            this.previousAllStatsRef = database.allStatsRef
            onValue(ref(getDatabase(), database.allStatsRef), (snapshot) => {
                sessionHistory.allStats = snapshot.val()
            })
        },
        disconnectOptionsRef() {
            debugLog('disconnectOptionsRef')
            if (this.previousOptionsRef) {
                off(ref(getDatabase(), this.previousOptionsRef))
                this.previousOptionsRef = undefined
            }
        },
        disconnectCurrentSessionIdRef() {
            debugLog('disconnectCurrentSessionIdRef')
            if (this.previousCurrentSessionIdRef) {
                off(ref(getDatabase(), this.previousCurrentSessionIdRef))
                this.previousCurrentSessionIdRef = undefined
            }
        },
        disconnectCurrentPuzzleRef() {
            debugLog('disconnectCurrentPuzzleRef')
            if (this.previousCurrentPuzzleRef) {
                off(ref(getDatabase(), this.previousCurrentPuzzleRef))
                this.previousCurrentPuzzleRef = undefined
            }
        },
        disconnectCurrentSessionRef() {
            debugLog('disconnectCurrentSessionRef')
            if (this.previousCurrentSessionRef) {
                off(ref(getDatabase(), this.previousCurrentSessionRef))
                this.previousCurrentSessionRef = undefined
            }
        },
        disconnectSolvesRef() {
            debugLog('disconnectSolvesRef')
            const session = useSession()
            session.clearSolves()

            if (this.previousSolvesRef) {
                off(ref(getDatabase(), this.previousSolvesRef))
                this.previousSolvesRef = undefined
            }
        },
        disconnectSessionStatsRef() {
            debugLog('disconnectSessionStatsRef')
            if (this.previousSessionStatsRef) {
                off(ref(getDatabase(), this.previousSessionStatsRef))
                this.previousSessionStatsRef = undefined
            }
        },
        disconnectAllSessionsRef() {
            debugLog('disconnectAllSessionsRef')
            if (this.previousAllSessionsRef) {
                off(ref(getDatabase(), this.previousAllSessionsRef))
                this.previousAllSessionsRef = undefined
            }
        },
        disconnectAllStatsRef() {
            debugLog('disconnectAllStatsRef')
            if (this.previousAllStatsRef) {
                off(ref(getDatabase(), this.previousAllStatsRef))
                this.previousAllStatsRef = undefined
            }
        },
        disconnectAllRefs() {
            debugLog('disconnectAllRefs')
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
