/**
 * Standardized Number Formatting Utilities
 *
 * This module provides consistent number formatting across the entire app
 * following these rules:
 * - Values < 10,000: Show 2 decimals (e.g., 999.99, 9,999.99)
 * - K notation (10K-999K): Show 2 decimals (e.g., 10.11K, 999.99K)
 * - M/B notation: Show 1 decimal (e.g., 999.9M, 999.9B)
 * - Zero balances: Locale-aware formatting (e.g., "0.00" or "0,00")
 * - Near-zero values: Locale-aware "< 0.01" or "< 0,01" notation
 * - Special tokens (BTC, ETH, SOL): 4 decimals with < 0.0001 threshold
 * - Locale-aware formatting respecting user settings
 */

import BigNutils from "~Utils/BigNumberUtils"
import { getNumberFormatter } from "~Constants/Constants/NumberFormatter"

export interface StandardFormatOptions {
    locale?: Intl.LocalesArgument
    useCompactNotation?: boolean
    forceDecimals?: number
    showZeroAs?: string
    tokenSymbol?: string
    includeSymbol?: boolean
}

export interface TokenAwareFormatOptions extends StandardFormatOptions {
    tokenSymbol?: string
}

/**
 * Special tokens that require 4 decimal places precision
 */
const HIGH_PRECISION_TOKENS = ["BTC", "ETH", "SOL"]

/**
 * Formats a number for display with standardized rules
 * @param value - Number to format (string, number, or BigNumber compatible)
 * @param options - Formatting options
 * @returns Formatted string following app standards
 */
export const formatDisplayNumber = (value: string | number, options: StandardFormatOptions = {}): string => {
    const { locale = "en-US", useCompactNotation = true, forceDecimals, showZeroAs } = options

    const bigNum = BigNutils(value)

    if (bigNum.isZero) {
        return (
            showZeroAs ?? getNumberFormatter({ locale, precision: 2, style: "decimal", useGrouping: false }).format(0)
        )
    }

    const numValue = bigNum.toNumber

    if (!Number.isFinite(numValue) || Number.isNaN(numValue)) {
        return (
            showZeroAs ?? getNumberFormatter({ locale, precision: 2, style: "decimal", useGrouping: false }).format(0)
        )
    }

    const absValue = Math.abs(numValue)
    const isNegative = numValue < 0

    // Handle compact notation for large numbers
    if (useCompactNotation && absValue >= 10000) {
        // Use absolute value for compact notation calculation
        const absNum = BigNutils(absValue)

        // For K notation (10K - 999K): use 2 decimals
        if (absValue < 1000000) {
            const compactString = absNum.toCompactString(locale, 2)
            // Remove trailing .00K
            const formatted = compactString.replaceAll(/\.00([K])/g, "$1")
            return isNegative ? `-${formatted}` : formatted
        }
        // For M, B, T notation: use 1 decimal
        const compactString = absNum.toCompactString(locale, 1)
        // Remove trailing .0M, .0B, etc.
        const formatted = compactString.replaceAll(/\.0([MBTQ])/g, "$1")
        return isNegative ? `-${formatted}` : formatted
    }

    // For values < 10,000: use 2 decimals (unless forceDecimals is set)
    const decimals = forceDecimals ?? (numValue % 1 === 0 ? 0 : 2)
    const formatter = getNumberFormatter({
        locale,
        precision: decimals,
        style: "decimal",
        useGrouping: true,
    })

    const formatted = formatter.format(numValue)

    // Check if the formatted value rounds to zero but the actual value is not zero
    const zeroFormatted = getNumberFormatter({ locale, precision: 0, style: "decimal", useGrouping: false }).format(0)
    const zeroFormattedWithTwoDecimals = getNumberFormatter({
        locale,
        precision: 2,
        style: "decimal",
        useGrouping: false,
    }).format(0)
    if ((formatted === zeroFormatted || formatted === zeroFormattedWithTwoDecimals) && !bigNum.isZero) {
        const threshold = getNumberFormatter({ locale, precision: 2, style: "decimal", useGrouping: false }).format(
            0.01,
        )
        return `< ${threshold}`
    }

    return formatted
}

