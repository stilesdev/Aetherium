export interface RootState {
    hideUI: boolean
}

export interface ScramblePayload {
    text: string
    svg?: string
}

export enum Mutations {
    SET_HIDE_UI = 'SET_HIDE_UI',
}
