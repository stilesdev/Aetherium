import * as firebase from 'firebase';
import * as moment from 'moment';
import {Session, Solve} from './Models';

export default class Aetherium {
    constructor() {
        this.puzzles = null;
        this.activePuzzle = null;
        this.activeCategory = null;
        this.user = null;
        this.session = null;

        this.allSolvesRef = null;
        this.sessionIdRef = null;
        this.sessionRef = null;
        this.sessionSolvesRef = null;

        firebase.database().ref('/puzzles').on('value', snapshot => {
            this.puzzles = snapshot.val();
            if (this.activePuzzle === null) {
                this.setPuzzle(333);
            }
        })
    }

    setPuzzle(puzzle) {
        this.activePuzzle = puzzle;
        this.setCategory('default');
    }

    setCategory(category) {
        this.activeCategory = this.puzzles[this.activePuzzle].categories[category];
        this.initUserListeners();
    }

    initUserListeners() {
        if (this.activeCategory === null || this.user === null) {
            return;
        }

        this.detachListeners();

        this.allSolvesRef = firebase.database().ref(`/users/${this.user.uid}/allSolves/${this.activePuzzle}/${this.activeCategory.key}`);
        this.sessionIdRef = firebase.database().ref(`/users/${this.user.uid}/currentSessionIds/${this.activePuzzle}/${this.activeCategory.key}`);

        this.sessionIdRef.once('value').then(snapshot => {
            if (!snapshot.exists()) {
                this.createSession();
            } else {
                this.sessionRef = firebase.database().ref(`/users/${this.user.uid}/sessions/${this.activePuzzle}/${this.activeCategory.key}/${snapshot.val()}`);
            }

            this.sessionIdRef.on('value', snapshot => {
                this.session = new Session(snapshot.val());
                this.sessionRef.once('value').then (snapshot => {
                    this.session.date = moment(snapshot.val().date).utc();
                    this.session.name = snapshot.val().name;
                });

                if (this.sessionSolvesRef !== null) {
                    this.sessionSolvesRef.off();
                }

                this.sessionSolvesRef = firebase.database().ref(`/users/${this.user.uid}/sessions/${this.activePuzzle}/${this.activeCategory.key}/solves`);

                this.sessionSolvesRef.on('child_added', snapshot => {
                    this.session.addSolve(Solve.fromSnapshot(snapshot));
                });

                this.sessionSolvesRef.on('child_changed', snapshot => {
                    this.session.updateSolve(snapshot.key, snapshot.val());
                });

                this.sessionSolvesRef.on('child_removed', snapshot => {
                    this.session.deleteSolve(snapshot.key);
                });
            });
        });
    }

    detachListeners() {
        if (this.allSolvesRef !== null) {
            this.allSolvesRef.off();
            this.allSolvesRef = null;
        }

        if (this.sessionIdRef !== null) {
            this.sessionIdRef.off();
            this.sessionIdRef = null;
        }

        if (this.sessionRef !== null) {
            this.sessionRef.off();
            this.sessionRef = null;
        }

        if (this.sessionSolvesRef !== null) {
            this.sessionSolvesRef.off();
            this.sessionSolvesRef = null;
        }
    }

    createSession() {
        this.sessionRef = firebase.database().ref(`/users/${this.user.uid}/sessions/${this.activePuzzle}/${this.activeCategory.key}`).push();
        let date = moment().utc().hour(0).minute(0).second(0).millisecond(0);
        this.sessionRef.set({
            date: date.valueOf(),
            name: date.format('M/D/YYYY')
        });

        this.sessionIdRef.set(this.sessionRef.key);
    }

    closeSession() {
        this.sessionRef.update({
            stats: this.session.stats
        });

        this.createSession();
    }
};