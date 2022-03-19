<template>
    <div id="app">
        <div class="container-fluid">
            <div id="timerTouchArea" @touchstart="onTouchStart" @touchend="onTouchEnd">
                <!-- this needs to go to 100vh height when timing -->
                <div class="row">
                    <transition name="fade">
                        <div id="scrambleArea" class="col-md-10 col-md-offset-1" v-if="!hideUI">
                            <h3>{{ scramble.text }}</h3>
                        </div>
                    </transition>
                </div>

                <div class="row">
                    <!-- This needs to be verically aligned in the parent div -->
                    <div id="timerArea">
                        <h1 id="timerLabel" :class="timerClass">
                            {{ timerLabel }}
                        </h1>
                    </div>
                </div>
            </div>

            <transition name="fade">
                <div id="timerInfoArea" v-if="!hideUI">
                    <div class="col-md-3 visible-md visible-lg">
                        <stats-panel></stats-panel>
                    </div>
                    <div class="col-md-6 col-xs-12 col-sm-12">
                        <solves-panel></solves-panel>
                    </div>
                    <div class="col-md-3 visible-md visible-lg">
                        <scramble-panel></scramble-panel>
                    </div>
                </div>
            </transition>
        </div>
    </div>
</template>

<script lang="ts">
    import PanelSessionStatistics from '@/components/panels/PanelSessionStatistics.vue'
    import PanelSolvesList from '@/components/panels/PanelSolvesList.vue'
    import PanelScrambleImage from '@/components/panels/PanelScrambleImage.vue'

    export default {
        components: {
            'stats-panel': PanelSessionStatistics,
            'solves-panel': PanelSolvesList,
            'scramble-panel': PanelScrambleImage,
        },
    }
</script>

