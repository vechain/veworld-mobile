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
        // eslint-disable-next-line no-bitwise
        hash = (hash << 5) - hash + input.charCodeAt(i)
        // eslint-disable-next-line no-bitwise
        hash = hash & hash // Convert to 32-bit integer
    }

    let color = "#"
    for (let i = 0; i < 3; i++) {
        // eslint-disable-next-line no-bitwise
        let value = (hash >> (i * 8)) & 255
        color += ("00" + value.toString(16)).slice(-2)
    }
    return color
}

/**
 * Get the RGB values from a color
 * @param color Color in hexadecimal format or rgb(a) format
 * @returns An object with the rgb values.
 * @throws "Invalid color format" if the format is invalid
 */
const getRgbFromColor = (color: string) => {
    if (color.match(/^rgb/)) {
        const rgb = color.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)$/)
        if (!rgb) throw new Error("Invalid color format")
        return {
            r: parseInt(rgb[0], 10),
            g: parseInt(rgb[1], 10),
            b: parseInt(rgb[2], 10),
        }
    }

    const matchHex = color.match("#[a-fA-F0-9]{6}")
    if (!matchHex) throw new Error("Invalid color format")
    let hexColor: number
    const slicedColor = color.slice(1)
    if (color.length < 5) hexColor = Number(`0x${slicedColor.replace(/./, "$&$&")}`)
    else hexColor = Number(`0x${slicedColor}`)

    return {
        // eslint-disable-next-line no-bitwise
        r: hexColor >> 16,
        // eslint-disable-next-line no-bitwise
        g: (hexColor >> 8) & 255,
        // eslint-disable-next-line no-bitwise
        b: hexColor & 255,
    }
}

/**
 * Determines if a color is light or dark.
 * @param color The color in hexadecimal or rgb(a) format to check.
 * @returns A boolean value where true indicates the color is light, and false indicates the color is dark.
 * @throws Will throw an error if the color format is invalid.
 */
const isLightColor = (color: string): boolean => {
    const { r, g, b } = getRgbFromColor(color)

    // HSP equation from http://alienryderflex.com/hsp.html
    const hsp = Math.sqrt(0.299 * (r * r) + 0.587 * (g * g) + 0.114 * (b * b))

    // Using the HSP value, determine whether the color is light or dark
    // > 127.5 is 'light', <= 127.5 is 'dark'

    return hsp > 127.5
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
