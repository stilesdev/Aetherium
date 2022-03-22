import StateMachine, { type LifeCycle } from 'javascript-state-machine'
import { debugLog } from '@/functions/debugLog'
import { TimerState, type TimerStateMachineOptions } from '@/types'

export default class TimerStateMachine {
    private readonly holdToStart: boolean
    private readonly onInspectionStart: () => void
    private readonly onSolveComplete: () => void
    private readonly onSolveStart: () => void
    private readonly useInspection: boolean
    private readyTimer?: number
    private stateMachine: StateMachine

    constructor(options: TimerStateMachineOptions) {
        this.holdToStart = options.holdToStart
        this.useInspection = options.useInspection
        this.onSolveStart = options.onSolveStart
        this.onSolveComplete = options.onSolveComplete
        this.onInspectionStart = options.onInspectionStart

        this.stateMachine = new StateMachine({
            init: TimerState.IDLE,
            transitions: [
                {
                    name: 'triggerDown',
                    from: '*',
                    to: () => this.onTriggerDown(),
                },
                {
                    name: 'triggerUp',
                    from: '*',
                    to: () => this.onTriggerUp(),
                },
                {
                    name: 'stackmatTrigger',
                    from: '*',
                    to: (newState: TimerState) => this.onStackmatTrigger(newState),
                },
                {
                    name: 'inspectionExceeded',
                    from: TimerState.INSPECTION,
                    to: TimerState.IDLE,
                },
                {
                    name: 'timerReady',
                    from: TimerState.STARTING,
                    to: TimerState.READY,
                },
                {
                    name: 'timerReset',
                    from: TimerState.COMPLETE,
                    to: TimerState.IDLE,
                },
                {
                    name: 'goto',
                    from: '*',
                    to: (state) => state,
                },
                {
                    name: 'reset',
                    from: [TimerState.INSPECTION, TimerState.STARTING, TimerState.READY, TimerState.RUNNING, TimerState.COMPLETE],
                    to: TimerState.IDLE,
                },
            ],
            methods: {
                onBeforeTransition(lifecycle: LifeCycle): boolean {
                    return lifecycle.from !== lifecycle.to
                },
                onTransition(lifecycle: LifeCycle): boolean {
                    debugLog(`[timer-state] TRANSITION: ${lifecycle.transition}, FROM: ${lifecycle.from}, TO: ${lifecycle.to}`)
                    return true
                },
            },
        })
    }

    get state(): TimerState {
        try {
            return this.stateMachine.state as unknown as TimerState
        } catch (e) {
            return TimerState.IDLE
        }
    }

    public triggerDown(): void {
        this.stateMachine.triggerDown()
    }

    public triggerUp(): void {
        this.stateMachine.triggerUp()
    }

    public stackmatTrigger(newState: TimerState): void {
        this.stateMachine.stackmatTrigger(newState)
    }

    public inspectionExceeded(): void {
        this.stateMachine.inspectionExceeded()
    }

    public reset(): void {
        this.stateMachine.reset()
    }

    private onTriggerDown(): TimerState {
        switch (this.state) {
            case TimerState.IDLE:
                if (!this.useInspection) {
                    if (this.holdToStart) {
                        this.readyTimer = window.setTimeout(() => this.stateMachine.timerReady(), 500)
                        return TimerState.STARTING
                    } else {
                        return TimerState.READY
                    }
                } else {
                    return TimerState.IDLE
                }

            case TimerState.INSPECTION:
                if (this.holdToStart) {
                    this.readyTimer = window.setTimeout(() => this.stateMachine.timerReady(), 500)
                    return TimerState.STARTING
                } else {
                    return TimerState.READY
                }

            case TimerState.STARTING:
                return TimerState.STARTING

            case TimerState.READY:
                return TimerState.READY

            case TimerState.RUNNING:
                this.onSolveComplete()
                setTimeout(() => this.stateMachine.timerReset(), 2000)
                return TimerState.COMPLETE

            case TimerState.COMPLETE:
                return TimerState.COMPLETE
        }
    }

    private onTriggerUp(): TimerState {
        switch (this.state) {
            case TimerState.IDLE:
                if (this.useInspection) {
                    this.onInspectionStart()
                    return TimerState.INSPECTION
                } else {
                    return TimerState.IDLE
                }

            case TimerState.INSPECTION:
                return TimerState.INSPECTION

            case TimerState.STARTING:
                clearTimeout(this.readyTimer)
                return this.useInspection ? TimerState.INSPECTION : TimerState.IDLE

            case TimerState.READY:
                this.onSolveStart()
                return TimerState.RUNNING

            case TimerState.RUNNING:
                return TimerState.RUNNING

            case TimerState.COMPLETE:
                return TimerState.COMPLETE
        }
    }

    private onStackmatTrigger(newState: TimerState): TimerState {
        switch (this.state) {
            case TimerState.IDLE:
                if (this.useInspection && newState === TimerState.INSPECTION) {
                    this.onInspectionStart()
                    return TimerState.INSPECTION
                } else if (newState === TimerState.STARTING) {
                    return TimerState.STARTING
                } else {
                    return TimerState.IDLE
                }
            case TimerState.INSPECTION:
                return newState === TimerState.STARTING ? TimerState.STARTING : TimerState.INSPECTION
            case TimerState.STARTING:
                if (newState === TimerState.READY) {
                    return TimerState.READY
                } else if (newState === TimerState.IDLE || newState === TimerState.INSPECTION) {
                    return this.useInspection ? TimerState.INSPECTION : TimerState.IDLE
                } else if (newState === TimerState.RUNNING) {
                    this.onSolveStart()
                    return TimerState.RUNNING
                } else {
                    return TimerState.STARTING
                }
            case TimerState.READY:
                if (newState === TimerState.RUNNING) {
                    this.onSolveStart()
                    return TimerState.RUNNING
                } else {
                    return TimerState.READY
                }
            case TimerState.RUNNING:
                if (newState === TimerState.COMPLETE) {
                    this.onSolveComplete()
                    setTimeout(() => this.stateMachine.timerReset(), 2000)
                    return TimerState.COMPLETE
                } else {
                    return TimerState.RUNNING
                }
            case TimerState.COMPLETE:
                return newState === TimerState.IDLE ? TimerState.IDLE : TimerState.COMPLETE
        }
    }
}
