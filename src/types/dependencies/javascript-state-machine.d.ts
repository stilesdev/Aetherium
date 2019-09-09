/**
 * Typings retrieved from https://github.com/taoqf/javascript-state-machine/blob/master/types/state-machine.d.ts
 *
 * Released under the MIT License
 *
 * Copyright (c) 2012, 2013, 2014, 2015, 2016, 2017, 2018, Jake Gordon and contributors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
declare module 'javascript-state-machine' {
    class StateMachine {
        constructor(options: Partial<StateMachine.Options>)
        static factory(options: Partial<StateMachine.Options>): StateMachine.IFSM
        static factory<T>(instance: T, options: Partial<StateMachine.Options>): StateMachine.IFSM | T
        [action: string]: ((...args: any[]) => any)
        state: StateMachine.StateMachineState
        is: StateMachine.StateMachineIs
        can: StateMachine.StateMachineCan
        cannot: StateMachine.StateMachineCan
        transitions: StateMachine.StateMachineTransitions
        allTransitions: StateMachine.StateMachineTransitions
        allStates: StateMachine.StateMachineStates
        observe: StateMachine.Observe
        // history: string[]
        clearHistory(): void
        historyBack(): void
        historyForward(): void
        canHistory(): boolean
        canhistoryForward(): boolean
    }

    namespace StateMachine {
        const VERSION: string 		        // = "3.x.x"
        const defaults: {
            wildcard: '*',
            init: {
                name: 'init',
                from: 'none'
            }
        }

        // types
        // type StateMachineState = string
        type StateMachineState = (...args: any[]) => any
        type StateMachineIs = (state: string) => boolean
        type StateMachineCan = (evt: string) => boolean
        type StateMachineTransitions = () => string[]
        type StateMachineStates = () => string[]
        type Callback = (...args: any[]) => any
        interface Observe {
            (event: string, callback: Callback): void
            [name: string]: Callback
        }

        interface LifeCycle {
            transition: string
            from: string
            to: string
        }

        interface Options {
            name: string
            past: string
            future: string
            init: string
            max: number	// max history
            state: string
            transitions: {
                name: string
                from: string | string[] | '*'
                to: string | ((...args: any[]) => string)
            }[]
            methods: {
                [method: string]: Callback | undefined
                onBeforeTransition?(lifecycle: LifeCycle, ...args: any[]): boolean | Promise<boolean>	// 1
                onLeaveState?(lifecycle: LifeCycle, ...args: any[]): boolean | Promise<boolean>	// 2
                onTransition?(lifecycle: LifeCycle, ...args: any[]): boolean | Promise<boolean>	// 3
                onEnterState?(lifecycle: LifeCycle, ...args: any[]): any | Promise<any>	// 4
                onAfterTransition?(lifecycle: LifeCycle, ...args: any[]): any | Promise<any>	// 5
                onPendingTransition?(transition: string, from: string, to: string): any | Promise<any>
            }
            data: any	// {} | any[] | ((...args: any[]) => {} | any[])
            plugins: any[]
        }

        interface IFSM {
            new(...data: any[]): StateMachine
        }
    }

    export = StateMachine
}

