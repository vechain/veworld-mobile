/**
 * Assert that a value is defined (neither undefined nor null)
 * @param arg Value to check for
 */
export const assertDefined = (arg: unknown): asserts arg is NonNullable<typeof arg> => {
    if (arg === undefined || arg === null) throw new TypeError("[assertDefined]: argument is not defined")
}
