<template>
    <panel panelTitle="Session Solves">
        <h4 v-if="solves.length === 0">No Solves Yet!</h4>
        <table class="table table-striped" v-else>
            <thead>
                <tr class="visible-md visible-lg">
                    <td><strong>Timestamp</strong></td>
                    <td><strong>Time</strong></td>
                    <td><strong>Scramble</strong></td>
                    <td><strong>Actions</strong></td>
                </tr>
            </thead>
            <tbody>
                <tr v-for="solve in solves" :key="solve.uid">
                    <td class="timestamp-column">
                        {{ solve.formattedTimestamp }}
                    </td>
                    <td
                        class="time-column"
                        :class="{
                            'penalty-active': solve.penalty !== SolvePenalty.NONE,
                        }"
                    >
                        {{ solve.formattedTime }}
                    </td>
                    <td class="scramble-column visible-md visible-lg">
                        {{ solve.scramble }}
                    </td>
                    <td class="actions-column">
                        <span
                            class="penalty-link"
                            :class="{
                                'penalty-active': solve.penalty === SolvePenalty.PLUSTWO,
                            }"
                            @click="setPenalty(solve, SolvePenalty.PLUSTWO)"
                            >+2</span
                        >
                        <span
                            class="penalty-link"
                            :class="{
                                'penalty-active': solve.penalty === SolvePenalty.DNF,
                            }"
                            @click="setPenalty(solve, SolvePenalty.DNF)"
                            >DNF</span
                        >
                        <span class="penalty-link" @click="deleteSolve(solve.uid)"><span class="glyphicon glyphicon-remove"></span></span>
                    </td>
                </tr>
            </tbody>
        </table>
    </panel>
</template>

<script lang="ts">
    import PanelRoot from './PanelRoot.vue'

    export default {
        components: {
            panel: PanelRoot,
        },
    }
</script>

<script lang="ts" setup>
    import { computed } from 'vue'
    import { useStore } from 'vuex'
    import { ISolve } from '@/types'
    import { Actions } from '@/types/store'
    import { SolvePenalty } from '@/types/firebase'

    const store = useStore()

    const solves = computed<ISolve[]>(() => store.state.solves)

    const setPenalty = (solve: ISolve, penalty: SolvePenalty) => {
        store.dispatch(Actions.SET_PENALTY, { solve, penalty })
    }

    const deleteSolve = (solveId: string) => {
        store.dispatch(Actions.DELETE_SOLVE, solveId)
    }
</script>

<style>
    .timestamp-column {
        width: 8em;
    }

    .time-column {
        width: 4em;
    }

    .scramble-column {
        text-align: justify;
        text-align-last: center;
    }

    .actions-column {
        width: 8em;
    }
</style>
