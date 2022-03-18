import { defineStore } from 'pinia'
import { TimerTrigger, type ProfileOptions } from '@/types/firebase'

export const useOptions = defineStore('options', {
    state: (): ProfileOptions => ({
        showTimer: true,
        timerTrigger: TimerTrigger.SPACEBAR,
        themeUrl: '/themes/default.min.css',
        holdToStart: true,
        useInspection: true,
    }),
})
