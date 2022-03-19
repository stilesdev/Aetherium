import { defineStore } from 'pinia'
import type { Statistics } from '@/types'
import type { SessionPayload } from '@/types/firebase'

interface SessionHistoryState {
    allSessions?: Record<string, SessionPayload>
    allStats?: Record<string, Statistics>
}

export const useSessionHistory = defineStore('sessionHistory', {
    state: (): SessionHistoryState => ({
        allSessions: undefined,
        allStats: undefined,
    }),
})