<script lang="ts" setup>
    import moment from 'moment'
    import $ from 'jquery'
    import { computed, onUnmounted, ref, watch } from 'vue'
    import { useDatabase } from '@/stores/database'
    import { useOptions } from '@/stores/options'
    import { useScramble } from '@/stores/scramble'
    import Stackmat, { type Packet } from 'stackmat'
    import TimerStateMachine from '@/util/timer-state-machine'
    import { TimerState } from '@/types'
    import { millisToTimerFormat } from '@/functions/millisToTimerFormat'
    import { TimerTrigger } from '@/types/firebase'
    import { useIsSolving } from '@/composables/useIsSolving'

    const database = useDatabase()
    const options = useOptions()
    const scramble = useScramble()

    const timerStart = ref(0)
    const timerLabel = ref('00:00:00')
    const stackmatStarted = ref(false)
    const stackmatLastTime = ref(0)
    const timerState = ref<TimerStateMachine | undefined>(undefined)
    const inspectionCountdown = ref(0)
    const inspectionTimer = ref<number | undefined>(undefined)
    const stackmat = new Stackmat()

    const hideUI = computed(() => (timerState.value ? !(timerState.value.state === TimerState.IDLE || timerState.value.state === TimerState.COMPLETE) : false))
    const timerTrigger = computed(() => options.timerTrigger)
    const holdToStart = computed(() => options.holdToStart)
    const useInspection = computed(() => options.useInspection)
    const timerClass = computed(() => {
        if (timerState.value) {
            switch (timerState.value.state) {
                case TimerState.INSPECTION:
                    return 'timer-color-inspection timer-size-inspection'
                case TimerState.STARTING:
                    return 'timer-color-starting ' + (useInspection.value ? 'timer-size-inspection' : 'timer-size-active')
                case TimerState.READY:
                    return 'timer-color-ready ' + (useInspection.value ? 'timer-size-inspection' : 'timer-size-active')
                case TimerState.RUNNING:
                    return 'timer-color-running timer-size-active'
            }
        }

        return 'timer-idle'
    })

    const initTimers = () => {
        if (timerTrigger.value === TimerTrigger.SPACEBAR) {
            stackmat.stop()

            $(document).on('keydown.aetherium', this, (event) => {
                if (event.which === 32) {
                    event.preventDefault()
                    timerState.value?.triggerDown()
                }
            })

            $(document).on('keyup.aetherium', this, (event) => {
                if (event.which === 32) {
                    event.preventDefault()
                    timerState.value?.triggerUp()
                }
            })
        } else if (timerTrigger.value === TimerTrigger.STACKMAT) {
            $(document).off('.aetherium')

            stackmat.on('reset', () => {
                timerLabel.value = '00:00:00'
            })

            stackmat.on('ready', () => {
                timerState.value?.stackmatTrigger(TimerState.READY)
            })

            stackmat.on('starting', () => {
                timerState.value?.stackmatTrigger(TimerState.STARTING)
            })

            stackmat.on('started', () => {
                stackmatStarted.value = true
                timerState.value?.stackmatTrigger(TimerState.RUNNING)
            })

            stackmat.on('stopped', (packet: Packet) => {
                stackmatStarted.value = false
                timerStart.value = 0
                stackmatLastTime.value = packet.timeInMilliseconds
                timerState.value?.stackmatTrigger(TimerState.COMPLETE)
            })

            stackmat.on('leftHandDown', () => {
                if (!stackmatStarted.value) {
                    timerState.value?.stackmatTrigger(TimerState.INSPECTION)
                }
            })

            stackmat.on('rightHandDown', () => {
                if (!stackmatStarted.value) {
                    timerState.value?.stackmatTrigger(TimerState.INSPECTION)
                }
            })

            stackmat.start()
        }
    }

    const createTimerState = () => {
        timerState.value = new TimerStateMachine({
            holdToStart: holdToStart.value,
            useInspection: useInspection.value,
            onSolveStart: startTimer,
            onSolveComplete: stopTimer,
            onInspectionStart: startInspection,
        })
    }

    const disconnectTimers = () => {
        $(document).off('.aetherium')
        stackmat.stop()
        stackmat.off()
    }

    const startInspection = () => {
        inspectionCountdown.value = 15
        timerLabel.value = inspectionCountdown.value.toString()

        inspectionTimer.value = window.setInterval(updateInspection, 1000)
    }

    const updateInspection = () => {
        inspectionCountdown.value -= 1

        if (inspectionCountdown.value === 0) {
            timerState.value?.inspectionExceeded()
            timerLabel.value = 'DNS'
            clearInterval(inspectionTimer.value)
            inspectionTimer.value = undefined
        } else {
            timerLabel.value = inspectionCountdown.value.toString()
        }
    }

    const startTimer = () => {
        timerStart.value = moment().valueOf()
        clearInterval(inspectionTimer.value)
        inspectionTimer.value = undefined

        if (options.showTimer) {
            setTimeout(updateTimer, 10)
        } else {
            timerLabel.value = 'Solve!'
        }
    }

    const updateTimer = () => {
        if (timerStart.value !== 0) {
            timerLabel.value = millisToTimerFormat(moment().valueOf() - timerStart.value)
            setTimeout(updateTimer, 30)
        }
    }

    const stopTimer = () => {
        if (timerTrigger.value === TimerTrigger.SPACEBAR) {
            const stop = moment().valueOf()
            const start = timerStart.value
            timerStart.value = 0
            completeSolve(stop - start)
        } else if (timerTrigger.value === TimerTrigger.STACKMAT) {
            timerStart.value = 0
            completeSolve(stackmatLastTime.value)
        }
    }

    const completeSolve = (delta: number) => {
        timerLabel.value = millisToTimerFormat(delta)
        stackmatLastTime.value = 0
        database.storeNewSolve(delta)
    }

    const onTouchStart = () => {
        timerState.value?.triggerDown()
    }

    const onTouchEnd = () => {
        timerState.value?.triggerUp()
    }

    watch(hideUI, (newValue: boolean) => {
        const { isSolving } = useIsSolving()
        isSolving.value = newValue
    })

    watch(timerTrigger, (newTrigger, oldTrigger) => {
        if (oldTrigger !== newTrigger) {
            timerStart.value = 0
            timerLabel.value = '00:00:00'
            disconnectTimers()
            initTimers()
        }
    })

    watch(holdToStart, () => {
        createTimerState()
    })

    watch(useInspection, () => {
        createTimerState()
    })

    onUnmounted(() => {
        disconnectTimers()
    })

    // This was run in created() in Vue 2, run directly in setup() for Vue 3
    createTimerState()
    initTimers()
</script>

<style src="./TimerView.css"></style>
