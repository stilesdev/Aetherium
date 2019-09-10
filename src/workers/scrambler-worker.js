// Simulating window referring to the global scope.
let window = self;
let document = {};

window.document = document;
document['write'] = function() {};
window.write = document['write'];
document.getElementById = function() {};
document.getElementsByTagName = function() {return [];};
document.readyState = 'loaded';
if(window.location) {
    // Firefox actually does set self.location for webworkers
    document.location = window.location;
} else {
    window.location = { href: "", search: "" };
    document.location = window.location;
}


self.puzzlesLoaded = function(p) {
    self.puzzles = p;
};

importScripts('tnoodle.js');

self.generateScramble = function(scrambler) {
    if (self.puzzles) {
        let puzzle = self.puzzles[scrambler];

        if (puzzle) {
            let scramble = puzzle.generateScramble();
            let svg = tnoodlejs.scrambleToSvg(scramble, puzzle, 0, 0);
            self.postMessage({scramble: scramble, svg: svg});
        } else {
            self.postMessage({scramble: null, svg: null});
        }
    } else {
        setTimeout(self.generateScramble, 100, scrambler);
    }
};

self.addEventListener('message', (event) => {
    self.generateScramble(event.data.scrambler);
});