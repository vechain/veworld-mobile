import {
    Language,
    convertSmallSciNotationToDecimal,
    numberToLocaleStringWorklet,
    numberToPercentWorklet,
    round,
} from "./Reanimated"

describe("reanimated numberToLocaleStringWorklet", function () {
    "use strict"

    it("needs to be overridden for phantomjs", function () {
        const num = 123456
        const locale = "en-GB"

        function testLocale(): string {
            return numberToLocaleStringWorklet(num, locale)
        }

        expect(testLocale).not.toThrow()
    })

    it("returns a string", function () {
        const num = 123456
        const locale = "en-GB"

        expect(typeof numberToLocaleStringWorklet(num, locale)).toBe("string")
    })

    it("returns <$0.00000001 if the value is below that amount", function () {
        const num = 0.000000001

        expect(
            numberToLocaleStringWorklet(num, "en-US", {
                style: "currency",
                currency: "USD",
            }),
        ).toBe("<$0.00000001")
    })

    it("returns a string with 3 sig figs if it is between 0.00000001 and 1,", function () {
        const num = 0.0000000123

        expect(
            numberToLocaleStringWorklet(num, "en-US", {
                style: "currency",
                currency: "USD",
            }),
        ).toBe("$0.00000001230")
    })

    it("returns a string formatted in FR style (1\u00A0234.5) when passed FR", function () {
        const num = 1234.5
        const locale = "fr"

        expect(numberToLocaleStringWorklet(num, locale)).toEqual(
            "1\u00A0234,50",
        )
    })

    it("returns a string formatted in US style (1,234.5) when passed US", function () {
        const num = 1234.5
        const locale = "en-US"

        expect(numberToLocaleStringWorklet(num, locale)).toBe("1,234.50")
    })

    it("returns a string formatted in IT style (1.234,5) when passed IT", function () {
        const num = 1234.5
        const locale = "it"

        expect(numberToLocaleStringWorklet(num, locale)).toBe("1.234,50")
    })

    it("returns a string formatted in de-CH style (1'234.5) when passed de-CH", function () {
        const num = 1234.5
        const locale = "de-CH"

        expect(numberToLocaleStringWorklet(num, locale)).toBe("1'234.50")
    })

    it("returns a string formatted in DK style (1.234,5) when passed da-DK", function () {
        const num = 1234.5
        const locale = "da-DK"

        expect(numberToLocaleStringWorklet(num, locale)).toBe("1.234,50")
    })

    it("returns a dash if there is no value passed to funciton", function () {
        const num = 0
        const locale = "en-US"

        expect(numberToLocaleStringWorklet(num, locale)).toBe("-")
    })

    it("returns a string formatted in NO style (1 234,5) when passed nb-NO", function () {
        const num = 1234.5
        const locale = "nb-NO"

        expect(numberToLocaleStringWorklet(num, locale)).toBe("1\u00A0234,50")
    })

    it("throws when the language tag does not conform to the standard", function () {
        const num = 1234.5
        const locale = "i"

        function testLocale(): string {
            return numberToLocaleStringWorklet(num, locale as Language)
        }

        expect(testLocale).toThrow(
            new RangeError("Invalid language tag: " + locale),
        )
    })

    it("returns a string formatted in US style (1,234.5) by default", function () {
        const num = 1234.5

        expect(numberToLocaleStringWorklet(num)).toBe("1,234.50")
        expect(numberToLocaleStringWorklet(num, "es" as Language)).toBe(
            "1,234.50",
        )
        expect(numberToLocaleStringWorklet(num, "AU" as Language)).toBe(
            "1,234.50",
        )
    })

    it("returns a string formatted in Hungarian style (1 234,56) by default", function () {
        const num = 1234.56

        expect(numberToLocaleStringWorklet(num, "hu")).toBe("1\u00A0234,56")
        expect(numberToLocaleStringWorklet(num, "hu-HU")).toBe("1\u00A0234,56")
    })

    it("returns currency properly formatted for the locale specified", function () {
        const num = 1234.56
        const negative_num = -1234.56
        const style = "currency"
        const currency = "USD"

        expect(
            numberToLocaleStringWorklet(num, "en-US", {
                style,
                currency,
            }),
        ).toBe("$1,234.56")

        expect(
            numberToLocaleStringWorklet(negative_num, "en-US", {
                style,
                currency,
            }),
        ).toBe("-$1,234.56")

        expect(
            numberToLocaleStringWorklet(num, "de-DE", {
                style,
                currency,
            }),
        ).toBe("1.234,56 $")

        expect(
            numberToLocaleStringWorklet(num, "hu", {
                style,
                currency: "huf",
            }),
        ).toBe("1\u00A0234,56 Ft")

        expect(
            numberToLocaleStringWorklet(num, "hu-HU", {
                style,
                currency: "huf",
            }),
        ).toBe("1\u00A0234,56 Ft")

        expect(
            numberToLocaleStringWorklet(num, "da-DK", {
                style,
                currency: "DKK",
            }),
        ).toBe("1.234,56 kr")

        expect(
            numberToLocaleStringWorklet(num, "nb-NO", {
                style,
                currency: "NOK",
            }),
        ).toBe("1\u00A0234,56 kr")
    })

    it("format percentages with rounding and zero padding", function () {
        const num = -1234.56

        expect(
            numberToPercentWorklet(num, { precision: 0, absolute: true }),
        ).toBe("1235%")
        expect(
            numberToPercentWorklet(num, { precision: 1, absolute: true }),
        ).toBe("1234.6%")
        expect(
            numberToPercentWorklet(num, { precision: 2, absolute: true }),
        ).toBe("1234.56%")
        expect(
            numberToPercentWorklet(num, { precision: 3, absolute: true }),
        ).toBe("1234.560%")
        expect(
            numberToPercentWorklet(num, { precision: 4, absolute: true }),
        ).toBe("1234.5600%")
        expect(
            numberToPercentWorklet(num, { precision: 4, absolute: false }),
        ).toBe("-1234.5600%")
    })

    it("thrown error if precission is a negative number", function () {
        expect(() =>
            numberToPercentWorklet(123.12, { precision: -4, absolute: false }),
        ).toThrow()
    })

    it("returns dash if value is undefined or NaN", function () {
        expect(
            numberToPercentWorklet(undefined, {
                precision: 2,
                absolute: false,
            }),
        ).toBe("-")

        expect(
            numberToPercentWorklet(Number("123@#!"), {
                precision: 2,
                absolute: false,
            }),
        ).toBe("-")
    })

    it("format zero value percentages with zero padding", function () {
        expect(
            numberToPercentWorklet(0, { precision: 0, absolute: true }),
        ).toBe("0%")
        expect(
            numberToPercentWorklet(0, { precision: 1, absolute: true }),
        ).toBe("0.0%")
        expect(
            numberToPercentWorklet(0, { precision: 2, absolute: true }),
        ).toBe("0.00%")
        expect(
            numberToPercentWorklet(0.001, { precision: 2, absolute: true }),
        ).toBe("0.00%")
    })

    it("format integer values with zero padding", function () {
        const intNum = -10

        expect(
            numberToPercentWorklet(intNum, { precision: 0, absolute: true }),
        ).toBe("10%")
        expect(
            numberToPercentWorklet(intNum, { precision: 1, absolute: true }),
        ).toBe("10.0%")
        expect(
            numberToPercentWorklet(intNum, { precision: 2, absolute: true }),
        ).toBe("10.00%")
    })
})

describe("Reaniamted round funciton", function () {
    it("should round numbers corrrectly when it has a precisison param", function () {
        const numberToRound = 123.4321
        expect(round(numberToRound, 2)).toBe(123.43)
    })

    it("should round numbers corrrectly with default precisison param", function () {
        const numberToRound = 123.4321
        expect(round(numberToRound)).toBe(123)
    })
})

describe("Reaniamted convertSmallSciNotationToDecimal funciton", function () {
    /*
        The condition if (!num.includes("e-")) checks whether the number in the variable num is in scientific notation with a negative exponent. Therefore, the value of value should be a number that is greater than or equal to 1e-4 and less than 1e5 (100,000) in order for the conditional to be true and return num in non-scientific notation with a precision of 4.

        For example, if value is 12345.6789, then num would be "1.235e+4" and the conditional would be false, so num would not be returned. But if value is 0.000123456789, then num would be "0.00012346" and the conditional would be true, so num would be returned.
    */
    it("should return the correct value after precision", function () {
        const value = 0.000123456789
        expect(convertSmallSciNotationToDecimal(value)).toBe(
            value.toPrecision(4),
        )
    })
})
