export class ScramblerWorker extends Worker {
    constructor() {
        super('/scrambler-worker.js')
    }
}
