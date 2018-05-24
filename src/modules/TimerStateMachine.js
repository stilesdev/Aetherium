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
                    name: 'stackmatTrigger',
                    from: '*',
                    to: (s) => this._onStackmatTrigger(s)
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

    stackmatTrigger(newState) {
        this.stateMachine.stackmatTrigger(newState);
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

    _onStackmatTrigger(newState) {
        switch (this.stateMachine.state) {
            case 'idle':
                if (this.useInspection && newState === 'inspection') {
                    this.onInspectionStart();
                    return 'inspection';
                } else if (newState === 'starting') {
                    return 'starting';
                } else {
                    return 'idle';
                }
            case 'inspection':
                return newState === 'starting' ? 'starting' : 'inspection';
            case 'starting':
                if (newState === 'ready') {
                    return 'ready';
                } else if (newState === 'idle' || newState === 'inspection') {
                    return this.useInspection ? 'inspection' : 'idle';
                } else if (newState === 'running') {
                    this.onSolveStart();
                    return 'running';
                } else {
                    return 'starting';
                }
            case 'ready':
                if (newState === 'running') {
                    this.onSolveStart();
                    return 'running';
                } else {
                    return 'ready';
                }
            case 'running':
                if (newState === 'complete') {
                    this.onSolveComplete();
                    setTimeout(() => this.stateMachine.timerReset(), 2000);
                    return 'complete';
                } else {
                    return 'running';
                }
            case 'complete':
                return newState === 'idle' ? 'idle' : 'complete';
        }
    }
}