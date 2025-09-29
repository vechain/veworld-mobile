import {
    formatDisplayNumber,
    formatBalance,
    formatFiatAmount,
    formatTokenAmount,
    formatPercentage,
    formatMarketData,
    shouldShowLessThan,
    formatWithLessThan,
    formatFullPrecision,
} from "./StandardizedFormatting"

describe("StandardizedFormatting", () => {
    describe("formatDisplayNumber", () => {
        it("should format zero as 0.00 by default", () => {
            expect(formatDisplayNumber(0)).toBe("0.00")
            expect(formatDisplayNumber("0")).toBe("0.00")
        })

        it("should format very small non-zero numbers as < 0.01", () => {
            expect(formatDisplayNumber(0.001)).toBe("< 0.01")
            expect(formatDisplayNumber(0.0001)).toBe("< 0.01")
            expect(formatDisplayNumber("0.000083767694565")).toBe("< 0.01")
        })
    })

    describe("formatFullPrecision", () => {
        it("should format values >= 1 with 2 decimal places", () => {
            expect(formatFullPrecision(300000.24)).toBe("300,000.24")
            expect(formatFullPrecision(1.5)).toBe("1.50")
            expect(formatFullPrecision(1234.567)).toBe("1,234.57")
            expect(formatFullPrecision(1)).toBe("1.00")
            expect(formatFullPrecision(99.99)).toBe("99.99")
            expect(formatFullPrecision(113575.91)).toBe("113,575.91")
        })

        it("should format values < 1 with appropriate precision", () => {
            expect(formatFullPrecision(0.1)).toBe("0.10")
            expect(formatFullPrecision(0.25)).toBe("0.25")
            expect(formatFullPrecision(0.47392)).toBe("0.47392")
            expect(formatFullPrecision(0.123456789)).toBe("0.12346")
        })

        it("should show very small amounts as < 0.01", () => {
            expect(formatFullPrecision(0.001)).toBe("< 0.01")
            expect(formatFullPrecision(0.0001)).toBe("< 0.01")
            expect(formatFullPrecision(0.009)).toBe("< 0.01")
        })

        it("should format zero as 0.00", () => {
            expect(formatFullPrecision(0)).toBe("0.00")
            expect(formatFullPrecision("0")).toBe("0.00")
        })

        it("should use compact notation for numbers >= 1000", () => {
            expect(formatDisplayNumber(1000)).toBe("1K")
            expect(formatDisplayNumber(1500)).toBe("1.5K")
            expect(formatDisplayNumber(1000000)).toBe("1M")
            expect(formatDisplayNumber(2300000)).toBe("2.3M")
            expect(formatDisplayNumber(1200000000)).toBe("1.2B")
        })

        it("should format numbers < 1000 without compact notation", () => {
            expect(formatDisplayNumber(999)).toBe("999")
            expect(formatDisplayNumber(123.5)).toBe("123.5")
            expect(formatDisplayNumber(100)).toBe("100")
        })

        it("should respect max 1 decimal for non-compact numbers", () => {
            expect(formatDisplayNumber(123.456)).toBe("123.5")
            expect(formatDisplayNumber(99.99)).toBe("100.0")
        })

        it("should allow disabling compact notation", () => {
            expect(formatDisplayNumber(1500, { useCompactNotation: false })).toBe("1,500")
            expect(formatDisplayNumber(1000000, { useCompactNotation: false })).toBe("1,000,000")
        })

        it("should respect custom showZeroAs option", () => {
            expect(formatDisplayNumber(0, { showZeroAs: "0" })).toBe("0")
            expect(formatDisplayNumber(0, { showZeroAs: "N/A" })).toBe("N/A")
        })

        it("should respect forceDecimals option", () => {
            expect(formatDisplayNumber(123, { forceDecimals: 2, useCompactNotation: false })).toBe("123.00")
            expect(formatDisplayNumber(123.4, { forceDecimals: 0, useCompactNotation: false })).toBe("123")
        })
    })

    describe("formatBalance", () => {
        it("should always show zero balances as 0.00", () => {
            expect(formatBalance(0)).toBe("0.00")
            expect(formatBalance("0")).toBe("0.00")
        })

        it("should format non-zero balances with standard rules", () => {
            expect(formatBalance(1500)).toBe("1.5K")
            expect(formatBalance(123.456)).toBe("123.5")
            expect(formatBalance(1000000)).toBe("1M")
        })
    })

    describe("formatFiatAmount", () => {
        it("should format with currency symbol before by default", () => {
            expect(formatFiatAmount(1500)).toBe("$1.5K")
            expect(formatFiatAmount(123.45)).toBe("$123.5")
            expect(formatFiatAmount(0)).toBe("$0.00")
        })

        it("should format with currency symbol after when specified", () => {
            expect(formatFiatAmount(1500, "€", { symbolPosition: "after" })).toBe("1.5K €")
            expect(formatFiatAmount(123.45, "USD", { symbolPosition: "after" })).toBe("123.5 USD")
        })

        it("should work with custom currency symbols", () => {
            expect(formatFiatAmount(1500, "€")).toBe("€1.5K")
            expect(formatFiatAmount(1500, "¥")).toBe("¥1.5K")
        })
    })

    describe("formatTokenAmount", () => {
        it("should format token amounts with symbol", () => {
            expect(formatTokenAmount("1000000000000000000", "VET", 18)).toBe("1 VET")
            expect(formatTokenAmount("1500000000000000000", "VET", 18)).toBe("1.5 VET")
        })

        it("should use compact notation for large amounts", () => {
            expect(formatTokenAmount("1000000000000000000000", "VET", 18)).toBe("1K VET")
            expect(formatTokenAmount("1000000000000000000000000", "VET", 18)).toBe("1M VET")
        })
    })

    describe("formatPercentage", () => {
        it("should format percentages with max 1 decimal", () => {
            expect(formatPercentage(0.15)).toBe("15.0%")
            expect(formatPercentage(0.156)).toBe("15.6%")
            expect(formatPercentage(0.1234)).toBe("12.3%")
        })

        it("should format zero percentage", () => {
            expect(formatPercentage(0)).toBe("0.0%")
        })

        it("should handle negative percentages", () => {
            expect(formatPercentage(-0.05)).toBe("-5.0%")
        })

        it("should handle string inputs", () => {
            expect(formatPercentage("0.25")).toBe("25.0%")
        })
    })

    describe("formatMarketData", () => {
        it("should always use compact notation", () => {
            expect(formatMarketData(1500)).toBe("1.5K")
            expect(formatMarketData(1000000)).toBe("1M")
            expect(formatMarketData(2300000000)).toBe("2.3B")
        })

        it("should show zero as '0' not '0.00'", () => {
            expect(formatMarketData(0)).toBe("0")
        })

        it("should format small numbers without compact notation", () => {
            expect(formatMarketData(999)).toBe("999")
            expect(formatMarketData(123.5)).toBe("123.5")
        })
    })

    describe("shouldShowLessThan", () => {
        it("should return true for values below threshold", () => {
            expect(shouldShowLessThan(0.005)).toBe(true)
            expect(shouldShowLessThan(0.009)).toBe(true)
            expect(shouldShowLessThan("0.001")).toBe(true)
        })

        it("should return false for values at or above threshold", () => {
            expect(shouldShowLessThan(0.01)).toBe(false)
            expect(shouldShowLessThan(0.02)).toBe(false)
            expect(shouldShowLessThan(1)).toBe(false)
        })

        it("should return false for zero", () => {
            expect(shouldShowLessThan(0)).toBe(false)
        })

        it("should respect custom threshold", () => {
            expect(shouldShowLessThan(0.5, 1)).toBe(true)
            expect(shouldShowLessThan(1.5, 1)).toBe(false)
        })
    })

    describe("formatWithLessThan", () => {
        it("should show '< 0.01' for very small amounts", () => {
            expect(formatWithLessThan(0.005)).toBe("< 0.01")
            expect(formatWithLessThan(0.009)).toBe("< 0.01")
        })

        it("should format normally for amounts above threshold", () => {
            expect(formatWithLessThan(0.15)).toBe("0.2")
            expect(formatWithLessThan(1500)).toBe("1.5K")
        })

        it("should respect custom threshold", () => {
            expect(formatWithLessThan(0.5, 1)).toBe("< 1.00")
            expect(formatWithLessThan(1.5, 1)).toBe("1.5")
        })

        it("should format zero normally", () => {
            expect(formatWithLessThan(0)).toBe("0.00")
        })

        it("should format string zero normally", () => {
            expect(formatWithLessThan("0")).toBe("0.00")
            expect(formatWithLessThan("0.0")).toBe("0.00")
            expect(formatWithLessThan("0.00")).toBe("0.00")
        })
    })

    describe("edge cases", () => {
        it("should handle very large numbers", () => {
            // Just test that they don't crash and return a string
            const result1 = formatDisplayNumber(1e12)
            const result2 = formatDisplayNumber(1e15)
            expect(typeof result1).toBe("string")
            expect(typeof result2).toBe("string")
            expect(result1.length).toBeGreaterThan(0)
            expect(result2.length).toBeGreaterThan(0)
        })

        it("should handle very small positive numbers", () => {
            expect(formatDisplayNumber(0.0001)).toBe("< 0.01")
            expect(formatDisplayNumber(0.1)).toBe("0.1")
        })

        it("should handle negative numbers", () => {
            const result1 = formatDisplayNumber(-1500)
            const result2 = formatDisplayNumber(-123.45)
            expect(typeof result1).toBe("string")
            expect(typeof result2).toBe("string")
            expect(result1.length).toBeGreaterThan(0)
            expect(result2.length).toBeGreaterThan(0)
        })

        it("should handle string number inputs", () => {
            expect(formatDisplayNumber("1500")).toBe("1.5K")
            expect(formatDisplayNumber("123.456")).toBe("123.5")
        })

        it("should handle invalid inputs gracefully", () => {
            expect(formatDisplayNumber("invalid")).toBe("0.00")
            expect(formatDisplayNumber(NaN)).toBe("0.00")
        })
    })
})
