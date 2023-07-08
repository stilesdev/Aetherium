<script lang="ts" setup>
    import moment from 'moment'
    import $ from 'jquery'
    import { computed, ref } from 'vue'
    import { useRouter } from 'vue-router'
    import { useDatabase } from '@/stores/database'
    import { usePuzzles } from '@/stores/puzzles'
    import { useUser } from '@/stores/user'
    import { useOptions } from '@/stores/options'
    import { useSession } from '@/stores/session'
    import type { ThemeData } from '@/types'
    import { SolveImporter } from '@/util/solve-importer'
    import type { ProfileOptions } from '@/types/firebase'
    import { TimerTrigger } from '@/types/firebase'

    const router = useRouter()
    const database = useDatabase()
    const puzzles = usePuzzles()
    const user = useUser()
    const options = useOptions()
    const session = useSession()

    const tempOptions = ref<ProfileOptions>({
        showTimer: true,
        timerTrigger: TimerTrigger.SPACEBAR,
        holdToStart: true,
        useInspection: true,
        themeUrl: '/themes/default.min.css',
    })

    const importTextValid = ref(true)
    const importText = ref('')
    const solveImporter = ref<SolveImporter | undefined>()
    const themes: ThemeData[] = [
        { name: 'Default', url: '/themes/default.min.css' },
        { name: 'Cerulean', url: '/themes/cerulean.min.css' },
        { name: 'Cosmo', url: '/themes/cosmo.min.css' },
        { name: 'Cyborg', url: '/themes/cyborg.min.css' },
        { name: 'Darkly', url: '/themes/darkly.min.css' },
        { name: 'Flatly', url: '/themes/flatly.min.css' },
        { name: 'Journal', url: '/themes/journal.min.css' },
        { name: 'Lumen', url: '/themes/lumen.min.css' },
        { name: 'Paper', url: '/themes/paper.min.css' },
        { name: 'Readable', url: '/themes/readable.min.css' },
        { name: 'Sandstone', url: '/themes/sandstone.min.css' },
        { name: 'Simplex', url: '/themes/simplex.min.css' },
        { name: 'Slate', url: '/themes/slate.min.css' },
        { name: 'Spacelab', url: '/themes/spacelab.min.css' },
        { name: 'Superhero', url: '/themes/superhero.min.css' },
        { name: 'United', url: '/themes/united.min.css' },
        { name: 'Yeti', url: '/themes/yeti.min.css' },
    ]

    const allPuzzles = computed(() => (puzzles.allPuzzles ? Object.values(puzzles.allPuzzles).sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)) : []))

    const selectedPuzzle = computed({
        get: () => puzzles.selectedPuzzleId,
        set: (value) => database.setSelectedPuzzle(value),
    })

    const sessionDate = computed({
        get: () => {
            let temp

            if (moment.isMoment(session.sessionDate)) {
                temp = session.sessionDate
            } else {
                temp = moment()
            }

            return moment().utc().dayOfYear(temp.dayOfYear()).startOf('day').format('YYYY-MM-DD')
        },
        set: (value) => {
            database.setCurrentSessionDate(moment().utc().dayOfYear(moment(value, 'YYYY-MM-DD').dayOfYear()).startOf('day'))
        },
    })

    const onCloseSessionClick = () => {
        $('#closeSessionModal').modal()
    }

    const onCloseSessionConfirm = () => {
        database.closeCurrentSession()
    }

    const openOptionsModal = () => {
        tempOptions.value = Object.assign({}, options.$state)
        $('#optionsModal').modal()
    }

    const onOptionsModalSave = () => {
        database.setOptions(tempOptions.value)
    }

    const openImportModal = () => {
        solveImporter.value = new SolveImporter(user.userId)
        $('#importModal').modal()
    }

    const validateImportText = () => {
        importTextValid.value = solveImporter.value?.validate(importText.value) || false
    }

    const runImport = () => {
        if (importTextValid.value) {
            solveImporter.value?.import(importText.value)
        } else {
            alert('Invalid JSON entered.')
        }
    }

    const logout = () => {
        user.logout()
            .then(() => router.push('/login'))
            .catch((errorMessage: string) => alert(errorMessage))
    }
