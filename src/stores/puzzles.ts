import { get, getDatabase, ref as dbRef } from 'firebase/database'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { Puzzle } from '@/types/firebase'

export const usePuzzles = defineStore('puzzles', () => {
    const selectedPuzzleId = ref('333')
    const allPuzzles = ref<Record<string, Puzzle>>()

    get(dbRef(getDatabase(), '/puzzles')).then((snapshot) => {
        allPuzzles.value = snapshot.val()
    })

    const selectedPuzzle = computed(() => allPuzzles.value?.[selectedPuzzleId.value])

    return {
        selectedPuzzleId,
        selectedPuzzle,
        allPuzzles,
    }
})
