import { type Store, useStore as _useStore } from 'vuex'
import type { RootState } from '@/types/store'

export function useStore(): Store<RootState> {
    return _useStore<RootState>()
}
