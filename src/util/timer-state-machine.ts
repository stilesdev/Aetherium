import StateMachine, { LifeCycle } from 'javascript-state-machine'
import { TimerState, TimerStateMachineOptions } from '@/types'

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
            init: 'idle',
            transitions: [
                {
                    name: 'triggerDown',
                    from: '*',
                    to: () => this.onTriggerDown()
                },
                {
                    name: 'triggerUp',
                    from: '*',
                    to: () => this.onTriggerUp()
                },
                {
                    name: 'stackmatTrigger',
                    from: '*',
                    to: (newState: TimerState) => this.onStackmatTrigger(newState)
                },
                {
                    name: 'inspectionExceeded',
                    from: 'inspection',
                    to: 'idle'
                },
                {
                    name: 'timerReady',
                    from: 'starting',
                    to: 'ready'
                },
                {
                    name: 'timerReset',
                    from: 'complete',
                    to: 'idle'
                },
                {
                    name: 'goto',
                    from: '*',
                    to: (state) => state
                },
                {
                    name: 'reset',
                    from: [ 'inspection', 'starting', 'ready', 'running', 'complete' ],
                    to: 'idle'
                }
            ],
            methods: {
                onBeforeTransition(lifecycle: LifeCycle): boolean {
                    return lifecycle.from !== lifecycle.to
                },
                onTransition(lifecycle: LifeCycle): boolean {
                    // tslint:disable-next-line: no-console
                    console.log(`TRANSITION: ${lifecycle.transition}, FROM: ${lifecycle.from}, TO: ${lifecycle.to}`)
                    return true
                }
            }
        })
    }

    get state(): TimerState {
        try {
            return this.stateMachine.state as unknown as TimerState
        } catch (e) {
            return 'idle'
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
            case 'idle':
                if (!this.useInspection) {
                    if (this.holdToStart) {
                        this.readyTimer = setTimeout(() => this.stateMachine.timerReady(), 500)
                        return 'starting'
                    } else {
                        return 'ready'
                    }
                } else {
                    return 'idle'
                }

            case 'inspection':
                if (this.holdToStart) {
                    this.readyTimer = setTimeout(() => this.stateMachine.timerReady(), 500)
                    return 'starting'
                } else {
                    return 'ready'
                }

            case 'starting':
                return 'starting'

            case 'ready':
                return 'ready'

            case 'running':
                this.onSolveComplete()
                setTimeout(() => this.stateMachine.timerReset(), 2000)
                return 'complete'

            case 'complete':
                return 'complete'
        }
    }

    private onTriggerUp(): TimerState {
        switch (this.state) {
            case 'idle':
                if (this.useInspection) {
                    this.onInspectionStart()
                    return 'inspection'
                } else {
                    return 'idle'
                }

            case 'inspection':
                return 'inspection'

            case 'starting':
                clearTimeout(this.readyTimer)
                return this.useInspection ? 'inspection' : 'idle'

            case 'ready':
                this.onSolveStart()
                return 'running'

            case 'running':
                return 'running'

            case 'complete':
                return 'complete'
        }
    }

    private onStackmatTrigger(newState: TimerState): TimerState {
        switch (this.state) {
            case 'idle':
                if (this.useInspection && newState === 'inspection') {
                    this.onInspectionStart()
                    return 'inspection'
                } else if (newState === 'starting') {
                    return 'starting'
                } else {
                    return 'idle'
                }
            case 'inspection':
                return newState === 'starting' ? 'starting' : 'inspection'
            case 'starting':
                if (newState === 'ready') {
                    return 'ready'
                } else if (newState === 'idle' || newState === 'inspection') {
                    return this.useInspection ? 'inspection' : 'idle'
                } else if (newState === 'running') {
                    this.onSolveStart()
                    return 'running'
                } else {
                    return 'starting'
                }
            case 'ready':
                if (newState === 'running') {
                    this.onSolveStart()
                    return 'running'
                } else {
                    return 'ready'
                }
            case 'running':
                if (newState === 'complete') {
                    this.onSolveComplete()
                    setTimeout(() => this.stateMachine.timerReset(), 2000)
                    return 'complete'
                } else {
                    return 'running'
                }
            case 'complete':
                return newState === 'idle' ? 'idle' : 'complete'
        }
    }
}
