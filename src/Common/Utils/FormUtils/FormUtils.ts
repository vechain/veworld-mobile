/**
 * Check if the value provided exists in a specific key of an array of objects
 * @param array
 * @param key
 * @param value
 * @returns a boolean indicating if the value exists or not
 */
export const alreadyExists = <T>(
    value: string,
    array: T[],
    key: keyof T,
    exclude?: T,
    compareFunction?: (value1: unknown, value2: unknown) => boolean,
): boolean => {
    const compare = compareFunction || ((value1, value2) => value1 === value2)
    const matches = array.filter(item => {
        return !exclude || item[key] !== exclude[key]
    })
    return matches.some(item => compare(item[key], value))
}
