import type { ISolve, Statistics } from '@/types'
import moment, { type Moment } from 'moment'
import { defineStore } from 'pinia'

interface SessionState {
    sessionId?: string
    sessionDate?: Moment
    solves: ISolve[]
    sessionStats?: Statistics
}

export const useSession = defineStore('session', {
    state: (): SessionState => ({
        sessionId: undefined,
        sessionDate: undefined,
        solves: [],
        sessionStats: undefined,
    }),
    actions: {
        updateSessionDate(timestamp: number) {
            this.sessionDate = moment(timestamp).utc()
        },
        clearSolves() {
            this.solves = []
        },
        addSolve(solve: ISolve) {
            this.solves.unshift(solve)
        },
        updateSolve(solveUid: string, payload: ISolve) {
            this.solves.splice(
                this.solves.findIndex((solve) => solve.uid === solveUid),
                1,
                payload
            )
        },
        removeSolve(solveUid: string) {
            this.solves.splice(
                this.solves.findIndex((solve) => solve.uid === solveUid),
                1
            )
        },
    },
})
