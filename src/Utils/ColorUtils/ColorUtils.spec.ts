import { ColorUtils } from "~Utils"

describe("generateColorHash", () => {
    it("should generate the same color for the same input", () => {
        const input = "testString"
        expect(ColorUtils.generateColorHash(input)).toBe(
            ColorUtils.generateColorHash(input),
        )
    })

    it("should generate different colors for different inputs", () => {
        const input1 = "testString1"
        const input2 = "testString2"
        expect(ColorUtils.generateColorHash(input1)).not.toBe(
            ColorUtils.generateColorHash(input2),
        )
    })

    it("should return a valid hex color", () => {
        const input = "test"
        const color = ColorUtils.generateColorHash(input)
        expect(/^#([0-9a-f]{3}){1,2}$/i.test(color)).toBeTruthy()
    })
})

describe("isLightColor", () => {
    it("should throw for invalid color format", () => {
        const invalidColor = "abcd"
        expect(() => ColorUtils.isLightColor(invalidColor)).toThrow(
            "Invalid color format",
        )
    })

    it("should return true for a light color", () => {
        const lightColor = "#FFFFFF" // white
        expect(ColorUtils.isLightColor(lightColor)).toBeTruthy()
    })

    it("should return false for a dark color", () => {
        const darkColor = "#000000" // black
        expect(ColorUtils.isLightColor(darkColor)).toBeFalsy()
    })
})

describe("generateColor", () => {
    it("should return a tuple with color and lightness boolean", () => {
        const input = "test"
        const [color, isLight] = ColorUtils.generateColor(input)
        expect(/^#([0-9a-f]{3}){1,2}$/i.test(color)).toBeTruthy()
        expect(typeof isLight).toBe("boolean")
    })

    it("should match the lightness boolean with the isLightColor function", () => {
        const input = "test"
        const [color, isLight] = ColorUtils.generateColor(input)
        expect(ColorUtils.isLightColor(color)).toBe(isLight)
    })
})
