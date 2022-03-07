import type { ISession, ISolve } from '@/types'
import { Stats } from '@/util/stats'
import type { SolvePayload, StatisticsPayload } from '@/types/firebase'

export class Session implements ISession {
    public solves: ISolve[] = []
    public stats: StatisticsPayload = {
        mean: 0,
        count: 0,
        best: 0,
        worst: 0,
        stdDev: 0,
        mo3: 0,
        ao5: 0,
        ao12: 0,
        ao50: 0,
        ao100: 0,
        bestMo3: 0,
        bestAo5: 0,
        bestAo12: 0,
        bestAo50: 0,
        bestAo100: 0,
    }

    public addSolve(solve: ISolve): void {
        this.solves.push(solve)
        this.sort()
        this.updateStats()
    }

    public updateSolve(solveUid: string, payload: SolvePayload): void {
        this.solves.forEach((solve) => {
            if (solve.uid === solveUid) {
                solve.time = payload.time
                solve.timestamp = payload.timestamp
                solve.scramble = payload.scramble
                solve.penalty = payload.penalty
            }
        })

        this.updateStats()
    }

    public deleteSolve(solveUid: string): void {
        this.solves.splice(
            this.solves.findIndex((solve) => solve.uid === solveUid),
            1
        )
        this.updateStats()
    }

    private sort(): void {
        // TODO: implement auto-sorted list instead of calling sort each time a solve is added
        this.solves.sort((a, b) => {
            return b.timestamp - a.timestamp
        })
    }

    private updateStats(): void {
        this.stats.mean = Stats.mean(this.solves)
        this.stats.count = Stats.count(this.solves)
        this.stats.best = Stats.best(this.solves)
        this.stats.worst = Stats.worst(this.solves)
        this.stats.stdDev = Stats.stdDev(this.solves)
        this.stats.mo3 = Stats.mo3(this.solves)
        this.stats.ao5 = Stats.ao5(this.solves)
        this.stats.ao12 = Stats.ao12(this.solves)
        this.stats.ao50 = Stats.ao50(this.solves)
        this.stats.ao100 = Stats.ao100(this.solves)
        this.stats.bestMo3 = Stats.bestMo3(this.solves)
        this.stats.bestAo5 = Stats.bestAo5(this.solves)
        this.stats.bestAo12 = Stats.bestAo12(this.solves)
        this.stats.bestAo50 = Stats.bestAo50(this.solves)
        this.stats.bestAo100 = Stats.bestAo100(this.solves)
    }
}
