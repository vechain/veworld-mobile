import { renderHook } from "@testing-library/react-hooks"
import { TestWrapper } from "~Test"
import { CURRENCY, CURRENCY_FORMATS, SYMBOL_POSITIONS, ThemeEnum } from "~Constants"
import { RootState } from "~Storage/Redux/Types"
import { useFormatFiat } from "./useFormatFiat"

const createPreloadedState = (): Partial<RootState> => {
    return {
        userPreferences: {
            theme: ThemeEnum.SYSTEM,
            hideTokensWithNoBalance: false,
            isPinCodeRequired: true,
            balanceVisible: true,
            currency: CURRENCY.USD,
            currencyFormat: CURRENCY_FORMATS.DOT,
            symbolPosition: SYMBOL_POSITIONS.BEFORE,
            language: "en",
            isAnalyticsTrackingEnabled: true,
            isSentryTrackingEnabled: true,
            devFeaturesEnabled: false,
            lastReviewTimestamp: "",
            lastVersionCheck: "",
            lastNotificationReminder: null,
        },
    }
}

describe("useFormatFiat", () => {
    describe("useCompactNotation parameter", () => {
        it("should use compact notation by default (K, M, B)", () => {
            const preloadedState = createPreloadedState()

            const { result } = renderHook(() => useFormatFiat(), {
                wrapper: TestWrapper,
                initialProps: {
                    preloadedState,
                },
            })

            // Test with value that should use K notation (10,000+)
            const formattedValue = result.current.formatFiat({ amount: 15000 })
            expect(formattedValue).toBe("$15K")
        })

        it("should use compact notation when explicitly enabled", () => {
            const preloadedState = createPreloadedState()

            const { result } = renderHook(() => useFormatFiat({ useCompactNotation: true }), {
                wrapper: TestWrapper,
                initialProps: {
                    preloadedState,
                },
            })

            // Test K notation
            const formattedK = result.current.formatFiat({ amount: 50000 })
            expect(formattedK).toBe("$50K")

            // Test M notation
            const formattedM = result.current.formatFiat({ amount: 2500000 })
            expect(formattedM).toBe("$2.5M")

            // Test B notation
            const formattedB = result.current.formatFiat({ amount: 1200000000 })
            expect(formattedB).toBe("$1.2B")
        })

        it("should not use compact notation when disabled", () => {
            const preloadedState = createPreloadedState()

            const { result } = renderHook(() => useFormatFiat({ useCompactNotation: false }), {
                wrapper: TestWrapper,
                initialProps: {
                    preloadedState,
                },
            })

            // Values that would normally use compact notation should show full numbers
            const formatted15k = result.current.formatFiat({ amount: 15000 })
            expect(formatted15k).toBe("$15,000.00")

            const formatted50k = result.current.formatFiat({ amount: 50000 })
            expect(formatted50k).toBe("$50,000.00")

            const formatted1M = result.current.formatFiat({ amount: 1000000 })
            expect(formatted1M).toBe("$1,000,000.00")
        })

        it("should show 2 decimals for small values when compact notation is disabled", () => {
            const preloadedState = createPreloadedState()

            const { result } = renderHook(() => useFormatFiat({ useCompactNotation: false }), {
                wrapper: TestWrapper,
                initialProps: {
                    preloadedState,
                },
            })

            const formatted = result.current.formatFiat({ amount: 1234.56 })
            expect(formatted).toBe("$1,234.56")
        })

        it("should handle zero values correctly with compact notation disabled", () => {
            const preloadedState = createPreloadedState()

            const { result } = renderHook(() => useFormatFiat({ useCompactNotation: false }), {
                wrapper: TestWrapper,
                initialProps: {
                    preloadedState,
                },
            })

            const formatted = result.current.formatFiat({ amount: 0 })
            expect(formatted).toBe("$0.00")
        })

        it("should respect symbol position with compact notation disabled", () => {
            const preloadedState = createPreloadedState()

            const { result } = renderHook(() => useFormatFiat({ useCompactNotation: false }), {
                wrapper: TestWrapper,
                initialProps: {
                    preloadedState,
                },
            })

            // Test AFTER position
            const formattedAfter = result.current.formatFiat({
                amount: 12345,
                symbolPosition: SYMBOL_POSITIONS.AFTER,
            })
            expect(formattedAfter).toBe("12,345.00 $")

            // Test BEFORE position (default)
            const formattedBefore = result.current.formatFiat({
                amount: 12345,
                symbolPosition: SYMBOL_POSITIONS.BEFORE,
            })
            expect(formattedBefore).toBe("$12,345.00")
        })

        it("should work with covered balances regardless of compact notation setting", () => {
            const preloadedState = createPreloadedState()

            const { result: resultWithCompact } = renderHook(() => useFormatFiat({ useCompactNotation: true }), {
                wrapper: TestWrapper,
                initialProps: {
                    preloadedState,
                },
            })

            const { result: resultWithoutCompact } = renderHook(() => useFormatFiat({ useCompactNotation: false }), {
                wrapper: TestWrapper,
                initialProps: {
                    preloadedState,
                },
            })

            const coveredWithCompact = resultWithCompact.current.formatFiat({ amount: 12345, cover: true })
            const coveredWithoutCompact = resultWithoutCompact.current.formatFiat({ amount: 12345, cover: true })

            // Both should return the same covered format
            expect(coveredWithCompact).toMatch(/^[$]•+$/)
            expect(coveredWithoutCompact).toMatch(/^[$]•+$/)
            expect(coveredWithCompact).toBe(coveredWithoutCompact)
        })
    })

    describe("formatValue", () => {
        it("should format values with 2 decimals and grouping", () => {
            const preloadedState = createPreloadedState()

            const { result } = renderHook(() => useFormatFiat(), {
                wrapper: TestWrapper,
                initialProps: {
                    preloadedState,
                },
            })

            const formatted = result.current.formatValue(1234.5678)
            expect(formatted).toBe("1,234.57")
        })
    })
})
