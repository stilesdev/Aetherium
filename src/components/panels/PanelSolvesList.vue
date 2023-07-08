<script lang="ts" setup>
    import { computed } from 'vue'
    import { useDatabase } from '@/stores/database'
    import { useSession } from '@/stores/session'
    import type { ISolve } from '@/types'
    import { SolvePenalty } from '@/types/firebase'
    import Panel from './PanelRoot.vue'

    const database = useDatabase()
    const session = useSession()

    const solves = computed(() => session.solves)

    const setPenalty = (solve: ISolve, penalty: SolvePenalty) => {
        database.setSolvePenalty(solve, penalty)
    }

    const deleteSolve = (solveId: string) => {
        database.deleteSolve(solveId)
    }
</script>

<template>
    <Panel panel-title="Session Solves">
        <h4 v-if="solves.length === 0">
            No Solves Yet!
        </h4>
        <table v-else class="table table-striped">
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
                        >+2</span>
                        <span
                            class="penalty-link"
                            :class="{
                                'penalty-active': solve.penalty === SolvePenalty.DNF,
                            }"
                            @click="setPenalty(solve, SolvePenalty.DNF)"
                        >DNF</span>
                        <span class="penalty-link" @click="deleteSolve(solve.uid)"><span class="glyphicon glyphicon-remove" /></span>
                    </td>
                </tr>
            </tbody>
        </table>
    </Panel>
</template>

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
