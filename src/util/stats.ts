import { ISolve } from '@/types'

export abstract class Stats {
    public static mean(solves: ISolve[]): number {
        return this.meanOfRange(solves, 0, solves.length - 1)
    }

    public static average(solves: ISolve[]): number {
        return this.averageOfRange(solves, 0, solves.length - 1)
    }

    public static count(solves: ISolve[]): number {
        return solves.length
    }

    public static best(solves: ISolve[]): number {
        if (solves.length === 0) {
            return 0
        }

        let best = Number.MAX_VALUE
        let dnfCount = 0

        solves.forEach((solve) => {
            const time = solve.finalTime

            if (time === -1) {
                dnfCount += 1
            } else if (time < best) {
                best = time
            }
        })

        return dnfCount === solves.length ? -1 : best
    }

    public static worst(solves: ISolve[]): number {
        let worst = 0

        solves.forEach((solve) => {
            if (worst !== -1) {
                const time = solve.finalTime

                if (time === -1) {
                    worst = -1
                } else if (time > worst) {
                    worst = time
                }
            }
        })

        return worst
    }

    public static stdDev(solves: ISolve[]): number {
        const mean = this.meanOfRange(solves, 0, solves.length - 1)

        if (mean <= 0) {
            return mean
        }

        let stDev = 0

        solves.forEach((solve) => {
            stDev += Math.pow(solve.finalTime - mean, 2)
        })

        return Math.sqrt(stDev / solves.length)
    }

    public static mo3(solves: ISolve[]): number {
        return solves.length < 3 ? 0 : this.meanOfRange(solves, 0, 2)
    }

    public static ao5(solves: ISolve[]): number {
        return solves.length < 5 ? 0 : this.averageOfRange(solves, 0, 4)
    }

    public static ao12(solves: ISolve[]): number {
        return solves.length < 12 ? 0 : this.averageOfRange(solves, 0, 11)
    }

    public static ao50(solves: ISolve[]): number {
        return solves.length < 50 ? 0 : this.averageOfRange(solves, 0, 49)
    }

    public static ao100(solves: ISolve[]): number {
        return solves.length < 100 ? 0 : this.averageOfRange(solves, 0, 99)
    }

    public static bestMo3(solves: ISolve[]): number {
        return solves.length < 3 ? 0 : this.bestMean(solves, 3)
    }

    public static bestAo5(solves: ISolve[]): number {
        return solves.length < 5 ? 0 : this.bestAverage(solves, 5)
    }

    public static bestAo12(solves: ISolve[]): number {
        return solves.length < 12 ? 0 : this.bestAverage(solves, 12)
    }

    public static bestAo50(solves: ISolve[]): number {
        return solves.length < 50 ? 0 : this.bestAverage(solves, 50)
    }

    public static bestAo100(solves: ISolve[]): number {
        return solves.length < 100 ? 0 : this.bestAverage(solves, 100)
    }

    private static meanOfRange(solves: ISolve[], startIdx: number, endIdx: number): number {
        if (endIdx < startIdx) {
            return 0
        }

        let mean = 0

        for (let i = startIdx; i <= endIdx; i++) {
            const time = solves[i].finalTime

            if (time === -1) {
                return -1
            }

            mean += time
        }

        return mean / (endIdx - startIdx + 1)
    }

    private static averageOfRange(solves: ISolve[], startIdx: number, endIdx: number): number {
        let average = 0
        let dnfCount = 0
        let best = Number.MAX_VALUE
        let worst = 0

        for (let i = startIdx; i <= endIdx; i++) {
            const time = solves[i].finalTime

            if (time === -1) {
                dnfCount += 1
            } else {
                average += time

                if (time < best) {
                    best = time
                }

                if (time > worst) {
                    worst = time
                }
            }
        }

        if (dnfCount === 0) {
            return (average - best - worst) / (endIdx - startIdx - 1)
        } else if (dnfCount === 1) {
            return (average - best) / (endIdx - startIdx - 1)
        } else {
            return -1
        }
    }

    private static bestMean(solves: ISolve[], meanSize: number): number {
        let best = Number.MAX_VALUE
        let start = 0
        let end = meanSize - 1

        while (end < solves.length) {
            const mean = this.meanOfRange(solves, start, end)
            if (mean < best) {
                best = mean
            }
            start++
            end++
        }

        return best
    }

    private static bestAverage(solves: ISolve[], averageSize: number): number {
        let best = Number.MAX_VALUE
        let start = 0
        let end = averageSize - 1

        while (end < solves.length) {
            const average = this.averageOfRange(solves, start, end)
            if (average < best) {
                best = average
            }
            start++
            end++
        }

        return best
    }
}