</script>

<template>
    <div id="app">
        <nav class="navbar navbar-default">
            <div class="container-fluid">
                <!-- Brand and toggle get grouped for better mobile display -->
                <div class="navbar-header">
                    <button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#header-navbar-collapse" aria-expanded="false">
                        <span class="icon-bar" />
                        <span class="icon-bar" />
                        <span class="icon-bar" />
                    </button>
                    <RouterLink class="navbar-brand" to="/" exact>
                        Aetherium
                    </RouterLink>
                </div>

                <!-- Collect the nav links, forms, and other content for toggling -->
                <div id="header-navbar-collapse" class="collapse navbar-collapse">
                    <ul class="nav navbar-nav">
                        <RouterLink v-slot="{ href, navigate, isActive }" to="/timer" custom>
                            <li :class="{ active: isActive }">
                                <a :href="href" @click="navigate">Timer</a>
                            </li>
                        </RouterLink>
                        <RouterLink v-slot="{ href, navigate, isActive }" to="/statistics" custom>
                            <li :class="{ active: isActive }">
                                <a :href="href" @click="navigate">Session Stats</a>
                            </li>
                        </RouterLink>
                        <RouterLink v-slot="{ href, navigate, isActive }" to="/history" custom>
                            <li :class="{ active: isActive }">
                                <a :href="href" @click="navigate">History</a>
                            </li>
                        </RouterLink>
                        <RouterLink v-slot="{ href, navigate, isActive }" to="/personal-bests" custom>
                            <li :class="{ active: isActive }">
                                <a :href="href" @click="navigate">Personal Bests</a>
                            </li>
                        </RouterLink>
                    </ul>

                    <form v-if="allPuzzles" class="navbar-form navbar-left">
                        <div class="form-group">
                            <select v-model="selectedPuzzle" class="form-control">
                                <option v-for="puzzle in allPuzzles" :key="puzzle.key" :value="puzzle.key">
                                    {{ puzzle.name }}
                                </option>
                            </select>
                        </div>
                        <div class="form-group">
                            <button type="button" class="btn btn-primary" @click="onCloseSessionClick">
                                Close Session
                            </button>
                        </div>
                    </form>

                    <ul class="nav navbar-nav navbar-right">
                        <li class="dropdown">
                            <a
                                href="#"
                                class="dropdown-toggle"
                                data-toggle="dropdown"
                                role="button"
                                aria-haspopup="true"
                                aria-expanded="false"
                            >
                                <span class="glyphicon glyphicon-cog" />
                                <span class="caret" />
                            </a>
                            <ul class="dropdown-menu">
                                <li>
                                    <a href="#" @click="openOptionsModal">Options</a>
                                </li>
                                <li>
                                    <a href="#" @click="openImportModal">Import</a>
                                </li>
                                <li role="separator" class="divider" />
                                <li><a href="#" @click="logout">Logout</a></li>
                            </ul>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>

        <!-- Close Session Modal -->
        <div id="closeSessionModal" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="closeSessionModalLabel">
            <div class="modal-dialog" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                        <h4 id="closeSessionModalLabel" class="modal-title">
                            Close Session
                        </h4>
                    </div>

                    <div class="modal-body">
                        <form class="form-inline">
                            <div class="form-group">
                                <p>Are you sure you would like to close the current session?</p>
                            </div>
                            <div class="form-group">
                                <label for="sessionDatePicker">Session Date:</label>
                                <input id="sessionDatePicker" v-model="sessionDate" type="date">
                            </div>
                        </form>

                        <!-- TODO: Add quick summary of session stats for each puzzle -->
                    </div>

                    <div class="modal-footer">
                        <button type="button" class="btn btn-default" data-dismiss="modal">
                            Cancel
                        </button>
                        <button type="button" class="btn btn-primary" data-dismiss="modal" @click="onCloseSessionConfirm">
                            Close Session
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Options Modal -->
        <div id="optionsModal" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="optionsModalLabel">
            <div class="modal-dialog" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                        <h4 id="optionsModalLabel" class="modal-title">
                            Options
                        </h4>
                    </div>

                    <div class="modal-body">
                        <label for="timerTriggerOptionsGroup">Timer Trigger</label>
                        <div id="timerTriggerOptionsGroup" class="btn-group" data-toggle="buttons">
                            <label
                                class="btn btn-default"
                                :class="{
                                    active: tempOptions.timerTrigger === TimerTrigger.SPACEBAR,
                                }"
                                @click="tempOptions.timerTrigger = TimerTrigger.SPACEBAR"
                            >
                                <input id="spacebarTimerTrigger" type="radio" name="timerTriggerOptions" autocomplete="off">Spacebar
                            </label>
                            <label
                                class="btn btn-default"
                                :class="{
                                    active: tempOptions.timerTrigger === TimerTrigger.STACKMAT,
                                }"
                                @click="tempOptions.timerTrigger = TimerTrigger.STACKMAT"
                            >
                                <input id="stackmatTimerTrigger" type="radio" name="timerTriggerOptions" autocomplete="off">Stackmat
                            </label>
                        </div>

                        <hr>

                        <input id="showTimerCheckbox" v-model="tempOptions.showTimer" type="checkbox">
                        <label for="showTimerCheckbox">Show timer while solving</label>

                        <hr>

                        <input id="holdToStartCheckbox" v-model="tempOptions.holdToStart" type="checkbox">
                        <label for="holdToStartCheckbox">Hold spacebar/touchscreen to start timer</label>

                        <hr>

                        <input id="useInspectionCheckbox" v-model="tempOptions.useInspection" type="checkbox">
                        <label for="useInspectionCheckbox">Use inspection</label>

                        <hr>

                        <div class="form-group form-inline">
                            <label for="themeSelector">Theme</label>
                            <select id="themeSelector" v-model="tempOptions.themeUrl" class="form-control">
                                <option v-for="theme in themes" :key="theme.name" :value="theme.url">
                                    {{ theme.name }}
                                </option>
                            </select>
                        </div>
                    </div>

                    <div class="modal-footer">
                        <button type="button" class="btn btn-default" data-dismiss="modal">
                            Cancel
                        </button>
                        <button type="button" class="btn btn-primary" data-dismiss="modal" @click="onOptionsModalSave">
                            Save
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Import Modal -->
        <div id="importModal" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="importModalLabel">
            <div class="modal-dialog" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                        <h4 id="importModalLabel" class="modal-title">
                            Import
                        </h4>
                    </div>

                    <div class="modal-body">
                        <p>Example Input:</p>
                        <pre><code>{{ JSON.stringify({
                            "M/D/YYYY": {
                                puzzle: [
                                    {
                                        penalty: "",
                                        scramble: "",
                                        time: 0,
                                        timestamp: 1234567890000,
                                    },
                                ],
                            },
                        }, undefined, 2) }}
                        </code></pre>
                        <div
                            class="form-group"
                            :class="{
                                'has-error': !importTextValid,
                                'has-success': importTextValid,
                            }"
                        >
                            <textarea v-model="importText" class="form-control" @input="validateImportText" />
                        </div>
                    </div>

                    <div class="modal-footer">
                        <button type="button" class="btn btn-default" data-dismiss="modal">
                            Cancel
                        </button>
                        <button type="button" class="btn btn-primary" data-dismiss="modal" @click="runImport">
                            Import
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style>
    pre {
        text-align: left;
    }

    .modal-body textarea {
        width: 100%;
        height: 25vh;
    }
</style>
