<template>
    <div id="app">
        <div class="container-fluid">
            <div id="timerTouchArea" @touchstart="timerState.triggerDown()" @touchend="timerState.triggerUp()">
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
    import moment from 'moment'
    import $ from 'jquery'
    import Vue from 'vue'
    import { Component, Watch } from 'vue-property-decorator'
    import PanelSessionStatistics from '@/components/panels/PanelSessionStatistics.vue'
    import PanelSolvesList from '@/components/panels/PanelSolvesList.vue'
    import PanelScrambleImage from '@/components/panels/PanelScrambleImage.vue'
    import Stackmat, { Packet } from 'stackmat'
    import TimerStateMachine from '@/util/timer-state-machine'
    import { TimerState, TimerStateMachineOptions } from '@/types'
    import { Actions, Mutations } from '@/types/store'
    import { formatTimeDelta } from '@/util/format'
    import { TimerTrigger } from '@/types/firebase'

    @Component({
        components: {
            'stats-panel': PanelSessionStatistics,
            'solves-panel': PanelSolvesList,
            'scramble-panel': PanelScrambleImage
        }
    })
    export default class Timer extends Vue {
        public timerStart = 0
        public timerLabel = '00:00:00'
        public stackmatStarted = false
        public stackmatLastTime = 0
        public timerState?: TimerStateMachine
        public inspectionCountdown = 0
        public inspectionTimer?: number
        public stackmat: Stackmat = new Stackmat()

        get scramble(): string {
            return this.$store.state.scramble
        }

        get hideUI(): boolean {
            return this.timerState ? !(this.timerState.state === TimerState.IDLE || this.timerState.state === TimerState.COMPLETE) : false
        }

        get timerTrigger(): string {
            return this.$store.state.options.timerTrigger
        }

        get showTimer(): boolean {
            return this.$store.state.options.showTimer
        }

        get holdToStart(): boolean {
            return this.$store.state.options.holdToStart
        }

        get useInspection(): boolean {
            return this.$store.state.options.useInspection
        }

        get currentPuzzle(): { puzzle: string } {
            return { puzzle: this.$store.state.activePuzzle }
        }

        get timerClass(): string {
            if (this.timerState) {
                switch (this.timerState.state) {
                    case TimerState.INSPECTION:
                        return 'timer-color-inspection timer-size-inspection'
                    case TimerState.STARTING:
                        return 'timer-color-starting ' + (this.useInspection ? 'timer-size-inspection' : 'timer-size-active')
                    case TimerState.READY:
                        return 'timer-color-ready ' + (this.useInspection ? 'timer-size-inspection' : 'timer-size-active')
                    case TimerState.RUNNING:
                        return 'timer-color-running timer-size-active'
                }
            }

            return 'timer-idle'
        }

        public created(): void {
            this.createTimerState()
            this.initTimers()
        }

        public destroyed(): void {
            this.disconnectTimers()
        }

        public initTimers(): void {
            if (this.timerTrigger === TimerTrigger.SPACEBAR) {
                this.stackmat.stop()

                $(document).on('keydown.aetherium', this, event => {
                    if (event.which === 32) {
                        event.preventDefault()
                        if (event.data.timerState) {
                            event.data.timerState.triggerDown()
                        }
                    }
                })

                $(document).on('keyup.aetherium', this, event => {
                    if (event.which === 32) {
                        event.preventDefault()
                        if (event.data.timerState) {
                            event.data.timerState.triggerUp()
                        }
                    }
                })
            } else if (this.timerTrigger === TimerTrigger.STACKMAT) {
                $(document).off('.aetherium')

                this.stackmat.on('reset', () => {
                    this.timerLabel = '00:00:00'
                })

                this.stackmat.on('ready', () => {
                    if (this.timerState) {
                        this.timerState.stackmatTrigger(TimerState.READY)
                    }
                })

                this.stackmat.on('starting', () => {
                    if (this.timerState) {
                        this.timerState.stackmatTrigger(TimerState.STARTING)
                    }
                })

                this.stackmat.on('started', () => {
                    this.stackmatStarted = true
                    if (this.timerState) {
                        this.timerState.stackmatTrigger(TimerState.RUNNING)
                    }
                })

                this.stackmat.on('stopped', (packet: Packet) => {
                    this.stackmatStarted = false
                    this.timerStart = 0
                    this.stackmatLastTime = packet.timeInMilliseconds
                    if (this.timerState) {
                        this.timerState.stackmatTrigger(TimerState.COMPLETE)
                    }
                })

                this.stackmat.on('leftHandDown', () => {
                    if (this.timerState && !this.stackmatStarted) {
                        this.timerState.stackmatTrigger(TimerState.INSPECTION)
                    }
                })

                this.stackmat.on('rightHandDown', () => {
                    if (this.timerState && !this.stackmatStarted) {
                        this.timerState.stackmatTrigger(TimerState.INSPECTION)
                    }
                })

                this.stackmat.start()
            }
        }

        public disconnectTimers(): void {
            $(document).off('.aetherium')
            this.stackmat.stop()
            this.stackmat.off()
        }

        public createTimerState(): void {
            const options: TimerStateMachineOptions = {
                holdToStart: this.holdToStart,
                useInspection: this.useInspection,
                onSolveStart: this.startTimer,
                onSolveComplete: this.stopTimer,
                onInspectionStart: this.startInspection
            }

            this.timerState = new TimerStateMachine(options)
        }

        public startInspection(): void {
            this.inspectionCountdown = 15
            this.timerLabel = this.inspectionCountdown.toString()

            this.inspectionTimer = setInterval(this.updateInspection, 1000)
        }

        public updateInspection(): void {
            this.inspectionCountdown -= 1

            if (this.inspectionCountdown === 0) {
                if (this.timerState) {
                    this.timerState.inspectionExceeded()
                }
                this.timerLabel = 'DNS'
                clearInterval(this.inspectionTimer)
                this.inspectionTimer = undefined
            } else {
                this.timerLabel = this.inspectionCountdown.toString()
            }
        }

        public startTimer(): void {
            this.timerStart = moment().valueOf()
            clearInterval(this.inspectionTimer)
            this.inspectionTimer = undefined

            if (this.showTimer) {
                setTimeout(this.updateTimer, 10)
            } else {
                this.timerLabel = 'Solve!'
            }
        }

        public updateTimer(): void {
            if (this.timerStart !== 0) {
                this.timerLabel = formatTimeDelta(moment().valueOf() - this.timerStart)
                setTimeout(this.updateTimer, 30)
            }
        }

        public stopTimer(): void {
            if (this.timerTrigger === TimerTrigger.SPACEBAR) {
                const stop = moment().valueOf()
                const start = this.timerStart
                this.timerStart = 0
                this.completeSolve(stop - start)
            } else if (this.timerTrigger === TimerTrigger.STACKMAT) {
                this.timerStart = 0
                this.completeSolve(this.stackmatLastTime)
            }
        }

        public completeSolve(delta: number): void {
            this.timerLabel = formatTimeDelta(delta)
            this.stackmatLastTime = 0
            this.$store.dispatch(Actions.STORE_SOLVE, delta)
        }

        @Watch('hideUI')
        public onHideUIChange(newValue: boolean): void {
            this.$store.commit(Mutations.SET_HIDE_UI, newValue)
        }

        @Watch('timerTrigger')
        public onTimerTriggerChange(newTrigger: TimerTrigger, oldTrigger: TimerTrigger): void {
            if (oldTrigger !== newTrigger) {
                this.timerStart = 0
                this.timerLabel = '00:00:00'
                this.disconnectTimers()
                this.initTimers()
            }
        }

        @Watch('holdToStart')
        public onHoldToStartChange(): void {
            this.createTimerState()
        }

        @Watch('useInspection')
        public onUseInspectionChange(): void {
            this.createTimerState()
        }
    }
</script>

<style src="./Timer.css"></style>
