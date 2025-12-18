/**
 * Trim all the undefined properties at the top level and return an object only if defined
 * @param obj Object
 */
export const trimUndefined = <T extends Record<string, any>>(obj: T): { [key in keyof T]: NonNullable<T[key]> } => {
    return Object.fromEntries(Object.entries(obj).filter(([_, value]) => value !== undefined)) as any
}
