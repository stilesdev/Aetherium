import type { FirebaseList, Puzzle, SessionPayload, StatisticsPayload } from '@/types/firebase'
import type { ISolve } from '@/types/index'

export interface RootState {
    hideUI: boolean
    puzzles?: FirebaseList<Puzzle>
    sessionId?: string
    sessionDate?: string
    activePuzzle: string
    solves: ISolve[]
    sessionStats?: StatisticsPayload
    allSessions?: FirebaseList<SessionPayload>
    allStats?: FirebaseList<StatisticsPayload>
}

export interface ScramblePayload {
    text: string
    svg?: string
}

export enum References {
    OPTIONS = 'OPTIONS',
    CURRENT_SESSION_ID = 'CURRENT_SESSION_ID',
    CURRENT_PUZZLE = 'CURRENT_PUZZLE',
    SESSION = 'SESSION',
    SOLVES = 'SOLVES',
    SESSION_STATS = 'SESSION_STATS',
    ALL_SESSIONS = 'ALL_SESSIONS',
    ALL_STATS = 'ALL_STATS',
}

export enum Mutations {
    RECEIVE_SESSION_ID = 'RECEIVE_SESSION_ID',
    RECEIVE_PUZZLES = 'RECEIVE_PUZZLES',
    RECEIVE_SESSION_DATE = 'RECEIVE_SESSION_DATE',
    SET_HIDE_UI = 'SET_HIDE_UI',
    RECEIVE_ACTIVE_PUZZLE = 'RECEIVE_ACTIVE_PUZZLE',
    CLEAR_SOLVES = 'CLEAR_SOLVES',
    ADD_SOLVE = 'ADD_SOLVE',
    UPDATE_SOLVE = 'UPDATE_SOLVE',
    DELETE_SOLVE = 'DELETE_SOLVE',
    RECEIVE_SESSION_STATS = 'RECEIVE_SESSION_STATS',
    RECEIVE_ALL_SESSIONS = 'RECEIVE_ALL_SESSIONS',
    RECEIVE_ALL_STATS = 'RECEIVE_ALL_STATS',
}

export enum Actions {
    SET_ACTIVE_PUZZLE = 'SET_ACTIVE_PUZZLE',
    UPDATE_SESSION_DATE = 'UPDATE_SESSION_DATE',
    CHECK_SESSION = 'CHECK_SESSION',
    CLOSE_SESSION = 'CLOSE_SESSION',
    STORE_SOLVE = 'STORE_SOLVE',
    SET_PENALTY = 'SET_PENALTY',
    DELETE_SOLVE = 'DELETE_SOLVE',
    UPDATE_STATS = 'UPDATE_STATS',
}
