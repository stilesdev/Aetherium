import DataSnapshot = firebase.database.DataSnapshot
import { ISolve } from '@/types'
import { formatTimeDelta, formatTimeDeltaShort, formatTimestamp } from '@/util/format'

export class Solve implements ISolve {
    public static fromSnapshot(solveSnapshot: DataSnapshot): Solve {
        const val = solveSnapshot.val()
        return new Solve(solveSnapshot.key as string, val.time, val.timestamp, val.scramble, val.penalty)
    }

    public uid: string
    public time: number
    public timestamp: number
    public scramble: string
    public penalty: string

    constructor(uid: string, time: number, timestamp: number, scramble: string, penalty: string) {
        this.uid = uid
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
