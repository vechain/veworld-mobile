/**
 * Standardized Number Formatting Utilities
 *
 * This module provides consistent number formatting across the entire app
 * following these rules:
 * - Short precision: K/M notation with max 1 decimal for numbers >= 1000
 * - Zero balances: Always display as "0.00"
 * - Max 1 decimal for all display values
 * - Locale-aware formatting
 */

import BigNutils from "~Utils/BigNumberUtils"
import { getNumberFormatter } from "~Constants/Constants/NumberFormatter"

export interface StandardFormatOptions {
    locale?: Intl.LocalesArgument
    useCompactNotation?: boolean
    forceDecimals?: number
    showZeroAs?: string
}

/**
 * Formats a number for display with standardized rules
 * @param value - Number to format (string, number, or BigNumber compatible)
 * @param options - Formatting options
 * @returns Formatted string following app standards
 */
export const formatDisplayNumber = (value: string | number, options: StandardFormatOptions = {}): string => {
    const { locale = "en-US", useCompactNotation = true, forceDecimals, showZeroAs = "0.00" } = options

    const bigNum = BigNutils(value)

    if (bigNum.isZero) {
        return showZeroAs
    }

    const numValue = bigNum.toNumber

    if (!Number.isFinite(numValue) || Number.isNaN(numValue)) {
        return showZeroAs
    }

    if (useCompactNotation && Math.abs(numValue) >= 1000) {
        const compactString = bigNum.toCompactString(locale, 1)
        return compactString.replaceAll(/\.0([KMBTQ])/g, "$1")
    }

    const decimals = forceDecimals ?? (numValue % 1 === 0 ? 0 : 1)
    const formatter = getNumberFormatter({
        locale,
        precision: decimals,
        style: "decimal",
        useGrouping: true,
    })

    const formatted = formatter.format(numValue)

    if ((formatted === "0" || formatted === "0.0") && !bigNum.isZero) {
        return "< 0.01"
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
    const bigNum = BigNutils(balance)

    if (bigNum.isZero) {
        return "0.00"
    }

    return formatDisplayNumber(balance, {
        ...options,
        showZeroAs: "0.00",
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
 * @param amount - Token amount to format
 * @param tokenSymbol - Token symbol
 * @param decimals - Token decimals for conversion
 * @param options - Formatting options
 * @returns Formatted token amount string
 */
export const formatTokenAmount = (
    amount: string | number,
    tokenSymbol: string,
    decimals: number = 18,
    options: StandardFormatOptions = {},
): string => {
    const humanAmount = BigNutils(amount).toHuman(decimals)
    const formattedAmount = formatDisplayNumber(humanAmount.toString, options)

    return `${formattedAmount} ${tokenSymbol}`
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
        return "0.0%"
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
 * - For values > 1: Shows 2 decimal places (e.g., 300,000.24)
 * - For values < 1: Shows 5 decimal places (e.g., 0.47392)
 * @param value - Value to format
 * @param options - Formatting options
 * @returns Formatted full precision string
 */
export const formatFullPrecision = (value: string | number, options: StandardFormatOptions = {}): string => {
    const { locale = "en-US", showZeroAs = "0.00" } = options

    const bigNum = BigNutils(value)

    if (bigNum.isZero) {
        return showZeroAs
    }

    const numValue = bigNum.toNumber

    let precision: number
    if (Math.abs(numValue) >= 1) {
        precision = 2
    } else {
        const rounded2 = Math.round(numValue * 100) / 100
        if (Math.abs(rounded2 - numValue) < 0.0001) {
            precision = 2
        } else {
            precision = 5
        }
    }

    const formatter = getNumberFormatter({
        locale,
        precision,
        style: "decimal",
        useGrouping: true,
    })

    const formatted = formatter.format(numValue)

    if (Math.abs(numValue) < 1 && Math.abs(numValue) > 0 && Math.abs(numValue) < 0.01) {
        return "< 0.01"
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
    if (shouldShowLessThan(value, threshold)) {
        const formattedThreshold = formatDisplayNumber(threshold, {
            ...options,
            useCompactNotation: false,
            forceDecimals: 2,
        })
        return `< ${formattedThreshold}`
    }

    return formatDisplayNumber(value, {
        ...options,
        showZeroAs: "0.00",
    })
}
