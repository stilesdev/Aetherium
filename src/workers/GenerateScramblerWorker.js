self.addEventListener('message', (event) => {
    let puzzle = event.data.puzzle;

    if (puzzle) {
        let scramble = puzzle.generateScramble();
        let svg = tnoodlejs.scrambleToSvg(scramble, puzzle, 0, 0);
        self.postMessage({scramble: scramble, svg: svg});
    } else {
        self.postMessage(null);
    }
});