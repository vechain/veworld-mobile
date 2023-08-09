/**
 * Generates a color hash from a string.
 *
 * The method calculates a hash value of the input string and then uses that hash
 * to generate a color code. It does this by iteratively processing each character
 * in the input string, converting it into a 32-bit integer, and then transforming
 * it into a hexadecimal string.
 *
 * The processing of each character involves bitwise shifting and bitwise AND operations.
 * The shifting (<<) and subtraction (-) operations provide a form of "scrambling" that
 * helps to ensure a wide distribution of hash values for varied input strings.
 *
 * For each of the red, green, and blue components of the color, the method extracts 8 bits
 * from the hash, converts them into a hexadecimal string, and adds them to the color string.
 * If the resulting string is less than 2 characters long, '0' characters are added at the
 * start to make it 2 characters long.
 *
 * Note: This hash function is deterministic, meaning that it will always produce the same
 * color for the same input string. However, it does not guarantee that different strings
 * will always produce different colors.
 *
 * @param input The string used to generate a color hash.
 * @returns The generated color in hexadecimal format.
 */
const generateColorHash = (input: string): string => {
    let hash = 0
    for (let i = 0; i < input.length; i++) {
        hash = (hash << 5) - hash + input.charCodeAt(i)
        hash = hash & hash // Convert to 32-bit integer
    }

    let color = "#"
    for (let i = 0; i < 3; i++) {
        let value = (hash >> (i * 8)) & 255
        color += ("00" + value.toString(16)).slice(-2)
    }
    return color
}

/**
 * Determines if a color is light or dark.
 * @param color The color in hexadecimal format to check.
 * @returns A boolean value where true indicates the color is light, and false indicates the color is dark.
 * @throws Will throw an error if the color format is invalid.
 */
const isLightColor = (color: string): boolean => {
    // Check if color is valid hex color
    if (!/^#([0-9a-f]{3}){1,2}$/i.test(color)) {
        throw new Error("Invalid color format")
    }

    let r = parseInt(color.slice(1, 3), 16),
        g = parseInt(color.slice(3, 5), 16),
        b = parseInt(color.slice(5, 7), 16)

    // Calculate brightness according to the algorithm:
    // https://www.w3.org/TR/AERT/#color-contrast
    let brightness = Math.round((r * 299 + g * 587 + b * 114) / 1000)

    // Return true if the color is light (brightness is more than 128)
    return brightness > 128
}

/**
 * Generates a color from a string and determines if the color is light or dark.
 * @param input The string used to generate a color.
 * @returns A tuple where the first item is the generated color in hexadecimal format, and the second item is a boolean indicating whether the color is light (true) or dark (false).
 */
const generateColor = (input: string): [string, boolean] => {
    let color = generateColorHash(input)
    let isLight = isLightColor(color)

    // Return color and boolean (true if color is light, false otherwise)
    return [color, isLight]
}

export default {
    generateColor,
    generateColorHash,
    isLightColor,
}
