import { createStore as _createStore, Store } from 'vuex'
import { Mutations, type RootState } from '@/types/store'
import type { Pinia } from 'pinia'
import { useUser } from './stores/user'
import { useDatabase } from './stores/database'

export function createStore(pinia: Pinia): Store<RootState> {
    return _createStore({
        strict: import.meta.env.DEV,
        state: {
            hideUI: false,
        },
        mutations: {
            [Mutations.SET_HIDE_UI](state: RootState, hide: boolean): void {
                state.hideUI = hide
            },
        },
        plugins: [
            () => {
                const user = useUser(pinia)
                user.$subscribe(() => {
                    // TODO: move this somewhere else
                    const database = useDatabase(pinia)
                    database.setUpDatabaseOnAuthStateChanged()
                })
            },
        ],
    })
}
