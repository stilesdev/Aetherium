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
