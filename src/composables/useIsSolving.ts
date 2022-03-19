import { ref } from 'vue'

const isSolving = ref(false)

export function useIsSolving() {
    return { isSolving }
}
