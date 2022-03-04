// Simulating window referring to the global scope.
const window = self
const document = {}

window.document = document
// eslint-disable-next-line @typescript-eslint/no-empty-function
document['write'] = function () {}
window.write = document['write']
// eslint-disable-next-line @typescript-eslint/no-empty-function
document.getElementById = function () {}
document.getElementsByTagName = function () {
    return []
}
document.readyState = 'loaded'
if (window.location) {
    // Firefox actually does set self.location for webworkers
    document.location = window.location
} else {
    window.location = { href: '', search: '' }
    document.location = window.location
}

self.puzzlesLoaded = function (p) {
    self.puzzles = p
}

// eslint-disable-next-line no-undef
importScripts('tnoodle.js')

self.generateScramble = function (scrambler) {
    if (self.puzzles) {
        const puzzle = self.puzzles[scrambler]

        if (puzzle) {
            const scramble = puzzle.generateScramble()
            // eslint-disable-next-line no-undef
            const svg = tnoodlejs.scrambleToSvg(scramble, puzzle, 0, 0)
            self.postMessage({ scramble: scramble, svg: svg })
        } else {
            self.postMessage({ scramble: undefined, svg: undefined })
        }
    } else {
        setTimeout(self.generateScramble, 100, scrambler)
    }
}

self.addEventListener('message', (event) => {
    self.generateScramble(event.data.scrambler)
})
