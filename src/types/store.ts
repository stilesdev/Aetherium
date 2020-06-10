import { FirebaseList, ProfileOptions, Puzzle, SessionPayload, StatisticsPayload } from '@/types/firebase'
import { ISolve } from '@/types/index'
import WebWorker from 'worker-loader!*'

export interface RootState {
    hideUI: boolean
    scramblerWorker: WebWorker
    scramble: ScramblePayload
    puzzles?: FirebaseList<Puzzle>
    userId?: string
    options: ProfileOptions
    sessionId?: string
    sessionDate?: string
    activePuzzle: string
    solves: ISolve[]
    sessionStats?: StatisticsPayload
    allSessions?: FirebaseList<SessionPayload>
    allStats?: FirebaseList<StatisticsPayload>
}

export interface ScramblePayload {
    text: string,
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
    ALL_STATS = 'ALL_STATS'
}

export enum Mutations {
    RECEIVE_USER_ID = 'RECEIVE_USER_ID',
    RECEIVE_SESSION_ID = 'RECEIVE_SESSION_ID',
    RECEIVE_PUZZLES = 'RECEIVE_PUZZLES',
    RECEIVE_SESSION_DATE = 'RECEIVE_SESSION_DATE',
    SET_OPTION_SHOWTIMER = 'SET_OPTION_SHOWTIMER',
    SET_OPTION_TIMERTRIGGER = 'SET_OPTION_TIMERTRIGGER',
    SET_OPTION_THEME_URL = 'SET_OPTION_THEME_URL',
    SET_OPTION_HOLD_TO_START = 'SET_OPTION_HOLD_TO_START',
    SET_OPTION_USE_INSPECTION = 'SET_OPTION_USE_INSPECTION',
    SET_HIDE_UI = 'SET_HIDE_UI',
    RECEIVE_ACTIVE_PUZZLE = 'RECEIVE_ACTIVE_PUZZLE',
    RECEIVE_SCRAMBLE = 'RECEIVE_SCRAMBLE',
    CLEAR_SOLVES = 'CLEAR_SOLVES',
    ADD_SOLVE = 'ADD_SOLVE',
    UPDATE_SOLVE = 'UPDATE_SOLVE',
    DELETE_SOLVE = 'DELETE_SOLVE',
    RECEIVE_SESSION_STATS = 'RECEIVE_SESSION_STATS',
    RECEIVE_ALL_SESSIONS = 'RECEIVE_ALL_SESSIONS',
    RECEIVE_ALL_STATS = 'RECEIVE_ALL_STATS'
}

export enum Actions {
    SET_OPTIONS = 'SET_OPTIONS',
    SET_ACTIVE_PUZZLE = 'SET_ACTIVE_PUZZLE',
    UPDATE_SESSION_DATE = 'UPDATE_SESSION_DATE',
    REQUEST_SCRAMBLE = 'REQUEST_SCRAMBLE',
    CHECK_SESSION = 'CHECK_SESSION',
    CLOSE_SESSION = 'CLOSE_SESSION',
    STORE_SOLVE = 'STORE_SOLVE',
    SET_PENALTY = 'SET_PENALTY',
    DELETE_SOLVE = 'DELETE_SOLVE',
    UPDATE_STATS = 'UPDATE_STATS'
}
