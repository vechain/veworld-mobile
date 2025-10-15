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
        describe("default behavior (without tokenSymbol)", () => {
            it("should format values >= 1 with 2 decimal places", () => {
                expect(formatFullPrecision(300000.24)).toBe("300,000.24")
                expect(formatFullPrecision(1.5)).toBe("1.50")
                expect(formatFullPrecision(1234.567)).toBe("1,234.57")
                expect(formatFullPrecision(1)).toBe("1.00")
                expect(formatFullPrecision(99.99)).toBe("99.99")
                expect(formatFullPrecision(113575.91)).toBe("113,575.91")
            })

            it("should format values < 1 with 2 decimal places by default", () => {
                expect(formatFullPrecision(0.1)).toBe("0.10")
                expect(formatFullPrecision(0.25)).toBe("0.25")
                expect(formatFullPrecision(0.47)).toBe("0.47")
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
        })

        describe("token-aware precision", () => {
            describe("standard tokens (2 decimals)", () => {
                it("should use 2 decimals for VET", () => {
                    expect(formatFullPrecision(1234.567, { tokenSymbol: "VET" })).toBe("1,234.57")
                    expect(formatFullPrecision(0.47392, { tokenSymbol: "VET" })).toBe("0.47")
                    expect(formatFullPrecision(100, { tokenSymbol: "VET" })).toBe("100.00")
                })

                it("should use 2 decimals for VTHO", () => {
                    expect(formatFullPrecision(1234.567, { tokenSymbol: "VTHO" })).toBe("1,234.57")
                    expect(formatFullPrecision(0.25, { tokenSymbol: "VTHO" })).toBe("0.25")
                })

                it("should use 2 decimals for USDT", () => {
                    expect(formatFullPrecision(1234.567, { tokenSymbol: "USDT" })).toBe("1,234.57")
                    expect(formatFullPrecision(0.99, { tokenSymbol: "USDT" })).toBe("0.99")
                })

                it("should show < 0.01 for very small amounts with standard tokens", () => {
                    expect(formatFullPrecision(0.001, { tokenSymbol: "VET" })).toBe("< 0.01")
                    expect(formatFullPrecision(0.009, { tokenSymbol: "VTHO" })).toBe("< 0.01")
                })

                it("should format zero with 2 decimals for standard tokens", () => {
                    expect(formatFullPrecision(0, { tokenSymbol: "VET" })).toBe("0.00")
                    expect(formatFullPrecision("0", { tokenSymbol: "USDT" })).toBe("0.00")
                })
            })

            describe("high-precision tokens (4 decimals)", () => {
                it("should use 4 decimals for BTC", () => {
                    expect(formatFullPrecision(1.23456789, { tokenSymbol: "BTC" })).toBe("1.2346")
                    expect(formatFullPrecision(0.00047392, { tokenSymbol: "BTC" })).toBe("0.0005")
                    expect(formatFullPrecision(0.12345, { tokenSymbol: "BTC" })).toBe("0.1235")
                    expect(formatFullPrecision(100, { tokenSymbol: "BTC" })).toBe("100.0000")
                })

                it("should use 4 decimals for ETH", () => {
                    expect(formatFullPrecision(1.23456789, { tokenSymbol: "ETH" })).toBe("1.2346")
                    expect(formatFullPrecision(0.001234, { tokenSymbol: "ETH" })).toBe("0.0012")
                    expect(formatFullPrecision(32.56789, { tokenSymbol: "ETH" })).toBe("32.5679")
                })

                it("should use 4 decimals for SOL", () => {
                    expect(formatFullPrecision(1.23456789, { tokenSymbol: "SOL" })).toBe("1.2346")
                    expect(formatFullPrecision(0.001234, { tokenSymbol: "SOL" })).toBe("0.0012")
                    expect(formatFullPrecision(100, { tokenSymbol: "SOL" })).toBe("100.0000")
                })

                it("should show < 0.0001 for very small amounts with high-precision tokens", () => {
                    expect(formatFullPrecision(0.00001, { tokenSymbol: "BTC" })).toBe("< 0.0001")
                    expect(formatFullPrecision(0.000099, { tokenSymbol: "ETH" })).toBe("< 0.0001")
                    expect(formatFullPrecision(0.000001, { tokenSymbol: "SOL" })).toBe("< 0.0001")
                })

                it("should format zero with 4 decimals for high-precision tokens", () => {
                    expect(formatFullPrecision(0, { tokenSymbol: "BTC" })).toBe("0.0000")
                    expect(formatFullPrecision("0", { tokenSymbol: "ETH" })).toBe("0.0000")
                    expect(formatFullPrecision(0, { tokenSymbol: "SOL" })).toBe("0.0000")
                })

                it("should be case-insensitive for token symbols", () => {
                    expect(formatFullPrecision(1.2345, { tokenSymbol: "btc" })).toBe("1.2345")
                    expect(formatFullPrecision(1.2345, { tokenSymbol: "Eth" })).toBe("1.2345")
                    expect(formatFullPrecision(1.2345, { tokenSymbol: "SOL" })).toBe("1.2345")
                })
            })

            describe("forceDecimals override", () => {
                it("should override smart precision with forceDecimals for standard tokens", () => {
                    expect(formatFullPrecision(1.23456, { tokenSymbol: "VET", forceDecimals: 4 })).toBe("1.2346")
                    expect(formatFullPrecision(1.23456, { tokenSymbol: "VTHO", forceDecimals: 0 })).toBe("1")
                })

                it("should override smart precision with forceDecimals for high-precision tokens", () => {
                    expect(formatFullPrecision(1.23456, { tokenSymbol: "BTC", forceDecimals: 2 })).toBe("1.23")
                    expect(formatFullPrecision(1.23456, { tokenSymbol: "ETH", forceDecimals: 6 })).toBe("1.234560")
                })
            })
        })

        it("should use compact notation for numbers >= 10,000", () => {
            expect(formatDisplayNumber(10000)).toBe("10K")
            expect(formatDisplayNumber(15000)).toBe("15K")
            expect(formatDisplayNumber(10110)).toBe("10.11K")
            expect(formatDisplayNumber(999990)).toBe("999.99K")
            expect(formatDisplayNumber(1000000)).toBe("1M")
            expect(formatDisplayNumber(2300000)).toBe("2.3M")
            expect(formatDisplayNumber(1200000000)).toBe("1.2B")
        })

        it("should format numbers < 10,000 without compact notation", () => {
            expect(formatDisplayNumber(999)).toBe("999")
            expect(formatDisplayNumber(999.99)).toBe("999.99")
            expect(formatDisplayNumber(9999.99)).toBe("9,999.99")
            expect(formatDisplayNumber(123.5)).toBe("123.50")
            expect(formatDisplayNumber(100)).toBe("100")
        })

        it("should respect 2 decimals for values < 10,000", () => {
            expect(formatDisplayNumber(123.456)).toBe("123.46")
            expect(formatDisplayNumber(99.99)).toBe("99.99")
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
            expect(formatBalance(15000)).toBe("15K")
            expect(formatBalance(123.456)).toBe("123.46")
            expect(formatBalance(1000000)).toBe("1M")
        })
    })

    describe("formatFiatAmount", () => {
        it("should format with currency symbol before by default", () => {
            expect(formatFiatAmount(15000)).toBe("$15K")
            expect(formatFiatAmount(123.45)).toBe("$123.45")
            expect(formatFiatAmount(0)).toBe("$0.00")
        })

        it("should format with currency symbol after when specified", () => {
            expect(formatFiatAmount(15000, "€", { symbolPosition: "after" })).toBe("15K €")
            expect(formatFiatAmount(123.45, "USD", { symbolPosition: "after" })).toBe("123.45 USD")
        })

        it("should work with custom currency symbols", () => {
            expect(formatFiatAmount(15000, "€")).toBe("€15K")
            expect(formatFiatAmount(15000, "¥")).toBe("¥15K")
        })
    })

    describe("formatTokenAmount", () => {
        it("should format token amounts with symbol and 2 decimals", () => {
            expect(formatTokenAmount("1000000000000000000", "VET", 18)).toBe("1.00 VET")
            expect(formatTokenAmount("1500000000000000000", "VET", 18)).toBe("1.50 VET")
            expect(formatTokenAmount("2000000000000000000", "VET", 18)).toBe("2.00 VET")
            expect(formatTokenAmount("3000000000000000000", "VET", 18)).toBe("3.00 VET")
        })

        it("should use compact notation for large amounts", () => {
            expect(formatTokenAmount("10000000000000000000000", "VET", 18)).toBe("10K VET")
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
            expect(formatMarketData(15000)).toBe("15K")
            expect(formatMarketData(1000000)).toBe("1M")
            expect(formatMarketData(2300000000)).toBe("2.3B")
        })

        it("should show zero as '0' not '0.00'", () => {
            expect(formatMarketData(0)).toBe("0")
        })

        it("should format small numbers without compact notation", () => {
            expect(formatMarketData(999)).toBe("999")
            expect(formatMarketData(123.5)).toBe("123.50")
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
            expect(formatWithLessThan(0.15)).toBe("0.15")
            expect(formatWithLessThan(15000)).toBe("15K")
        })

        it("should respect custom threshold", () => {
            expect(formatWithLessThan(0.5, 1)).toBe("< 1.00")
            expect(formatWithLessThan(1.5, 1)).toBe("1.50")
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
            expect(formatDisplayNumber(0.1)).toBe("0.10")
        })

        it("should handle negative numbers", () => {
            const result1 = formatDisplayNumber(-15000)
            const result2 = formatDisplayNumber(-123.45)
            expect(typeof result1).toBe("string")
            expect(typeof result2).toBe("string")
            expect(result1).toBe("-15K")
            expect(result2).toBe("-123.45")
        })

        it("should handle string number inputs", () => {
            expect(formatDisplayNumber("15000")).toBe("15K")
            expect(formatDisplayNumber("123.456")).toBe("123.46")
        })

        it("should handle invalid inputs gracefully", () => {
            expect(formatDisplayNumber("invalid")).toBe("0.00")
            expect(formatDisplayNumber(NaN)).toBe("0.00")
        })
    })
})
