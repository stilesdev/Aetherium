import { defineStore } from 'pinia'
import { TimerTrigger, type ProfileOptions } from '@/types/firebase'
import { getDatabase, ref, set } from 'firebase/database'
import { useUser } from './user'

export const useOptions = defineStore('options', {
    state: (): ProfileOptions => ({
        showTimer: true,
        timerTrigger: TimerTrigger.SPACEBAR,
        themeUrl: '/themes/default.min.css',
        holdToStart: true,
        useInspection: true,
    }),
    actions: {
        setOptions(options: ProfileOptions): void {
            // TODO: use getter to get this ref
            const user = useUser()
            const optionsRef = ref(getDatabase(), `/users/${user.userId}/options`)

            set(optionsRef, options)
        },
    },
})
