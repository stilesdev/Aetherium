import DataSnapshot = firebase.database.DataSnapshot
import { ISolve } from '@/types'
import { formatTimeDelta, formatTimeDeltaShort, formatTimestamp } from '@/util/format'
import { SolvePenalty } from '@/types/firebase'

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
        return formatTimeDelta(this.finalTime)
    }

    public get formattedTimeShort(): string {
        return formatTimeDeltaShort(this.finalTime)
    }

    public get formattedTimestamp(): string {
        return formatTimestamp(this.timestamp)
    }
}
