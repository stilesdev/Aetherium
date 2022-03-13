import { get, getDatabase, ref as dbRef, set } from 'firebase/database'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { Puzzle } from '@/types/firebase'
import { useUser } from './user'

export const usePuzzles = defineStore('puzzles', () => {
    const selectedPuzzleId = ref('333')
    const allPuzzles = ref<Record<string, Puzzle>>()

    get(dbRef(getDatabase(), '/puzzles')).then((snapshot) => {
        allPuzzles.value = snapshot.val()
    })

    const selectedPuzzle = computed(() => allPuzzles.value?.[selectedPuzzleId.value])

    const setSelectedPuzzle = (puzzleId: string) => {
        // TODO: get this ref from a getter
        const user = useUser()
        const currentPuzzleRef = dbRef(getDatabase(), `/users/${user.userId}/currentPuzzle`)

        set(currentPuzzleRef, puzzleId)
    }

    return {
        selectedPuzzleId,
        selectedPuzzle,
        allPuzzles,
        setSelectedPuzzle,
    }
})
