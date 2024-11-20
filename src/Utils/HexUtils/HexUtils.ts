import crypto from "react-native-quick-crypto"
import { error } from "~Utils"

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
    return PREFIX_REGEX.test(hex) ? hex.replace(PREFIX_REGEX, PREFIX) : `${PREFIX}${hex}`
}

/**
 * Validate the hex string. Throws an Error if not valid
 * @param hex - the input hex string
 * @throws an error if the input is not a valid hex string
 */
const validate = (hex: string) => {
    if (!isValid(hex)) throw Error("Provided hex value is not valid")
}

/**
 * Check if input string is valid
 * @param hex - the input hex string
 * @returns boolean representing whether the input hex is valid
 */
const isValid = (hex?: string | null): boolean => {
    return !!hex && HEX_REGEX.test(hex)
}

const isInvalid = (hex?: string | null): boolean => {
    return !isValid(hex)
}

/**
 * Generate a random hex string of the defined length
 * @param size - the length of the random hex output
 * @returns a random hex string of length `size`
 */
const generateRandom = (size: number): string => {
    if (size < 1) throw Error("Size must be > 0")
    const buf = Buffer.alloc(Math.ceil(size / 2))
    const randBuffer = crypto.randomFillSync(buf)
    if (!randBuffer) throw Error("Failed to generate random hex")
    let _isValid = isValid(`${PREFIX}${randBuffer.toString("hex").substring(0, size)}`)
    if (!_isValid) throw Error("Failed to validate random hex")
    return `${PREFIX}${randBuffer.toString("hex").substring(0, size)}`
}

const normalize = (hex: string): string => {
    return addPrefix(hex.toLowerCase().trim())
}

const compare = (hex1: string, hex2: string): boolean => {
    try {
        return removePrefix(hex1).toLowerCase() === removePrefix(hex2).toLowerCase()
    } catch (e) {
        return false
    }
}

const uint8ArrayToHexString = (byteArray: Uint8Array): string => {
    return Array.from(byteArray, function (byte) {
        return ("0" + (byte & 0xff).toString(16)).slice(-2)
    }).join("")
}

const hexStringToUint8Array = (hexString: string): Uint8Array => {
    // Ensure the hex string has an even number of characters for proper parsing
    if (hexString.length % 2 !== 0) {
        error("APP", "The hex string must have an even number of characters")
        return new Uint8Array()
    }
    // Split the hex string into an array of byte-sized (2 characters) hex strings
    const byteStrings = hexString.match(/.{1,2}/g) || []
    // Convert each byte-sized hex string into a numeric byte value
    const byteArray = byteStrings.map(byteStr => parseInt(byteStr, 16))
    // Create a new Uint8Array from the array of numeric byte values
    return new Uint8Array(byteArray)
}

export default {
    removePrefix,
    addPrefix,
    validate,
    isValid,
    isInvalid,
    normalize,
    generateRandom,
    compare,
    uint8ArrayToHexString,
    hexStringToUint8Array,
}