/**
 * Formats a balance for display (always shows 2 decimals for zero, 1 for others)
 * @param balance - Balance to format
 * @param options - Formatting options
 * @returns Formatted balance string
 */
export const formatBalance = (balance: string | number, options: StandardFormatOptions = {}): string => {
    const { locale = "en-US" } = options
    const bigNum = BigNutils(balance)

    if (bigNum.isZero) {
        return getNumberFormatter({ locale, precision: 2, style: "decimal", useGrouping: false }).format(0)
    }

    return formatDisplayNumber(balance, {
        ...options,
        showZeroAs: getNumberFormatter({ locale, precision: 2, style: "decimal", useGrouping: false }).format(0),
    })
}

/**
 * Formats a fiat currency amount with standardized rules
 * @param amount - Amount to format
 * @param currencySymbol - Currency symbol to prepend/append
 * @param options - Formatting options
 * @returns Formatted currency string
 */
export const formatFiatAmount = (
    amount: string | number,
    currencySymbol: string = "$",
    options: StandardFormatOptions & { symbolPosition?: "before" | "after" } = {},
): string => {
    const { symbolPosition = "before", ...formatOptions } = options
    const formattedAmount = formatDisplayNumber(amount, formatOptions)
    return symbolPosition === "after" ? `${formattedAmount} ${currencySymbol}` : `${currencySymbol}${formattedAmount}`
}

/**
 * Formats a token amount with standardized rules
 * Special handling for BTC, ETH, SOL: 4 decimals with < 0.0001 threshold
 * @param amount - Token amount to format
 * @param tokenSymbol - Token symbol
 * @param decimals - Token decimals for conversion
 * @param options - Formatting options
 * @returns Formatted token amount string (with symbol by default, without if includeSymbol: false)
 */
export const formatTokenAmount = (
    amount: string | number,
    tokenSymbol: string,
    decimals: number = 18,
    options: StandardFormatOptions = {},
): string => {
    const humanAmount = BigNutils(amount).toHuman(decimals)
    const { locale = "en-US", includeSymbol = true } = options

    // Special handling for high-precision tokens (BTC, ETH, SOL)
    if (HIGH_PRECISION_TOKENS.includes(tokenSymbol.toUpperCase())) {
        const numValue = humanAmount.toNumber

        if (humanAmount.isZero) {
            const zeroFormatted = getNumberFormatter({
                locale,
                precision: 4,
                style: "decimal",
                useGrouping: false,
            }).format(0)
            return includeSymbol ? `${zeroFormatted} ${tokenSymbol}` : zeroFormatted
        }

        // Check if value is less than 0.0001
        if (Math.abs(numValue) < 0.0001) {
            const threshold = getNumberFormatter({
                locale,
                precision: 4,
                style: "decimal",
                useGrouping: false,
            }).format(0.0001)
            return includeSymbol ? `< ${threshold} ${tokenSymbol}` : `< ${threshold}`
        }

        // Format with 4 decimals
        const formatter = getNumberFormatter({
            locale,
            precision: 4,
            style: "decimal",
            useGrouping: true,
        })

        const formattedValue = formatter.format(numValue)
        return includeSymbol ? `${formattedValue} ${tokenSymbol}` : formattedValue
    }

    // Standard token formatting - always use 2 decimals for consistency
    const formattedAmount = formatDisplayNumber(humanAmount.toString, { ...options, forceDecimals: 2 })
    return includeSymbol ? `${formattedAmount} ${tokenSymbol}` : formattedAmount
}

/**
 * Formats a percentage with standardized rules (max 1 decimal)
 * @param value - Percentage value (as decimal, e.g., 0.15 for 15%)
 * @param options - Formatting options
 * @returns Formatted percentage string
 */
export const formatPercentage = (value: string | number, options: StandardFormatOptions = {}): string => {
    const { locale = "en-US" } = options
    const percentValue = BigNutils(value).times(100).toNumber

    if (percentValue === 0) {
        const zeroFormatted = getNumberFormatter({ locale, precision: 1, style: "decimal", useGrouping: false }).format(
            0,
        )
        return `${zeroFormatted}%`
    }

    const formatter = getNumberFormatter({
        locale,
        precision: 1,
        style: "decimal",
        useGrouping: false,
    })

    return `${formatter.format(percentValue)}%`
}

