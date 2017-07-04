export function mean(solves) {
    return meanOfRange(solves, 0, solves.length - 1);
}

export function best(solves) {
    if (solves.length === 0) return 0;

    let best = Number.MAX_VALUE;
    let dnfCount = 0;

    solves.forEach(solve => {
        let time = solve.getFinalTime();

        if (time === -1) {
            dnfCount += 1;
        } else if (time < best) {
            best = time;
        }
    });

    return (dnfCount === solves.length) ? -1 : best;
}

export function worst(solves) {
    let worst = 0;

    solves.forEach(solve => {
        if (worst !== -1) {
            let time = solve.getFinalTime();

            if (time === -1) {
                worst = -1;
            } else if (time > worst) {
                worst = time;
            }
        }
    });

    return worst;
}

export function stdDev(solves) {
    let mean = meanOfRange(solves, 0, solves.length - 1);

    if (mean <= 0) {
        return mean;
    }

    let stDev = 0;

    solves.forEach(solve => {
        stDev += Math.pow(solve.getFinalTime() - mean, 2);
    });

    return Math.sqrt(stDev / solves.length);
}

export function mo3(solves) {
    return (solves.length < 3) ? 0 : meanOfRange(solves, 0, 2);
}

export function ao5(solves) {
    return (solves.length < 5) ? 0 : averageOfRange(solves, 0, 4);
}

export function ao12(solves) {
    return (solves.length < 12) ? 0 : averageOfRange(solves, 0, 11);
}

export function ao50(solves) {
    return (solves.length < 50) ? 0 : averageOfRange(solves, 0, 49);
}

export function ao100(solves) {
    return (solves.length < 100) ? 0 : averageOfRange(solves, 0, 99);
}

export function bestMo3(solves) {
    return (solves.length < 3) ? 0 : bestMean(solves, 3);
}

export function bestAo5(solves) {
    return (solves.length < 5) ? 0 : bestAverage(solves, 5);
}

export function bestAo12(solves) {
    return (solves.length < 12) ? 0 : bestAverage(solves, 12);
}

export function bestAo50(solves) {
    return (solves.length < 50) ? 0 : bestAverage(solves, 50);
}

export function bestAo100(solves) {
    return (solves.length < 100) ? 0 : bestAverage(solves, 100);
}

function meanOfRange(solves, startIdx, endIdx) {
    if (endIdx <= startIdx) {
        return 0;
    }

    let mean = 0;

    for (let i = startIdx; i <= endIdx; i++) {
        let time = solves[i].getFinalTime();

        if (time === -1) {
            return -1;
        }

        mean += time;
    }

    return mean / (endIdx - startIdx + 1);
}

function averageOfRange(solves, startIdx, endIdx) {
    let average = 0;
    let dnfCount = 0;
    let best = Number.MAX_VALUE;
    let worst = 0;

    for (let i = startIdx; i <= endIdx; i++) {
        let time = solves[i].getFinalTime();

        if (time === -1) {
            dnfCount += 1;
        } else {
            average += time;

            if (time < best) {
                best = time;
            }

            if (time > worst) {
                worst = time;
            }
        }
    }

    if (dnfCount === 0) {
        return (average - best - worst) / (endIdx - startIdx - 1);
    } else if (dnfCount === 1) {
        return (average - best) / (endIdx - startIdx - 1);
    } else {
        return -1;
    }
}

function bestMean(solves, meanSize) {
    let best = Number.MAX_VALUE;
    let start = 0;
    let end = meanSize - 1;

    while (end < solves.length) {
        let mean = meanOfRange(solves, start, end);
        if (mean < best) best = mean;
        start++;
        end++;
    }

    return best;
}

function bestAverage(solves, averageSize) {
    let best = Number.MAX_VALUE;
    let start = 0;
    let end = averageSize - 1;

    while (end < solves.length) {
        let average = averageOfRange(solves, start, end);
        if (average < best) best = average;
        start++;
        end++;
    }

    return best;
}