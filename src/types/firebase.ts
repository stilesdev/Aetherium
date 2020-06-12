export interface FirebaseList<T> {
    [id: string]: T
}

export interface Puzzle {
    key: string
    name: string
    scrambler: string
    sortOrder: number
}

export interface SolvePayload {
    penalty: SolvePenalty
    scramble: string
    sessionId: string
    time: number
    timestamp: number
}

export enum SolvePenalty {
    NONE = '',
    PLUSTWO = '+2',
    DNF = 'dnf'
}

export interface StatisticsPayload {
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
    bestAo100: number
}

export interface UserProfile {
    currentPuzzle: string
    currentSessionId: string
    email: string
    options: ProfileOptions
    sessions: FirebaseList<SessionPayload>
}

export interface ProfileOptions {
    holdToStart: boolean
    showTimer: boolean
    themeUrl: string
    timerTrigger: TimerTrigger
    useInspection: boolean
}

export enum TimerTrigger {
    SPACEBAR = 'spacebar',
    STACKMAT = 'stackmat'
}

export interface SessionPayload {
    date: string
    timestamp: number
}
