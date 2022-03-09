export function timestampToDateTime(timestamp: number): string {
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