/**
 * Formats a large number for market data (market cap, volume, etc.)
 * Always uses compact notation with 1 decimal max
 * @param value - Value to format
 * @param options - Formatting options
 * @returns Formatted market data string
 */
export const formatMarketData = (value: string | number, options: StandardFormatOptions = {}): string => {
    return formatDisplayNumber(value, {
        ...options,
        useCompactNotation: true,
        showZeroAs: "0",
    })
}

/**
 * Checks if a number should be displayed with "less than" notation
 * @param value - Value to check
 * @param threshold - Minimum threshold (default: 0.01)
 * @returns Whether to show "< threshold" instead of actual value
 */
export const shouldShowLessThan = (value: string | number, threshold: number = 0.01): boolean => {
    const bigNum = BigNutils(value)
    return !bigNum.isZero && bigNum.isLessThan(threshold)
}

/**
 * Formats numbers with full precision for detail screens
 * - Token-aware precision: BTC/ETH/SOL use 4 decimals, others use 2 decimals
 * - Can be overridden with forceDecimals option
 * - Shows "< threshold" notation for very small amounts
 * @param value - Value to format
 * @param options - Formatting options (including optional tokenSymbol for smart precision)
 * @returns Formatted full precision string
 */
export const formatFullPrecision = (value: string | number, options: TokenAwareFormatOptions = {}): string => {
    const { locale = "en-US", showZeroAs, tokenSymbol, forceDecimals } = options

    const bigNum = BigNutils(value)

    if (bigNum.isZero) {
        // Use smart precision for zero values too
        const zeroPrecision =
            forceDecimals ?? (tokenSymbol && HIGH_PRECISION_TOKENS.includes(tokenSymbol.toUpperCase()) ? 4 : 2)
        return (
            showZeroAs ??
            getNumberFormatter({ locale, precision: zeroPrecision, style: "decimal", useGrouping: false }).format(0)
        )
    }

    const numValue = bigNum.toNumber

    if (!Number.isFinite(numValue) || Number.isNaN(numValue)) {
        return (
            showZeroAs ?? getNumberFormatter({ locale, precision: 2, style: "decimal", useGrouping: false }).format(0)
        )
    }

    // Smart precision based on token type
    // BTC/ETH/SOL: 4 decimals, others: 2 decimals
    let smartPrecision: number
    if (tokenSymbol && HIGH_PRECISION_TOKENS.includes(tokenSymbol.toUpperCase())) {
        smartPrecision = 4
    } else {
        smartPrecision = 2
    }

    // Use forceDecimals if provided, otherwise use smart precision
    const precision = forceDecimals ?? smartPrecision

    const formatter = getNumberFormatter({
        locale,
        precision,
        style: "decimal",
        useGrouping: true,
    })

    const formatted = formatter.format(numValue)

    // Use appropriate threshold based on precision
    const threshold = precision >= 4 ? 0.0001 : 0.01
    if (Math.abs(numValue) < threshold && Math.abs(numValue) > 0) {
        const thresholdStr = getNumberFormatter({
            locale,
            precision,
            style: "decimal",
            useGrouping: false,
        }).format(threshold)
        return `< ${thresholdStr}`
    }

    return formatted
}

/**
 * Formats a small amount with "less than" notation if needed
 * @param value - Value to format
 * @param threshold - Minimum threshold
 * @param options - Formatting options
 * @returns Formatted string with "< " prefix if below threshold
 */
export const formatWithLessThan = (
    value: string | number,
    threshold: number = 0.01,
    options: StandardFormatOptions = {},
): string => {
    const { locale = "en-US" } = options

    if (shouldShowLessThan(value, threshold)) {
        const formattedThreshold = getNumberFormatter({
            locale,
            precision: 2,
            style: "decimal",
            useGrouping: false,
        }).format(threshold)
        return `< ${formattedThreshold}`
    }

    return formatDisplayNumber(value, {
        ...options,
        showZeroAs: getNumberFormatter({ locale, precision: 2, style: "decimal", useGrouping: false }).format(0),
    })
}
