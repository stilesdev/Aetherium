import type { DataSnapshot } from 'firebase/database'
import type { ISolve } from '@/types'
import type { SolvePenalty } from '@/types/firebase'
import { millisToTimerFormat } from '@/composables/millisToTimerFormat'
import { millisToShortTimerFormat } from '@/composables/millisToShortTimerFormat'
import { timestampToDateTime } from '@/composables/timestampToDateTime'

export class Solve implements ISolve {
    public static fromSnapshot(solveSnapshot: DataSnapshot): Solve {
        const val = solveSnapshot.val()
        return new Solve(solveSnapshot.key as string, val.sessionId, val.time, val.timestamp, val.scramble, val.penalty)
    }

    public uid: string
    public sessionId: string
    public time: number
    public timestamp: number
    public scramble: string
    public penalty: SolvePenalty

    constructor(uid: string, sessionId: string, time: number, timestamp: number, scramble: string, penalty: SolvePenalty) {
        this.uid = uid
        this.sessionId = sessionId
        this.time = time
        this.timestamp = timestamp
        this.scramble = scramble
        this.penalty = penalty
    }

    public get finalTime(): number {
        if (this.penalty === 'dnf') {
            return -1
        } else {
            return this.penalty === '+2' ? this.time + 2000 : this.time
        }
    }

    public get formattedTime(): string {
        return millisToTimerFormat(this.finalTime)
    }

    public get formattedTimeShort(): string {
        return millisToShortTimerFormat(this.finalTime)
    }

    public get formattedTimestamp(): string {
        return timestampToDateTime(this.timestamp)
    }
}
