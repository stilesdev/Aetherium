//Polyfill taken directly from tnoodlejs repository to allow it to work in a WebWorker context.
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


// Function called once all puzzles are loaded
function puzzlesLoaded(puzzles) {
    self.puzzles = puzzles;
    console.log('Got puzzles!');
}

// Import the tnoodlejs library
require('../lib/tnoodle.js');

// Listen for requests to generate scrambles
self.addEventListener('message', (event) => {
    generateScramble(event.data.scrambler);
});

// Wait for puzzles to be loaded, then post the generated scramble and SVG image.
function generateScramble(scrambler) {
    if (self.puzzles) {
        let puzzle = self.puzzles[scrambler];

        if (puzzle) {
            let scramble = puzzle.generateScramble();
            let svg = tnoodlejs.scrambleToSvg(scramble, puzzle, 0, 0);
            self.postMessage({scramble: scramble, svg: svg});
        } else {
            self.postMessage(null);
        }
    } else {
        setTimeout(() => generateScramble(scrambler), 100);
    }
}

