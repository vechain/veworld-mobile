export const distinctValues = <T>(array: T[]): T[] => {
    return [...new Set(array)]
}
