import { millisToTimerFormat } from './millisToTimerFormat'

export function millisToShortTimerFormat(milliseconds: number): string {
    let formatted = millisToTimerFormat(milliseconds)

    if (formatted.startsWith('00:')) {
        formatted = formatted.slice(3)
    }

    if (formatted.startsWith('0')) {
        formatted = formatted.slice(1)
    }

    return formatted
}

if (import.meta.vitest) {
    const { describe, expect, it } = import.meta.vitest

    describe('millisToShortTimerFormat', () => {
        it('handles 0 correctly', () => {
            expect(millisToShortTimerFormat(0)).toEqual('--')
        })

        it('handles -1 correctly', () => {
            expect(millisToShortTimerFormat(-1)).toEqual('DNF')
        })

        it('handles other negative numbers correctly', () => {
            expect(millisToShortTimerFormat(-2)).toEqual('--')
        })

        it('handles positive numbers correctly', () => {
            expect(millisToShortTimerFormat(1)).toEqual('0.001')
            expect(millisToShortTimerFormat(12)).toEqual('0.012')
            expect(millisToShortTimerFormat(123)).toEqual('0.123')
            expect(millisToShortTimerFormat(1234)).toEqual('1.234')
            expect(millisToShortTimerFormat(12345)).toEqual('12.345')
            expect(millisToShortTimerFormat(123456)).toEqual('2:03.456')
            expect(millisToShortTimerFormat(1234567)).toEqual('20:34.567')
        })

        it('handles floats correctly', () => {
            expect(millisToShortTimerFormat(1.0)).toEqual('0.001')
            expect(millisToShortTimerFormat(1.5)).toEqual('0.001')
            expect(millisToShortTimerFormat(1.9)).toEqual('0.001')
        })
    })
}
