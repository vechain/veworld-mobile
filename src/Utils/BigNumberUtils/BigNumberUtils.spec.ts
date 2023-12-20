import BigNutils, { BigNumberUtils } from "./BigNumberUtils"

// Adjust the import path as necessary

describe("BigNumberUtils class", () => {
    let bigNumUtils: BigNumberUtils

    beforeEach(() => {
        bigNumUtils = BigNutils(10)
    })

    // Test instance creation
    test("should create an instance correctly", () => {
        expect(bigNumUtils).toBeInstanceOf(BigNumberUtils)
        expect(bigNumUtils.toString).toBe("10")
    })

    // Test properties
    test("should return correct values for properties", () => {
        expect(bigNumUtils.toString).toBe("10")
        expect(bigNumUtils.toNumber).toBe(10)
        expect(bigNumUtils.toHex).toBe("a")
        expect(bigNumUtils.isZero).toBeFalsy()
    })

    // Test toHuman
    test("toHuman should convert correctly", () => {
        bigNumUtils.toHuman(2)
        expect(bigNumUtils.toString).toBe("0.1")
    })

    // Test decimals
    test("decimals should round correctly", () => {
        const num = BigNutils("10.1234").decimals(2).toString
        expect(num).toBe("10.12")
    })

    // Test math operations
    test("minus should subtract correctly", () => {
        bigNumUtils.minus(5)
        expect(bigNumUtils.toString).toBe("5")
    })

    test("plus should add correctly", () => {
        bigNumUtils.plus(15)
        expect(bigNumUtils.toString).toBe("25")
    })

    test("times should multiply correctly", () => {
        bigNumUtils.times(3)
        expect(bigNumUtils.toString).toBe("30")
    })

    test("idiv should divide correctly", () => {
        bigNumUtils.idiv(2)
        expect(bigNumUtils.toString).toBe("5")
    })

    // Test comparison methods
    test("isLessThan should compare correctly", () => {
        expect(bigNumUtils.isLessThan(20)).toBeTruthy()
        expect(bigNumUtils.isLessThan(5)).toBeFalsy()
    })

    test("isBiggerThan should compare correctly", () => {
        expect(bigNumUtils.isBiggerThan(20)).toBeFalsy()
        expect(bigNumUtils.isBiggerThan(5)).toBeTruthy()
    })

    // Test formatting methods
    test("toCurrencyFormat_string should format correctly", () => {
        expect(bigNumUtils.toCurrencyFormat_string(2)).toMatch(/^\d+(\.\d{1,2})?$/)
    })

    test("toTokenFormat_string should format correctly", () => {
        expect(bigNumUtils.toTokenFormat_string(4)).toMatch(/^\d+(\.\d{1,4})?$/)
    })

    // Test conversion methods
    test("toCurrencyConversion should convert correctly", () => {
        bigNumUtils.toCurrencyConversion("100", 1.5)
        expect(bigNumUtils.toString).toBe("150")
    })

    test("toTokenConversion should convert correctly", () => {
        bigNumUtils.toTokenConversion("100", 2)
        expect(bigNumUtils.toString).toBe("50")
    })

    // Test addTrailingZeros
    test("addTrailingZeros should work correctly", () => {
        bigNumUtils.addTrailingZeros(2)
        expect(bigNumUtils.toString).toBe("1000")
    })
})
