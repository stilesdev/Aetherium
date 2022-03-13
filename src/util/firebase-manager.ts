import moment from 'moment'
import type { Store } from 'vuex'
import { Mutations, References, type RootState } from '@/types/store'
import { Solve } from '@/classes/solve'
import { type DatabaseReference, equalTo, off, onChildAdded, onChildChanged, onChildRemoved, onValue, orderByChild, query } from 'firebase/database'
import type { Pinia } from 'pinia'
import { useOptions } from '@/stores/options'
import { usePuzzles } from '@/stores/puzzles'

class FirebaseManager {
    constructor(private pinia: Pinia) {}

    private previousRefs: { [key in References]?: DatabaseReference } = {}

    public connectRef(ref: References, store: Store<RootState>): void {
        switch (ref) {
            case References.OPTIONS:
                this.previousRefs[ref] = store.getters.optionsRef
                onValue(store.getters.optionsRef, (snapshot) => {
                    const options = useOptions(this.pinia)
                    options.$patch({
                        showTimer: snapshot.val().showTimer,
                        timerTrigger: snapshot.val().timerTrigger,
                        themeUrl: snapshot.val().themeUrl,
                        holdToStart: snapshot.val().holdToStart,
                        useInspection: snapshot.val().useInspection,
                    })
                })
                break
            case References.CURRENT_SESSION_ID:
                this.previousRefs[ref] = store.getters.currentSessionIdRef
                onValue(store.getters.currentSessionIdRef, (snapshot) => {
                    store.commit(Mutations.RECEIVE_SESSION_ID, snapshot.val())

                    this.disconnectRef(References.SOLVES)
                    this.disconnectRef(References.SESSION_STATS)
                    this.disconnectRef(References.ALL_SESSIONS)
                    this.disconnectRef(References.ALL_STATS)
                    store.commit(Mutations.CLEAR_SOLVES)

                    this.connectRef(References.SOLVES, store)
                    this.connectRef(References.SESSION_STATS, store)
                    this.connectRef(References.ALL_SESSIONS, store)
                    this.connectRef(References.ALL_STATS, store)
                })
                break
            case References.CURRENT_PUZZLE:
                this.previousRefs[ref] = store.getters.currentPuzzleRef
                onValue(store.getters.currentPuzzleRef, (snapshot) => {
                    const puzzles = usePuzzles(this.pinia)
                    puzzles.selectedPuzzleId = snapshot.val()
                })
                break
            case References.SESSION:
                this.previousRefs[ref] = store.getters.currentSessionRef
                onValue(store.getters.currentSessionRef, (snapshot) => {
                    if (snapshot.exists()) {
                        store.commit(Mutations.RECEIVE_SESSION_DATE, {
                            moment: moment(snapshot.val().timestamp).utc(),
                        })
                    }
                })
                break
            case References.SOLVES:
                this.previousRefs[ref] = store.getters.solvesRef
                onChildAdded(query(store.getters.solvesRef, orderByChild('sessionId'), equalTo(store.state.sessionId as string)), (snapshot) => {
                    store.commit(Mutations.ADD_SOLVE, Solve.fromSnapshot(snapshot))
                })
                onChildChanged(query(store.getters.solvesRef, orderByChild('sessionId'), equalTo(store.state.sessionId as string)), (snapshot) => {
                    store.commit(Mutations.UPDATE_SOLVE, {
                        uid: snapshot.key,
                        solve: Solve.fromSnapshot(snapshot),
                    })
                })
                onChildRemoved(query(store.getters.solvesRef, orderByChild('sessionId'), equalTo(store.state.sessionId as string)), (snapshot) => {
                    store.commit(Mutations.DELETE_SOLVE, snapshot.key)
                })
                break
            case References.SESSION_STATS:
                this.previousRefs[ref] = store.getters.sessionStatsRef
                onValue(store.getters.sessionStatsRef, (snapshot) => {
                    store.commit(Mutations.RECEIVE_SESSION_STATS, snapshot.val())
                })
                break
            case References.ALL_SESSIONS:
                this.previousRefs[ref] = store.getters.sessionsRef
                onValue(store.getters.sessionsRef, (snapshot) => {
                    store.commit(Mutations.RECEIVE_ALL_SESSIONS, snapshot.val())
                })
                break
            case References.ALL_STATS:
                this.previousRefs[ref] = store.getters.statsRef
                onValue(store.getters.statsRef, (snapshot) => {
                    store.commit(Mutations.RECEIVE_ALL_STATS, snapshot.val())
                })
                break
        }
    }

    public disconnectRef(ref: References) {
        const previousRef = this.previousRefs[ref]
        if (typeof previousRef !== 'undefined') {
            off(previousRef)
            delete this.previousRefs[ref]
        }
    }

    public disconnectAllRefs() {
        Object.values(this.previousRefs).forEach((previousRef) => {
            if (typeof previousRef !== 'undefined') {
                off(previousRef)
            }
        })
        this.previousRefs = {}
    }
}

export default FirebaseManager
