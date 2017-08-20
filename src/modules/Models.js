import * as Stats from './Statistics.js';

/**
 * Class representing a single timed solve.
 */
export class Solve {
    /**
     * Create a Solve.
     *
     * @param {string} uid - the key from the Firebase database
     * @param {number} time - the time taken to complete the solve, in milliseconds
     * @param {number} timestamp - the timestamp taken when the solve was completed
     * @param {string} scramble - the scramble generated for this solve
     * @param {string} penalty - the penalty, if any, received during this solve
     */
    constructor(uid, time, timestamp, scramble, penalty) {
        this.uid = uid;
        this.time = time;
        this.timestamp = timestamp;
        this.scramble = scramble;
        this.penalty = penalty;
    }

    /**
     * Create a Solve from a Firebase database snapshot.
     *
     * @param {object} solveSnapshot - the Firebase database snapshot containing the solve data
     * @returns {Solve} - the newly constructed Solve object
     */
    static fromSnapshot(solveSnapshot) {
        let val = solveSnapshot.val();

        return new this(solveSnapshot.key, val.time, val.timestamp, val.scramble, val.penalty);
    }

    /**
     * Get the final time for this Solve as a numerical value.
     *
     * @returns {number} - the final time for this solve, including any penalties, and with DNF represented as -1
     */
    getFinalTime() {
        if (this.penalty === 'dnf') {
            return -1;
        } else {
            return (this.penalty === '+2' ? this.time + 2000 : this.time);
        }
    }

    /**
     * Get the final time for this Solve formatted as a String for UI display.
     *
     * @returns {string} - the formatted time for this Solve, ready for UI display
     */
    getFormattedTime() {
        return Solve.formatTime(this.getFinalTime());
    }

    getFormattedTimeShort() {
        return Solve.formatTimeShort(this.getFinalTime());
    }

    /**
     * Get the timestamp for this Solve formatted as a human-readable String for UI display.
     *
     * @returns {string} - the human-readable timestamp for this Solve, ready for UI display
     */
    getFormattedTimestamp() {
        return Solve.formatTimestamp(this.timestamp);
    }

    /**
     * Format the provided time into a String for UI display.
     *
     * @param {number} delta - the solve time to format, in milliseconds
     * @returns {string} - the formatted time, ready for UI display
     */
    static formatTime(delta) {
        if (delta === -1) return 'DNF';
        if (delta === 0) return '--';

        let d = new Date(delta);
        let minutes = d.getMinutes();
        let seconds = d.getSeconds();
        let ms = d.getMilliseconds();

        if (minutes < 10) minutes = '0' + minutes;
        if (seconds < 10) seconds = '0' + seconds;
        if (ms < 100) {
            ms = '0' + ms
        } else if (ms < 10) {
            ms = '00' + ms;
        }
        ms = ('.' + ms + '00').substring(0, 3);

        return minutes + ":" + seconds + ms;
    }

    /**
     * Format the provided time into a String for UI display, stripping off any leading zeros.
     *
     * @param {number} delta - the solve time to format, in milliseconds
     * @returns {string} - the formatted time, ready for UI display
     */
    static formatTimeShort(delta) {
        let formatted = Solve.formatTime(delta);

        if (formatted.startsWith('00:')) formatted = formatted.slice(3);
        if (formatted.startsWith("0")) formatted = formatted.slice(1);

        return formatted;
    }

    /**
     * Format the provided timestamp into a human-readable String for UI display.
     *
     * @param {number} timestamp - the JS timestamp to format
     * @returns {string} - the human-readable timestamp, ready for UI display
     */
    static formatTimestamp(timestamp) {
        let a = new Date(timestamp);

        let date = (a.getMonth() + 1) + '/' + a.getDate() + '/' + a.getFullYear();
        let ampm = a.getHours() > 12 ? "PM" : "AM";
        let hours = a.getHours() > 12 ? a.getHours() - 12 : a.getHours();
        if (hours === 0) hours = 12;
        let minutes = a.getMinutes() < 10 ? "0" + a.getMinutes() : a.getMinutes();
        let seconds = a.getSeconds() < 10 ? "0" + a.getSeconds() : a.getSeconds();
        let time = hours + ':' + minutes + ':' + seconds + ' ' + ampm;

        return date + ' ' + time;
    }
}

/**
 * Class representing a session of timed solves.
 */
export class Session {

    /**
     * Create a new Session
     */
    constructor() {
        this.solves = [];
        this.stats = {
            mean: 0,
            count: 0,
            best: 0,
            worst: 0,
            stdDev: 0,
            mo3: 0,
            ao5: 0,
            ao12: 0,
            ao50: 0,
            ao100: 0,
            bestMo3: 0,
            bestAo5: 0,
            bestAo12: 0,
            bestAo50: 0,
            bestAo100: 0
        };
    }

    /**
     * Add a Solve to the Session, updating the statistics on the fly.
     *
     * @param {Solve} solve - the Solve to add to the Session
     */
    addSolve(solve) {
        this.solves.push(solve);
        this._sort();
        this._updateStats();
    }

    /**
     * Add multiple Solves to the Session, updating the statistics on the fly.
     *
     * @param {Array} solves - an Array of Solve objects to be added to the Session
     */
    addSolves(solves) {
        this.solves.push(...solves);
        this._sort();
        this._updateStats();
    }

    updateSolve(solveUid, data) {
        this.solves.forEach(solve => {
            if (solve.uid === solveUid) {
                solve.time = data.time;
                solve.timestamp = data.timestamp;
                solve.scramble = data.scramble;
                solve.penalty = data.penalty;
            }
        });

        this._updateStats();
    }

    deleteSolve(solveUid) {
        let solveIndex = -1;

        this.solves.forEach((solve, index) => {
            if (solve.uid === solveUid) {
                solveIndex = index;
            }
        });

        this.solves.splice(solveIndex, 1);
        this._updateStats();
    }

    /**
     * Sort the Solves stored in this Session by timestamp.
     *
     * @private
     */
    _sort() {
        //TODO: implement auto-sorted list instead of calling sort each time a solve is added
        this.solves.sort((a, b) => {
            return b.timestamp - a.timestamp;
        })
    }

    /**
     * Calculate updated statistics for the Solves stored in this Session.
     *
     * @private
     */
    _updateStats() {
        this.stats.mean = Stats.mean(this.solves);
        this.stats.count = this.solves.length;
        this.stats.best = Stats.best(this.solves);
        this.stats.worst = Stats.worst(this.solves);
        this.stats.stdDev = Stats.stdDev(this.solves);
        this.stats.mo3 = Stats.mo3(this.solves);
        this.stats.ao5 = Stats.ao5(this.solves);
        this.stats.ao12 = Stats.ao12(this.solves);
        this.stats.ao50 = Stats.ao50(this.solves);
        this.stats.ao100 = Stats.ao100(this.solves);
        this.stats.bestMo3 = Stats.bestMo3(this.solves);
        this.stats.bestAo5 = Stats.bestAo5(this.solves);
        this.stats.bestAo12 = Stats.bestAo12(this.solves);
        this.stats.bestAo50 = Stats.bestAo50(this.solves);
        this.stats.bestAo100 = Stats.bestAo100(this.solves);
    }
}