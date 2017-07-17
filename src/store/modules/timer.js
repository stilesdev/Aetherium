import * as moment from 'moment';
import * as types from '../mutation-types';
import { Solve } from '../../modules/Models';

const state = {
    timerStart: 0,
    timerLabel: '00:00.00',
    timerTrigger: 'spacebar',
    showTimer: true
};

const getters = {

};

const actions = {
    startTimer(context) {
        context.commit(types.SET_TIMER_START, moment().valueOf());

        if (context.state.showTimer) {
            context.actions.updateTimer();
        } else {
            context.commit(types.SET_TIMER_LABEL, 'Solve!');
        }
    },
    updateTimer(context) {
        if (context.state.timerStart !== 0) {
            context.commit(types.SET_TIMER_LABEL, Solve.formatTime(moment().valueOf() - context.state.timerStart));
        }
    }
};

const mutations = {
    [types.SET_TIMER_START] (state, ms) {
        state.timerStart = ms;
    },
    [types.SET_TIMER_LABEL] (state, label) {
        state.timerLabel = label;
    }
};

export default {
    state,
    getters,
    actions,
    mutations
}