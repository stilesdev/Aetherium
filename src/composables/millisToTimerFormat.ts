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

if (import.meta.vitest) {
    const { describe, expect, it } = import.meta.vitest

    describe('millisToTimerFormat', () => {
        it('handles 0 correctly', () => {
            expect(millisToTimerFormat(0)).toEqual('--')
        })

        it('handles -1 correctly', () => {
            expect(millisToTimerFormat(-1)).toEqual('DNF')
        })

        it('handles other negative numbers correctly', () => {
            expect(millisToTimerFormat(-2)).toEqual('--')
        })

        it('handles positive numbers correctly', () => {
            expect(millisToTimerFormat(1)).toEqual('00:00.001')
            expect(millisToTimerFormat(12)).toEqual('00:00.012')
            expect(millisToTimerFormat(123)).toEqual('00:00.123')
            expect(millisToTimerFormat(1234)).toEqual('00:01.234')
            expect(millisToTimerFormat(12345)).toEqual('00:12.345')
            expect(millisToTimerFormat(123456)).toEqual('02:03.456')
            expect(millisToTimerFormat(1234567)).toEqual('20:34.567')
        })

        it('handles floats correctly', () => {
            expect(millisToTimerFormat(1.0)).toEqual('00:00.001')
            expect(millisToTimerFormat(1.5)).toEqual('00:00.001')
            expect(millisToTimerFormat(1.9)).toEqual('00:00.001')
        })
    })
}
