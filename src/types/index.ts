import { StateMachineState } from 'javascript-state-machine'

export interface SolveData {
    time: number
    timestamp: number
    scramble: string
    penalty: string
}

export interface ISolve extends SolveData {
    uid: string

    readonly finalTime: number
    readonly formattedTime: string
    readonly formattedTimeShort: string
    readonly formattedTimestamp: string
}

export interface ISession {
    solves: ISolve[]
    stats: Statistics

    addSolve: (solve: ISolve) => void
    updateSolve: (solveUid: string, data: SolveData) => void
    deleteSolve: (solveUid: string) => void
}

export interface Session {
    timestamp: number,
    date: string
}

export interface Statistics {
    mean: number
    count: number
    best: number
    worst: number
    stdDev: number
    mo3: number
    ao5: number
    ao12: number
    ao50: number
    ao100: number
    bestMo3: number
    bestAo5: number
    bestAo12: number
    bestAo50: number
    bestAo100: number,
    date?: string
}

export interface ThemeData {
    name: string
    url: string
}

export interface TimerStateMachineOptions {
    holdToStart: boolean
    useInspection: boolean
    onSolveStart: () => void
    onSolveComplete: () => void
    onInspectionStart: () => void
}

export type TimerState = 'idle' | 'inspection' | 'starting' | 'ready' | 'running' | 'complete'

