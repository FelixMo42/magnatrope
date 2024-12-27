export function capitalize(s: string) {
    return s.charAt(0).toUpperCase() + s.slice(1)
}

export function selectNextFromList<T>(list: T[], current: T): T {
    const index = list.findIndex((t) => t === current)
    return list[(index + 1) % list.length]
}
