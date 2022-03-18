import { child, get, getDatabase, push, ref, remove, serverTimestamp, set, update } from 'firebase/database'
import { defineStore } from 'pinia'
import { useUser } from '@/stores/user'
import { usePuzzles } from './puzzles'
import { useSession } from './session'
import moment, { type Moment } from 'moment'
import type { ProfileOptions, SolvePenalty } from '@/types/firebase'
import type { ISolve } from '@/types'
import { useScramble } from './scramble'
import { Stats } from '@/util/stats'

export const useDatabase = defineStore('database', {
    getters: {
        userRef() {
            const user = useUser()
            return `/users/${user.userId}`
        },
        optionsRef() {
            const user = useUser()
            return `/users/${user.userId}/options`
        },
        currentSessionIdRef() {
            const user = useUser()
            return `/users/${user.userId}/currentSessionId`
        },
        currentPuzzleRef() {
            const user = useUser()
            return `/users/${user.userId}/currentPuzzle`
        },
        currentSessionRef() {
            const user = useUser()
            const session = useSession()
            return `/users/${user.userId}/sessions/${session.sessionId}`
        },
        solvesRef() {
            const user = useUser()
            const puzzles = usePuzzles()
            return `/solves/${user.userId}/${puzzles.selectedPuzzleId}`
        },
        sessionStatsRef() {
            const user = useUser()
            const puzzles = usePuzzles()
            const session = useSession()
            return `/stats/${user.userId}/${puzzles.selectedPuzzleId}/${session.sessionId}`
        },
        allSessionsRef() {
            const user = useUser()
            return `/users/${user.userId}/sessions`
        },
        allStatsRef() {
            const user = useUser()
            const puzzles = usePuzzles()
            return `/stats/${user.userId}/${puzzles.selectedPuzzleId}`
        },
    },
    actions: {
        createUserProfileIfNotExists(email: string) {
            return new Promise<void>((resolve) => {
                const userRef = ref(getDatabase(), this.userRef)
                get(userRef).then((snapshot) => {
                    if (snapshot.exists()) {
                        resolve()
                    } else {
                        set(userRef, {
                            currentPuzzle: '333',
                            email: email,
                            options: {
                                showTimer: true,
                                timerTrigger: 'spacebar',
                                holdToStart: true,
                                useInspection: true,
                            },
                        }).finally(() => resolve())
                    }
                })
            })
        },
        setOptions(options: ProfileOptions) {
            set(ref(getDatabase(), this.optionsRef), options)
        },
        setSelectedPuzzle(puzzleId: string) {
            set(ref(getDatabase(), this.currentPuzzleRef), puzzleId)
        },
        setCurrentSessionDate(moment: Moment) {
            set(ref(getDatabase(), this.currentSessionRef), {
                date: moment.format('M/D/YYYY'),
                timestamp: moment.valueOf(),
            })
        },
        createNewSessionIfNotExists() {
            return new Promise<void>((resolve) => {
                const session = useSession()

                if (!session.sessionId) {
                    const newSessionRef = push(ref(getDatabase(), this.allSessionsRef))

                    set(ref(getDatabase(), this.currentSessionIdRef), newSessionRef.key).then(() => {
                        this.setCurrentSessionDate(moment().utc().dayOfYear(moment().dayOfYear()).startOf('day'))
                        resolve()
                    })
                } else {
                    resolve()
                }
            })
        },
        closeCurrentSession() {
            set(ref(getDatabase(), this.currentSessionIdRef), undefined)
        },
        storeNewSolve(solveTime: number) {
            this.createNewSessionIfNotExists().then(() => {
                const session = useSession()
                const scramble = useScramble()

                push(ref(getDatabase(), this.solvesRef), {
                    sessionId: session.sessionId,
                    time: solveTime,
                    timestamp: serverTimestamp(),
                    scramble: scramble.text,
                    penalty: '',
                })

                scramble.requestNew()
            })
        },
        setSolvePenalty(solve: ISolve, penalty: SolvePenalty) {
            const newPenalty = solve.penalty === penalty ? '' : penalty
            update(child(ref(getDatabase(), this.solvesRef), solve.uid), { penalty: newPenalty }).then(() => this.updateCurrentSessionStats())
        },
        deleteSolve(solveId: string) {
            remove(child(ref(getDatabase(), this.solvesRef), solveId)).then(() => this.updateCurrentSessionStats())
        },
        updateCurrentSessionStats() {
            const session = useSession()

            if (session.solves.length === 0) {
                remove(ref(getDatabase(), this.sessionStatsRef))
                session.sessionStats = undefined
            } else {
                update(ref(getDatabase(), this.sessionStatsRef), {
                    mean: Stats.mean(session.solves),
                    count: Stats.count(session.solves),
                    best: Stats.best(session.solves),
                    worst: Stats.worst(session.solves),
                    stdDev: Stats.stdDev(session.solves),
                    mo3: Stats.mo3(session.solves),
                    ao5: Stats.ao5(session.solves),
                    ao12: Stats.ao12(session.solves),
                    ao50: Stats.ao50(session.solves),
                    ao100: Stats.ao100(session.solves),
                    bestMo3: Stats.bestMo3(session.solves),
                    bestAo5: Stats.bestAo5(session.solves),
                    bestAo12: Stats.bestAo12(session.solves),
                    bestAo50: Stats.bestAo50(session.solves),
                    bestAo100: Stats.bestAo100(session.solves),
                })
            }
        },
    },
})
