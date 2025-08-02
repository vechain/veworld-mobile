import { CachedNumberFormatter, getNumberFormatter } from "./NumberFormatter"

describe("NumberFormatter", () => {
    describe("CachedNumberFormatter", () => {
        it("should have pre-cached formatters for supported locales", () => {
            const testNumber = 1234567.89
            const expectedFormats = {
                "en-US": "1,234,567.89",
                "de-DE": "1.234.567,89",
                "fr-FR": "1 234 567,89",
                "ja-JP": "1,234,567.89",
                "zh-CN": "1,234,567.89",
            }

            Object.entries(expectedFormats).forEach(([locale, expected]) => {
                const formatter = CachedNumberFormatter[`${locale}-2-decimal-true`]
                expect(formatter).toBeDefined()
                expect(formatter.format(testNumber)).toBe(expected)
            })
        })

        it("should format numbers consistently across region-specific and general locale codes", () => {
            const testNumber = 1234567.89
            const testPairs = [
                ["en-US-2-decimal-true", "en-2-decimal-true"],
                ["de-DE-2-decimal-true", "de-2-decimal-true"],
                ["fr-FR-2-decimal-true", "fr-2-decimal-true"],
            ]

            testPairs.forEach(([specific, general]) => {
                const specificFormatter = CachedNumberFormatter[specific]
                const generalFormatter = CachedNumberFormatter[general]
                expect(specificFormatter.format(testNumber)).toBe(generalFormatter.format(testNumber))
            })
        })
    })

    describe("getNumberFormatter", () => {
        it("should return cached formatter if it exists", () => {
            const formatter = getNumberFormatter({
                locale: "en-US",
                precision: 2,
                useGrouping: true,
            })

            expect(formatter).toStrictEqual(CachedNumberFormatter["en-US-2-decimal-true"])
        })

        it("should create new formatter if configuration doesn't exist in cache", () => {
            const formatter = getNumberFormatter({
                locale: "en-US",
                precision: 3,
                useGrouping: true,
            })

            expect(formatter).toBeDefined()
            expect(formatter.format(1234.5678)).toBe("1,234.568")
        })

        it("should handle different precisions correctly", () => {
            const testCases = [
                { precision: 0, number: 1234.56, expected: "1,235" },
                { precision: 1, number: 1234.56, expected: "1,234.6" },
                { precision: 2, number: 1234.56, expected: "1,234.56" },
                { precision: 3, number: 1234.56, expected: "1,234.560" },
            ]

            testCases.forEach(({ precision, number, expected }) => {
                const formatter = getNumberFormatter({
                    locale: "en-US",
                    precision,
                    useGrouping: true,
                })
                expect(formatter.format(number)).toBe(expected)
            })
        })

        it("should respect useGrouping option", () => {
            const testNumber = 1234567.89
            const withGrouping = getNumberFormatter({
                locale: "en-US",
                precision: 2,
                useGrouping: true,
            })
            const withoutGrouping = getNumberFormatter({
                locale: "en-US",
                precision: 2,
                useGrouping: false,
            })

            expect(withGrouping.format(testNumber)).toBe("1,234,567.89")
            expect(withoutGrouping.format(testNumber)).toBe("1234567.89")
        })

        it("should handle different number formatting styles", () => {
            const testNumber = 0.5
            const testCases = [
                { style: "decimal", expected: "0.50" },
                { style: "percent", expected: "50.00%" },
            ]

            testCases.forEach(({ style, expected }) => {
                const formatter = getNumberFormatter({
                    locale: "en-US",
                    precision: 2,
                    useGrouping: true,
                    style: style as keyof Intl.NumberFormatOptionsStyleRegistry,
                })
                expect(formatter.format(testNumber)).toBe(expected)
            })
        })

        it("should use default values when options are not provided", () => {
            const formatter = getNumberFormatter({})
            expect(formatter.format(1234.56)).toBe("1,235")
        })

        it("should handle edge cases correctly", () => {
            const formatter = getNumberFormatter({
                locale: "en-US",
                precision: 2,
                useGrouping: true,
            })

            expect(formatter.format(0)).toBe("0.00")
            expect(formatter.format(-0)).toBe("-0.00")
            expect(formatter.format(Infinity)).toBe("∞")
            expect(formatter.format(-Infinity)).toBe("-∞")
            expect(formatter.format(NaN)).toBe("NaN")
        })
    })
})
