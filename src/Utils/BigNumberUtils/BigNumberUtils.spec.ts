import BigNutils, { BigNumberUtils } from "./BigNumberUtils"
import { BigNumber } from "bignumber.js"

// Adjust the import path as necessary

describe("BigNutils", () => {
    it("should instance the class with custom input", () => {
        const bigNumUtils = BigNutils(5)
        expect(bigNumUtils.toString).toBe("5")
    })

    it("should instance the class init function", () => {
        const bigNumUtils = BigNutils()
        expect(bigNumUtils.toString).toBe("0")
    })
})

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

    // Test toHuman with callback
    test("toHuman should convert correctly with callback", () => {
        function callback(result: BigNumber) {
            expect(result.toString()).toBe("0.1")
        }

        bigNumUtils.toHuman(2, callback)
    })

    // Test decimals
    test("decimals should round correctly", () => {
        const num = BigNutils("10.1234").decimals(2).toString
        expect(num).toBe("10.12")
    })

    // Test decimals with callback
    test("decimals should round correctly with callback", () => {
        function callback(result: BigNumber) {
            expect(result.toString()).toBe("10.12")
        }

        BigNutils("10.1234").decimals(2, callback)
    })

    // Test math operations
    test("minus should subtract correctly", () => {
        bigNumUtils.minus(5)
        expect(bigNumUtils.toString).toBe("5")
    })

    test("minus should subtract correctly with callback", () => {
        function callback(result: BigNumber) {
            expect(result.toString()).toBe("5")
        }

        bigNumUtils.minus(5, callback)
    })

    test("multiply should multiply correctly", () => {
        bigNumUtils.multiply(4)
        expect(bigNumUtils.toString).toBe("40")
    })

    test("multiply should multiply correctly with callback", () => {
        function callback(result: BigNumber) {
            expect(result.toString()).toBe("40")
        }

        bigNumUtils.multiply(4, callback)
    })

    test("plus should add correctly", () => {
        bigNumUtils.plus(15)
        expect(bigNumUtils.toString).toBe("25")
    })

    test("plus should add correctly with callback", () => {
        function callback(result: BigNumber) {
            expect(result.toString()).toBe("25")
        }

        bigNumUtils.plus(15, callback)
    })

    test("times should multiply correctly", () => {
        bigNumUtils.times(3)
        expect(bigNumUtils.toString).toBe("30")
    })

    test("times should multiply correctly with callback", () => {
        function callback(result: BigNumber) {
            expect(result.toString()).toBe("30")
        }

        bigNumUtils.times(3, callback)
    })

    test("idiv should divide correctly", () => {
        bigNumUtils.idiv(2)
        expect(bigNumUtils.toString).toBe("5")
    })

    test("idiv should divide correctly with callback", () => {
        function callback(result: BigNumber) {
            expect(result.toString()).toBe("5")
        }

        bigNumUtils.idiv(2, callback)
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
        expect(bigNumUtils.idiv(10).minus(0.998).toCurrencyFormat_string(2)).toBe("< 0.01")
    })

    test("toTokenFormat_string should format correctly", () => {
        expect(bigNumUtils.toTokenFormat_string(2)).toMatch(/^\d+(\.\d{1,4})?$/)
        expect(bigNumUtils.idiv(10).minus(0.99995).toTokenFormat_string(2)).toBe("< 0.01")
    })

    // Test conversion methods
    test("toCurrencyConversion should convert correctly", () => {
        bigNumUtils.toCurrencyConversion("100", 1.5)
        expect(bigNumUtils.toString).toBe("150")
    })

    test("toCurrencyConversion should convert correctly with 0 balance", () => {
        bigNumUtils.toCurrencyConversion("", 1.5)
        expect(bigNumUtils.toString).toBe("0")
    })

    test("toCurrencyConversion should convert correctly without rate", () => {
        bigNumUtils.toCurrencyConversion("100")
        expect(bigNumUtils.toString).toBe("100")
    })

    test("toCurrencyConversion should convert correctly with callback", () => {
        function callback(result: BigNumber) {
            expect(result.toString()).toBe("150")
        }

        bigNumUtils.toCurrencyConversion("100", 1.5, callback)
    })

    test("toTokenConversion should convert correctly", () => {
        bigNumUtils.toTokenConversion("100", 2)
        expect(bigNumUtils.toString).toBe("50")
    })

    test("toTokenConversion should convert correctly with 0 balance", () => {
        bigNumUtils.toTokenConversion("", 2)
        expect(bigNumUtils.toString).toBe("0")
    })

    test("toTokenConversion should convert correctly without custom rate", () => {
        bigNumUtils.toTokenConversion("100")
        expect(bigNumUtils.toString).toBe("100")
    })

    test("toTokenConversion should convert correctly with callback", () => {
        function callback(result: BigNumber) {
            expect(result.toString()).toBe("50")
        }

        bigNumUtils.toTokenConversion("100", 2, callback)
    })

    // Test addTrailingZeros
    test("addTrailingZeros should work correctly", () => {
        bigNumUtils.addTrailingZeros(2)
        expect(bigNumUtils.toString).toBe("1000")
    })

    test("addTrailingZeros should work correctly with callback", () => {
        function callback(result: BigNumber) {
            expect(result.toString()).toBe("1000")
        }

        bigNumUtils.addTrailingZeros(2, callback)
    })
})
