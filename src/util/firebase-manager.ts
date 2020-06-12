import moment from 'moment'
import { Store } from 'vuex'
import { Mutations, References, RootState } from '@/types/store'
import { Solve } from '@/classes/solve'
import DataSnapshot = firebase.database.DataSnapshot
import Reference = firebase.database.Reference

class FirebaseManager {
    private previousRefs: { [key in References]?: Reference } = {}

    public connectRef(ref: References, store: Store<RootState>): void {
        switch (ref) {
            case References.OPTIONS:
                this.previousRefs[ref] = store.getters.optionsRef
                store.getters.optionsRef.on('value', (snapshot: DataSnapshot) => {
                    store.commit(Mutations.SET_OPTION_SHOWTIMER, snapshot.val().showTimer)
                    store.commit(Mutations.SET_OPTION_TIMERTRIGGER, snapshot.val().timerTrigger)
                    store.commit(Mutations.SET_OPTION_THEME_URL, snapshot.val().themeUrl)
                    store.commit(Mutations.SET_OPTION_HOLD_TO_START, snapshot.val().holdToStart)
                    store.commit(Mutations.SET_OPTION_USE_INSPECTION, snapshot.val().useInspection)
                })
                break
            case References.CURRENT_SESSION_ID:
                this.previousRefs[ref] = store.getters.currentSessionIdRef
                store.getters.currentSessionIdRef.on('value', (snapshot: DataSnapshot) => {
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
                store.getters.currentPuzzleRef.on('value', (snapshot: DataSnapshot) => {
                    store.commit(Mutations.RECEIVE_ACTIVE_PUZZLE, snapshot.val())
                })
                break
            case References.SESSION:
                this.previousRefs[ref] = store.getters.currentSessionRef
                store.getters.currentSessionRef.on('value', (snapshot: DataSnapshot) => {
                    if (snapshot.exists()) {
                        store.commit(Mutations.RECEIVE_SESSION_DATE, {
                            moment: moment(snapshot.val().timestamp).utc()
                        })
                    }
                })
                break
            case References.SOLVES:
                this.previousRefs[ref] = store.getters.solvesRef
                store.getters.solvesRef
                    .orderByChild('sessionId')
                    .equalTo(store.state.sessionId as string)
                    .on('child_added', (snapshot: DataSnapshot) => {
                        store.commit(Mutations.ADD_SOLVE, Solve.fromSnapshot(snapshot))
                    })
                store.getters.solvesRef
                    .orderByChild('sessionId')
                    .equalTo(store.state.sessionId as string)
                    .on('child_changed', (snapshot: DataSnapshot) => {
                        store.commit(Mutations.UPDATE_SOLVE, {
                            uid: snapshot.key,
                            solve: Solve.fromSnapshot(snapshot)
                        })
                    })
                store.getters.solvesRef
                    .orderByChild('sessionId')
                    .equalTo(store.state.sessionId as string)
                    .on('child_removed', (snapshot: DataSnapshot) => {
                        store.commit(Mutations.DELETE_SOLVE, snapshot.key)
                    })
                break
            case References.SESSION_STATS:
                this.previousRefs[ref] = store.getters.sessionStatsRef
                store.getters.sessionStatsRef.on('value', (snapshot: DataSnapshot) => {
                    store.commit(Mutations.RECEIVE_SESSION_STATS, snapshot.val())
                })
                break
            case References.ALL_SESSIONS:
                this.previousRefs[ref] = store.getters.sessionsRef
                store.getters.sessionsRef.on('value', (snapshot: DataSnapshot) => {
                    store.commit(Mutations.RECEIVE_ALL_SESSIONS, snapshot.val())
                })
                break
            case References.ALL_STATS:
                this.previousRefs[ref] = store.getters.statsRef
                store.getters.statsRef.on('value', (snapshot: DataSnapshot) => {
                    store.commit(Mutations.RECEIVE_ALL_STATS, snapshot.val())
                })
                break
        }
    }

    public disconnectRef(ref: References) {
        if (this.previousRefs[ref]) {
            this.previousRefs[ref]?.off()
            delete this.previousRefs[ref]
        }
    }

    public disconnectAllRefs() {
        Object.values(this.previousRefs).forEach(ref => ref?.off())
        this.previousRefs = {}
    }
}

export default new FirebaseManager()
