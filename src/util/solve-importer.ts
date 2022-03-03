import { type Schema, Validator } from 'jsonschema'
import moment from 'moment'
import { getDatabase, push, ref, set } from 'firebase/database'
import { Solve } from '@/classes/solve'
import { Stats } from '@/util/stats'
import type { SolvePayload } from '@/types/firebase'

export class SolveImporter {
    private userId: string
    private validator: Validator
    private readonly schema: Schema

    constructor(userId: string) {
        this.userId = userId
        this.validator = new Validator()

        const solveSchema: Schema = {
            id: '/Solve',
            type: 'object',
            properties: {
                penalty: { type: 'string', pattern: '|\\+2|dnf' },
                scramble: { type: 'string' },
                time: { type: 'integer', minimum: 1 },
                timestamp: { type: 'integer', minimum: 1000000000000 },
            },
            required: ['penalty', 'scramble', 'time', 'timestamp'],
            additionalProperties: false,
        }

        const puzzleSchema: Schema = {
            id: '/Puzzle',
            type: 'object',
            patternProperties: {
                '.*': {
                    type: 'array',
                    items: { $ref: '/Solve' },
                },
            },
        }

        const sessionSchema: Schema = {
            id: '/Session',
            type: 'object',
            patternProperties: {
                '([2-9]|1[0-2]?)/([1-9]|[1-2][0-9]|3[0-1])/(20\\d{2})': {
                    $ref: '/Puzzle',
                },
            },
            additionalProperties: false,
        }

        this.validator.addSchema(solveSchema, '/Solve')
        this.validator.addSchema(puzzleSchema, '/Puzzle')
        this.schema = sessionSchema
    }

    public validate(inputData: string): boolean {
        try {
            const input = JSON.parse(inputData)
            if (input && typeof input === 'object') {
                return this.validator.validate(input, this.schema).valid
            }
        } catch (e) {
            return false
        }
        return false
    }

    public import(inputData: string): void {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let input: any

        try {
            input = JSON.parse(inputData)
        } catch (e) {
            return
        }

        const db = getDatabase()

        Object.keys(input).forEach((date) => {
            const year = parseInt(date.split('/')[2], 10)
            const month = parseInt(date.split('/')[0], 10) - 1
            const day = parseInt(date.split('/')[1], 10)
            const sessionMoment = moment().utc().year(year).month(month).date(day).startOf('day')

            const newSessionRef = push(ref(db, `/users/${this.userId}/sessions`))

            if (newSessionRef.key) {
                const newSessionId = newSessionRef.key
                set(newSessionRef, {
                    date: sessionMoment.format('M/D/YYYY'),
                    timestamp: sessionMoment.valueOf(),
                })

                Object.keys(input[date]).forEach((puzzle) => {
                    const solves: Solve[] = []
                    input[date][puzzle].forEach((solve: SolvePayload) => {
                        push(ref(db, `/solves/${this.userId}/${puzzle}`)).then((solveRef) => {
                            set(solveRef, {
                                sessionId: newSessionId,
                                time: solve.time,
                                timestamp: solve.timestamp,
                                scramble: solve.scramble,
                                penalty: solve.penalty,
                            })
                            solves.push(new Solve(solveRef.key as string, newSessionId, solve.time, solve.timestamp, solve.scramble, solve.penalty))
                        })
                    })
                    set(ref(db, `/stats/${this.userId}/${puzzle}/${newSessionId}`), {
                        mean: Stats.mean(solves),
                        count: Stats.count(solves),
                        best: Stats.best(solves),
                        worst: Stats.worst(solves),
                        stdDev: Stats.stdDev(solves),
                        mo3: Stats.mo3(solves),
                        ao5: Stats.ao5(solves),
                        ao12: Stats.ao12(solves),
                        ao50: Stats.ao50(solves),
                        ao100: Stats.ao100(solves),
                        bestMo3: Stats.bestMo3(solves),
                        bestAo5: Stats.bestAo5(solves),
                        bestAo12: Stats.bestAo12(solves),
                        bestAo50: Stats.bestAo50(solves),
                        bestAo100: Stats.bestAo100(solves),
                    })
                })
            }
        })
    }
}
