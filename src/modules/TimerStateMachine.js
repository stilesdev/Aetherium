import * as StateMachine from 'javascript-state-machine';

export default class TimerStateMachine {
    constructor(options) {
        console.log(options);
        this.holdToStart = options.holdToStart;
        this.useInspection = options.useInspection;
        this.onSolveStart = options.onSolveStart;
        this.onSolveComplete = options.onSolveComplete;
        this.onInspectionStart = options.onInspectionStart;
        this.readyTimer = null;

        this.stateMachine = new StateMachine({
            init: 'idle',
            transitions: [
                {
                    name: 'triggerDown',
                    from: '*',
                    to: () => this._onTriggerDown()
                },
                {
                    name: 'triggerUp',
                    from: '*',
                    to: () => this._onTriggerUp()
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
                    name: 'reset',
                    from: [ 'inspection', 'starting', 'ready', 'running', 'complete' ],
                    to: 'idle'
                }
            ],
            methods: {
                onBeforeTransition: function(lifecycle) {
                    if (lifecycle.from === lifecycle.to) {
                        return false;
                    }
                },
                onTransition: function(lifecycle) {
                    console.log(`TRANSITION: ${lifecycle.transition}, FROM: ${lifecycle.from}, TO: ${lifecycle.to}`);
                }
            }
        })
    }

    get state() {
        return this.stateMachine.state;
    }

    triggerDown() {
        this.stateMachine.triggerDown();
    }

    triggerUp() {
        this.stateMachine.triggerUp();
    }

    inspectionExceeded() {
        this.stateMachine.inspectionExceeded();
    }

    reset() {
        this.stateMachine.reset();
    }

    _onTriggerDown() {
        switch (this.stateMachine.state) {
            case 'idle':
                if (!this.useInspection) {
                    if (this.holdToStart) {
                        this.readyTimer = setTimeout(() => this.stateMachine.timerReady(), 500);
                        return 'starting';
                    } else {
                        return 'ready';
                    }
                } else {
                    return 'idle';
                }

            case 'inspection':
                if (this.holdToStart) {
                    this.readyTimer = setTimeout(() => this.stateMachine.timerReady(), 500);
                    return 'starting';
                } else {
                    return 'ready';
                }

            case 'starting':
                return 'starting';

            case 'ready':
                return 'ready';

            case 'running':
                this.onSolveComplete();
                setTimeout(() => this.stateMachine.timerReset(), 2000);
                return 'complete';

            case 'complete':
                return 'complete';
        }
    }

    _onTriggerUp() {
        switch (this.stateMachine.state) {
            case 'idle':
                if (this.useInspection) {
                    this.onInspectionStart();
                    return 'inspection';
                } else {
                    return 'idle';
                }

            case 'inspection':
                return 'inspection';

            case 'starting':
                clearTimeout(this.readyTimer);
                return this.useInspection ? 'inspection' : 'idle';

            case 'ready':
                this.onSolveStart();
                return 'running';

            case 'running':
                return 'running';

            case 'complete':
                return 'complete';
        }
    }
}