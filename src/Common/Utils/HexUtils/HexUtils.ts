import crypto from "react-native-quick-crypto"

const PREFIX = "0x"
const PREFIX_REGEX = /^0[xX]/
const HEX_REGEX = /^(0[xX])?[a-fA-F0-9]+$/

/**
 * Returns the provied hex string with the hex prefix removed.
 * If the prefix doesn't exist the hex is returned unmodified
 * @param hex - the input hex string
 * @returns the input hex string with the hex prefix removed
 * @throws an error if the input is not a valid hex string
 */
const removePrefix = (hex: string): string => {
    validate(hex)
    return hex.replace(PREFIX_REGEX, "")
}

/**
 * Returns the provided hex string with the hex prefix added.
 * If the prefix already exists the string is returned unmodified.
 * If the string contains an UPPER case `X` in the prefix it will be replaced with a lower case `x`
 * @param hex - the input hex string
 * @returns the input hex string with the hex prefix added
 * @throws an error if the input is not a valid hex string
 */
const addPrefix = (hex: string): string => {
    validate(hex)
    return PREFIX_REGEX.test(hex)
        ? hex.replace(PREFIX_REGEX, PREFIX)
        : `${PREFIX}${hex}`
}

/**
 * Validate the hex string. Throws an Error if not valid
 * @param hex - the input hex string
 * @throws an error if the input is not a valid hex string
 */
const validate = (hex: string) => {
    if (!isValid(hex)) throw Error(`Provided hex value is not valid ${hex}`)
}

/**
 * Check if input string is valid
 * @param hex - the input hex string
 * @returns boolean representing whether the input hex is valid
 */
const isValid = (hex: string): boolean => {
    return HEX_REGEX.test(hex)
}

/**
 * Generate a random hex string of the defined length
 * @param size - the length of the random hex output
 * @returns a random hex string of length `size`
 */
const generateRandom = (size: number): string => {
    if (size < 1) throw Error("Size must be > 0")
    const randBuffer = crypto.randomBytes(Math.ceil(size / 2))
    if (!randBuffer) throw Error("Failed to generate random hex")
    return `${PREFIX}${randBuffer.toString("hex").substring(0, size)}`
}

export default {
    removePrefix,
    addPrefix,
    validate,
    isValid,
    generateRandom,
}
