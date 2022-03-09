export function millisToTimerFormat(milliseconds: number): string {
    if (milliseconds === -1) {
        return 'DNF'
    }
    if (milliseconds <= 0) {
        return '--'
    }

    const d = new Date(milliseconds)

    return d.getMinutes().toString().padStart(2, '0') + ':' + d.getSeconds().toString().padStart(2, '0') + '.' + d.getMilliseconds().toString().padStart(3, '0')
}
