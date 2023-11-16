/* eslint-disable no-console */
import {
    convertToFiatBalance,
    formatAlias,
    humanAddress,
    humanNumber,
    humanUrl,
    isZero,
    limitChars,
    removeUrlProtocolAndPath,
    scaleNumberDown,
    scaleNumberUp,
    validateStringPercentages,
    formatToHumanNumber,
} from "./FormattingUtils"
import { BigNumber } from "bignumber.js"

describe("scaleNumberUp - positive testing", () => {
    it("scale up by 2 decimals", () => {
        expect(scaleNumberUp(5, 2)).toEqual("500")
    })

    it("scale up by 10 decimals", () => {
        expect(scaleNumberUp(6, 10)).toEqual("60000000000")
    })

    it("scale up by 0", () => {
        expect(scaleNumberUp(500, 0)).toBe("500")
    })

    it("scale up by 16 decimals", () => {
        expect(scaleNumberUp("7", 16)).toEqual("70000000000000000")
    })
})

describe("scaleNumberUp - negative testing", () => {
    const originalError = console.error
    beforeAll(() => {
        // mute the errors in the console
        console.error = jest.fn()
    })
    afterAll(() => {
        // unmute the errors
        console.error = originalError
    })

    it("scale up by a negative number", () => {
        expect(() => scaleNumberUp(5, -1)).toThrow()
    })

    it("scale up an invalid number", () => {
        expect(() => scaleNumberUp("notanumber", 10)).toThrow()
    })
})

describe("scaleNumberDown - positive testing", () => {
    it("scale down by 2 decimals", () => {
        expect(scaleNumberDown(500, 2)).toEqual("5")
    })

    it("scale down by 0", () => {
        expect(scaleNumberDown(500, 0)).toBe("500")
    })

    it("scale down by 10 decimals", () => {
        expect(scaleNumberDown("60000000000", 10)).toEqual("6")
    })

    it("scale down by 16 decimals", () => {
        expect(scaleNumberDown("70000000000000000", 16)).toEqual("7")
    })
})

describe("scaleNumberDown - negative testing", () => {
    const originalError = console.error
    beforeAll(() => {
        // mute the errors in the console
        console.error = jest.fn()
    })
    afterAll(() => {
        // unmute the errors
        console.error = originalError
    })

    it("scale down by a negative number", () => {
        expect(() => scaleNumberDown(500, -1)).toThrow()
    })

    it("scale down an invalid number", () => {
        expect(() => scaleNumberDown("notanumber", 10)).toThrow()
    })

    it("scale down by too many decimals", () => {
        expect(scaleNumberDown("600", 10)).toEqual("0")
    })
})

describe("convertToFiatBalance", () => {
    it("should return correctly", () => {
        expect(convertToFiatBalance("100.001", 10, 2)).toBe("10.0001")
    })
})

describe("humanNumber", () => {
    it("should return correct decimals", () => {
        expect(
            humanNumber(
                new BigNumber(100.234234234234234),
                new BigNumber(100.234234234234234),
                "$",
            ),
        ).toBe("100.23 $")
    })
    it("should return < 0.01", () => {
        expect(
            humanNumber(
                new BigNumber(0.00000003),
                new BigNumber(0.00000003),
                "$",
            ),
        ).toBe("< 0.01 $")
    })
})

describe("isZero", () => {
    it("should return true", () => {
        expect(isZero(new BigNumber(0.0))).toBe(true)
    })
    it("should return false", () => {
        expect(isZero(new BigNumber(1000.00000003))).toBe(false)
    })
})

describe("humanAddress", () => {
    it("should return correctly", () => {
        expect(humanAddress("0x4fec365ab34c21784b05e3fed80633268e6457ff")).toBe(
            "0x4f…268e6457ff",
        )
    })
})

describe("humanUrl", () => {
    it("should return correctly", () => {
        expect(
            humanUrl(
                "https://jestjs.io/docs/mock-function-api#mockfnmockresolvedvaluevalue",
            ),
        ).toBe("https://…evalue")
    })
})

describe("formatAlias", () => {
    it("should return correctly", () => {
        expect(formatAlias("short")).toBe("short")
        expect(
            formatAlias(
                "this is a long long long long long long long long alias",
            ),
        ).toBe("this i… alias")
    })
})

describe("removeUrlProtocolAndPath", () => {
    it("should return correctly", () => {
        expect(
            removeUrlProtocolAndPath(
                "https://jestjs.io/docs/mock-function-api#mockfnmockresolvedvaluevalue",
            ),
        ).toBe("jestjs.io")
    })
})

describe("limit charachters to 24", () => {
    it("should return correct string length", () => {
        expect(limitChars("qwertyuiop")).toBe("qwertyuiop")
        expect(limitChars("qwertyuiopasdfghjklzxcvbnm")).toBe(
            "qwertyuiopasdfghjklzxcvb",
        )
    })
})

describe("validateStringPercentages", () => {
    it("should return true for valid percentages", () => {
        const percentages = ["10%", "50%", "100%"]
        expect(validateStringPercentages(percentages)).toBe(true)
    })

    it("should return false for percentages exceeding 100", () => {
        const percentages = ["10%", "150%", "100%"]
        expect(validateStringPercentages(percentages)).toBe(false)
    })

    it("should return false for negative percentages", () => {
        const percentages = ["10%", "-50%", "100%"]
        expect(validateStringPercentages(percentages)).toBe(false)
    })

    it("should return false for percentages without the '%' sign", () => {
        const percentages = ["10", "50%", "100%"]
        expect(validateStringPercentages(percentages)).toBe(false)
    })

    it("should return false for non-numeric percentages", () => {
        const percentages = ["ten%", "50%", "100%"]
        expect(validateStringPercentages(percentages)).toBe(false)
    })

    it("should return true for an empty array", () => {
        const percentages: string[] = []
        expect(validateStringPercentages(percentages)).toBe(false)
    })
})

describe("foramt to human number and currency", () => {
    it.each([
        ["1234.5678", 2, "de-DE", "1.234,56"],
        ["1000", 0, "en-US", "1,000"],
        // Add more cases for different locales and decimal places
    ])(
        "should format %s with %i decimal places in %s locale as %s",
        (amount, decimals, locale, expected) => {
            expect(formatToHumanNumber(amount, decimals, locale)).toBe(expected)
        },
    )

    // Test for invalid inputs
    it.each([
        ["not-a-number", 2, "en-US", "Invalid amount"],
        ["bob2abc", 2, "en-US", "Invalid amount"],
        // Add more invalid input cases
    ])(
        'should return "Invalid amount" for invalid input %s',
        (amount, decimals, locale, expected) => {
            expect(formatToHumanNumber(amount, decimals, locale)).toBe(expected)
        },
    )

    // Test for rounding logic
    it.each([
        ["0.009", 2, "en-US", "< 0.01"],
        ["0.004", 2, "en-US", "< 0.01"],
        // Add more cases to test rounding
    ])(
        "should round %s correctly in %s locale",
        (amount, decimals, locale, expected) => {
            expect(formatToHumanNumber(amount, decimals, locale)).toBe(expected)
        },
    )

    // Test for zero value logic
    it("should handle zero correctly", () => {
        expect(formatToHumanNumber("0", 2, "en-US")).toBe("0.00")
    })
})
