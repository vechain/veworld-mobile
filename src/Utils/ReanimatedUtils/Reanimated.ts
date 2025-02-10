// need this function because JS will auto convert very small numbers to scientific notation
export function convertSmallSciNotationToDecimal(value: number): string {
    "worklet"
    const isNAN = isNaN(value)
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
    } = { precision: DEFAULT_PRECISION, absolute: DEFAULT_ABSOLUTE },
): string {
    "worklet"

    const round = (v: number, precision = 0): number => {
        const p = Math.pow(10, precision)
        return Math.round(v * p) / p
    }

    const { precision, absolute, locale } = options

    const formatter = new Intl.NumberFormat(locale, {
        style: "decimal",
        useGrouping: true,
        minimumFractionDigits: precision,
    })
    if (precision < 0) {
        throw new Error("numberToPercentWorklet does not handle negative precision values")
    }

    if (value === undefined || isNaN(value)) {
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
