import BigNutils, { BigNumberUtils } from "./BigNumberUtils"

describe("BigNumberUtils class", () => {
    let bigNumUtils: BigNumberUtils

    beforeEach(() => {
        bigNumUtils = BigNutils(10)
    })

    // Test instance creation with various inputs
    test("should create an instance with zero", () => {
        const bigNumZero = BigNutils(0)
        expect(bigNumZero.toString).toBe("0")
        expect(bigNumZero.isZero).toBeTruthy()
    })

    test("should handle negative numbers", () => {
        const bigNumNegative = BigNutils(-10)
        expect(bigNumNegative.toString).toBe("-10")
        expect(bigNumNegative.isZero).toBeFalsy()
    })

    test("should handle large numbers", () => {
        const bigNumLarge = BigNutils("1e30")
        expect(bigNumLarge.toString).toBe("1000000000000000000000000000000")
    })

    test("should handle NaN", () => {
        const bigNumNaN = BigNutils(NaN)
        expect(bigNumNaN.toString).toBe("0")
    })

    // Test properties
    test("should return correct values for properties", () => {
        expect(bigNumUtils.toString).toBe("10")
        expect(bigNumUtils.toNumber).toBe(10)
        expect(bigNumUtils.toHex).toBe("a")
        expect(bigNumUtils.isZero).toBeFalsy()
    })

    // Test edge cases for property methods
    test("should return '0' when BigNumber is zero", () => {
        bigNumUtils = BigNutils(0)
        expect(bigNumUtils.toString).toBe("0")
        expect(bigNumUtils.isZero).toBeTruthy()
    })

    test("should return '0' when BigNumber is NaN", () => {
        bigNumUtils = BigNutils(NaN)
        expect(bigNumUtils.toString).toBe("0")
        expect(bigNumUtils.isZero).toBeTruthy()
    })

    // Test toHuman with different precisions
    test("toHuman should convert correctly with different precisions", () => {
        bigNumUtils.toHuman(2)
        expect(bigNumUtils.toString).toBe("0.1")
        bigNumUtils.toHuman(3)
        expect(bigNumUtils.toString).toBe("0.0001")
    })

    test("toHuman should handle zero decimals", () => {
        bigNumUtils.toHuman(0)
        expect(bigNumUtils.toString).toBe("10")
    })

    // Test decimals with different precisions
    test("decimals should round correctly", () => {
        const num = BigNutils("10.123456").decimals(4).toString
        expect(num).toBe("10.1234")
    })

    test("decimals should round down correctly", () => {
        const num = BigNutils("10.999999").decimals(2).toString
        expect(num).toBe("10.99")
    })

    // Math operations with edge cases
    test("minus should subtract correctly with negative numbers", () => {
        bigNumUtils.minus(-5)
        expect(bigNumUtils.toString).toBe("15")
    })

    test("minus should handle subtraction resulting in zero", () => {
        bigNumUtils.minus(10)
        expect(bigNumUtils.isZero).toBeTruthy()
    })

    test("times should handle multiplication by zero", () => {
        bigNumUtils.times(0)
        expect(bigNumUtils.toString).toBe("0")
        expect(bigNumUtils.isZero).toBeTruthy()
    })

    test("plus should handle adding zero", () => {
        bigNumUtils.plus(0)
        expect(bigNumUtils.toString).toBe("10")
    })

    test("idiv should handle integer division correctly", () => {
        bigNumUtils.idiv(3)
        expect(bigNumUtils.toString).toBe("3")
    })

    // Comparison methods with edge cases
    test("isLessThan should return false for equal values", () => {
        expect(bigNumUtils.isLessThan(10)).toBeFalsy()
    })

    test("isLessThan should return true for smaller values", () => {
        expect(bigNumUtils.isLessThan(20)).toBeTruthy()
    })

    test("isBiggerThan should return false for equal values", () => {
        expect(bigNumUtils.isBiggerThan(10)).toBeFalsy()
    })

    test("isBiggerThan should return true for bigger values", () => {
        expect(bigNumUtils.isBiggerThan(5)).toBeTruthy()
    })

    // Test format methods
    test("toCurrencyFormat_string should format correctly", () => {
        const num = BigNutils("1234.567").toCurrencyFormat_string(2)
        expect(num).toBe("1,234.56")
    })

    test("toCurrencyFormat_string should handle small numbers", () => {
        const smallNumber = BigNutils("0.009")
        expect(smallNumber.toCurrencyFormat_string(2)).toBe("< 0.01")
    })

    test("toTokenFormat_string should format correctly with small numbers", () => {
        const smallNumber = BigNutils("0.00005")
        expect(smallNumber.toTokenFormat_string(4)).toBe("< 0.01")
    })

    // Test conversion methods with edge cases
    test("toCurrencyConversion should handle undefined rate", () => {
        const result = bigNumUtils.toCurrencyConversion("100", 2)
        expect(result).toBe("100.00")
    })

    test("toCurrencyConversion should apply the rate correctly", () => {
        const result = bigNumUtils.toCurrencyConversion("100", 2, 2)
        expect(result).toBe("200.00")
    })

    test("toTokenConversion should handle undefined rate", () => {
        bigNumUtils.toTokenConversion("100")
        expect(bigNumUtils.toString).toBe("100")
    })

    test("toTokenConversion should apply the rate correctly", () => {
        bigNumUtils.toTokenConversion("100", 2)
        expect(bigNumUtils.toString).toBe("50")
    })

    // Test addTrailingZeros with edge cases
    test("addTrailingZeros should handle zero decimals", () => {
        bigNumUtils.addTrailingZeros(0)
        expect(bigNumUtils.toString).toBe("10")
    })

    test("addTrailingZeros should add multiple zeros correctly", () => {
        bigNumUtils.addTrailingZeros(5)
        expect(bigNumUtils.toString).toBe("1000000")
    })
})
