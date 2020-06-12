export function formatTimeDelta(delta: number): string {
    if (delta === -1) {
        return 'DNF'
    }
    if (delta === 0) {
        return '--'
    }

    const d = new Date(delta)

    return (
        d
            .getMinutes()
            .toString()
            .padStart(2, '0') +
        ':' +
        d
            .getSeconds()
            .toString()
            .padStart(2, '0') +
        '.' +
        d
            .getMilliseconds()
            .toString()
            .padStart(3, '0')
    )
}

export function formatTimeDeltaShort(delta: number): string {
    let formatted = formatTimeDelta(delta)

    if (formatted.startsWith('00:')) {
        formatted = formatted.slice(3)
    }

    if (formatted.startsWith('0')) {
        formatted = formatted.slice(1)
    }

    return formatted
}

export function formatTimestamp(timestamp: number): string {
    // TODO: replace with moment.format?
    const d = new Date(timestamp)

    const date = d.getMonth() + 1 + '/' + d.getDate() + '/' + d.getFullYear()
    const ampm = d.getHours() > 12 ? 'PM' : 'AM'
    let hours = d.getHours() > 12 ? d.getHours() - 12 : d.getHours()
    if (hours === 0) {
        hours = 12
    }
    const minutes = d.getMinutes() < 10 ? '0' + d.getMinutes() : d.getMinutes()
    const seconds = d.getSeconds() < 10 ? '0' + d.getSeconds() : d.getSeconds()
    const time = hours + ':' + minutes + ':' + seconds + ' ' + ampm

    return date + ' ' + time
}
