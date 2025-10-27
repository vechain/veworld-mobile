import React, { ComponentClass, FC } from "react"

// need this function because JS will auto convert very small numbers to scientific notation
export function convertSmallSciNotationToDecimal(value: number): string {
    "worklet"
    const isNAN = Number.isNaN(value)
    if (isNAN) return "-"
    const num = value.toPrecision(4)
    if (!num.includes("e-")) return num

    const [base, exponent] = num.split("e-")
    if (!base || !exponent) return "-"

    const decimal = base.replace(".", "")
    return "0.".concat("0".repeat(Number(exponent) - 1).concat(decimal))
}

const DEFAULT_PRECISION = 2
const DEFAULT_ABSOLUTE = false

export function numberToPercentWorklet(
    value?: number,
    options: {
        precision: number
        absolute: boolean
        locale?: Intl.LocalesArgument
    } = { precision: DEFAULT_PRECISION, absolute: DEFAULT_ABSOLUTE, locale: "en-US" },
): string {
    "worklet"

    const round = (v: number, precision = 0): number => {
        const p = Math.pow(10, precision)
        return Math.round(v * p) / p
    }

    const { precision, absolute, locale } = options

    if (precision < 0) {
        throw new Error("numberToPercentWorklet does not handle negative precision values")
    }

    const formatter = new Intl.NumberFormat(locale?.toString(), {
        style: "decimal",
        minimumFractionDigits: precision,
        maximumFractionDigits: precision,
        useGrouping: true,
    })

    if (value === undefined || Number.isNaN(value)) {
        return "-"
    }

    // Round and absolute value as needed
    let shapedValue = round(value, precision)
    if (absolute) {
        shapedValue = Math.abs(shapedValue)
    }

    // return raw value when precision is zero
    if (precision === 0) {
        return `${formatter.format(shapedValue)}%`
    }

    return `${formatter.format(shapedValue)}%`
}

/**
 * Worklet-safe function to format fiat amounts for use in Reanimated contexts
 * All parameters are explicit to avoid closure issues
 *
 * @param amount - Amount to format
 * @param currencySymbol - Currency symbol (e.g., "$", "€")
 * @param locale - Locale for number formatting (e.g., "en-US", "nl-BE")
 * @param symbolPosition - Where to place the symbol
 * @param minFractionDigits - Minimum decimal places
 * @param maxFractionDigits - Maximum decimal places
 * @returns Formatted currency string
 *
 * @example
 * // In useDerivedValue
 * const formatted = useDerivedValue(() =>
 *   formatFiatWorklet(price.value, "$", "en-US", "before", 2, 5)
 * , [price.value])
 */
export function formatFiatWorklet(
    amount: number,
    currencySymbol: string,
    locale: string,
    symbolPosition: "before" | "after",
    minFractionDigits: number,
    maxFractionDigits: number,
    options: { cover?: boolean } = {},
): string {
    "worklet"

    // Handle invalid values
    if (amount === undefined || Number.isNaN(amount) || !Number.isFinite(amount)) {
        const formatter = new Intl.NumberFormat(locale, {
            style: "decimal",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
            useGrouping: true,
        })
        const formatted = formatter.format(0)
        const covered = options.cover ? "•".repeat(formatted.length) + "••" : formatted
        return symbolPosition === "after" ? `${covered} ${currencySymbol}` : `${currencySymbol}${covered}`
    }

    const formatter = new Intl.NumberFormat(locale, {
        style: "decimal",
        minimumFractionDigits: minFractionDigits,
        maximumFractionDigits: maxFractionDigits,
        useGrouping: true,
    })

    const formatted = formatter.format(amount)
    const covered = options.cover ? "•".repeat(formatted.length) + "••" : formatted
    return symbolPosition === "after" ? `${covered} ${currencySymbol}` : `${currencySymbol}${covered}`
}

export const wrapFunctionComponent = <TProps,>(Component: FC<TProps>): ComponentClass<TProps> =>
    class extends React.Component<TProps> {
        constructor(props: TProps) {
            super(props)
        }

        render() {
            return <Component {...this.props} />
        }
    }
