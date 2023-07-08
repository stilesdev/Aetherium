export function timestampToDateTime(timestamp: number): string {
    const d = new Date(timestamp)

    const date = `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`
    const ampm = d.getHours() > 12 ? 'PM' : 'AM'
    let hours = d.getHours() > 12 ? d.getHours() - 12 : d.getHours()
    if (hours === 0) {
        hours = 12
    }
    const minutes = d.getMinutes() < 10 ? `0${d.getMinutes()}` : d.getMinutes()
    const seconds = d.getSeconds() < 10 ? `0${d.getSeconds()}` : d.getSeconds()
    const time = `${hours}:${minutes}:${seconds} ${ampm}`

    return `${date} ${time}`
}

if (import.meta.vitest) {
    const { describe, expect, it } = import.meta.vitest

    describe('timestampToDateTime', () => {
        it('formats various timestamps correctly', () => {
            let date = new Date(2022, 0, 15, 0, 0, 0, 0)
            expect(timestampToDateTime(date.getTime())).toEqual('1/15/2022 12:00:00 AM')

            date = new Date(2020, 5, 25, 15, 23, 55, 0)
            expect(timestampToDateTime(date.getTime())).toEqual('6/25/2020 3:23:55 PM')

            date = new Date(2021, 11, 0, 23, 0, 41, 0)
            expect(timestampToDateTime(date.getTime())).toEqual('11/30/2021 11:00:41 PM')
        })
    })
}
