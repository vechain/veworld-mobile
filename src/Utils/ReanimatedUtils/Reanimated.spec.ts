import { convertSmallSciNotationToDecimal, numberToPercentWorklet, formatFiatWorklet } from "./Reanimated"

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
        expect(numberToPercentWorklet(0.56789, { precision: 4, absolute: false, locale: "en" })).toBe("0.5679%")
    })

    it("should apply absolute value correctly", function () {
        expect(numberToPercentWorklet(-23.456, { precision: 2, absolute: true, locale: "en" })).toBe("23.46%")
    })

    it("should add trailing zeros for integer values with precision", function () {
        expect(numberToPercentWorklet(10, { precision: 2, absolute: false, locale: "en" })).toBe("10.00%")
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

describe("Reanimated formatFiatWorklet function", function () {
    it("should format fiat amount with all explicit parameters", function () {
        expect(formatFiatWorklet(1234.56, "$", "en-US", "before", 2, 2)).toBe("$1,234.56")
    })

    it("should format fiat amount with symbol after", function () {
        expect(formatFiatWorklet(1234.56, "€", "en-US", "after", 2, 2)).toBe("1,234.56 €")
    })

    it("should respect locale formatting (comma decimal separator)", function () {
        expect(formatFiatWorklet(1234.56, "€", "nl-BE", "after", 2, 2)).toBe("1.234,56 €")
    })

    it("should handle zero values with 2 decimals", function () {
        expect(formatFiatWorklet(0, "$", "en-US", "before", 2, 2)).toBe("$0.00")
    })

    it("should handle invalid values (NaN, Infinity)", function () {
        expect(formatFiatWorklet(NaN, "$", "en-US", "before", 2, 5)).toBe("$0.00")
        expect(formatFiatWorklet(Infinity, "$", "en-US", "before", 2, 5)).toBe("$0.00")
    })

    it("should handle custom precision with explicit params", function () {
        expect(formatFiatWorklet(1234.56789, "$", "en-US", "before", 5, 5)).toBe("$1,234.56789")
    })

    it("should handle small amounts with high precision", function () {
        expect(formatFiatWorklet(0.00123, "$", "en-US", "before", 5, 5)).toBe("$0.00123")
    })

    it("should handle negative amounts", function () {
        expect(formatFiatWorklet(-1234.56, "$", "en-US", "before", 2, 2)).toBe("$-1,234.56")
    })

    it("should work with all parameters explicit (no closure issues)", function () {
        // This pattern avoids closure issues in useDerivedValue
        const amount = 999.99
        const symbol = "£"
        const locale = "en-GB"
        const position = "before"
        const min = 2
        const max = 2

        expect(formatFiatWorklet(amount, symbol, locale, position, min, max)).toBe("£999.99")
    })
})
