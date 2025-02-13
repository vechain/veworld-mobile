import { convertSmallSciNotationToDecimal, numberToPercentWorklet } from "./Reanimated"

describe("Reanimated convertSmallSciNotationToDecimal function", function () {
    it("should correctly convert small scientific notation numbers", function () {
        const value = 1e-7
        expect(convertSmallSciNotationToDecimal(value)).toBe("0.0000001000")
    })

    it("should return the same value for numbers not in scientific notation", function () {
        const value = 1234.567
        expect(convertSmallSciNotationToDecimal(value)).toBe("1235")
    })

    it("should handle edge cases for very small numbers", function () {
        const value = 1e-10
        expect(convertSmallSciNotationToDecimal(value)).toBe("0.0000000001000")
    })

    it("should handle invalid inputs gracefully", function () {
        expect(convertSmallSciNotationToDecimal(NaN)).toBe("-")
    })
})

describe("Reanimated numberToPercentWorklet function", function () {
    it("should handle different precision levels correctly", function () {
        expect(numberToPercentWorklet(0.56789, { precision: 4, absolute: false })).toBe("0.5679%")
    })

    it("should apply absolute value correctly", function () {
        expect(numberToPercentWorklet(-23.456, { precision: 2, absolute: true })).toBe("23.46%")
    })

    it("should add trailing zeros for integer values with precision", function () {
        expect(numberToPercentWorklet(10, { precision: 2, absolute: false })).toBe("10.00%")
    })

    it("should change accordingly to the provided locale", function () {
        expect(numberToPercentWorklet(10, { precision: 2, absolute: false, locale: "nl-BE" })).toBe("10,00%")
    })

    it("should throw an error for negative precision values", function () {
        expect(() => numberToPercentWorklet(10, { precision: -1, absolute: false })).toThrow(
            "numberToPercentWorklet does not handle negative precision values",
        )
    })

    it("should handle edge cases for undefined or NaN values", function () {
        expect(numberToPercentWorklet(undefined)).toBe("-")
        expect(numberToPercentWorklet(NaN)).toBe("-")
    })
})
