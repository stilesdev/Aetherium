import { defineStore } from 'pinia'
import type { Puzzle } from '@/types/firebase'
import type { ScramblePayload } from '@/types/store'

interface ScrambleState {
    _worker?: Worker
    text: string
    svg?: string
}

export const useScramble = defineStore('scramble', {
    state: (): ScrambleState => ({
        _worker: undefined,
        text: 'Generating scramble...',
        svg: undefined,
    }),
    getters: {
        worker: (state): Worker => {
            if (!state._worker) {
                state._worker = new Worker('/scrambler-worker.js')

                state._worker.addEventListener('message', (event: MessageEvent<ScramblePayload>) => {
                    if (event.data === undefined) {
                        state.text = 'No valid scrambler for this puzzle'
                        state.svg = undefined
                    } else {
                        state.text = event.data.text
                        state.svg = event.data.svg
                    }
                })
            }

            return state._worker
        },
    },
    actions: {
        request(puzzle: Puzzle) {
            this.text = 'Generating scramble...'
            this.svg = undefined

            this.worker.postMessage({
                scrambler: puzzle.scrambler,
            })
        },
    },
})
