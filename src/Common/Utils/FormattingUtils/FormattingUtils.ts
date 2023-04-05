import { BigNumber } from "bignumber.js"
import { error } from "~Common"
// import dayjs from "dayjs"
// import RelativeTime from "dayjs/plugin/relativeTime"
// import VeWorldErrors from "common/errors/VeWorldErrors"
// import { error } from "common/logging/Logger"
// import { detectLocale } from "i18n"

// import { CURRENCY } from "popup/model/Settings/enums"
import RoundingMode = BigNumber.RoundingMode

export const ROUND_DECIMAL_DEFAULT = 2

// const locale = detectLocale()

/**
 * Scale the number up by the specified number of decimal places
 * @param val - the value to scale up (a number or string representation of a number)
 * @param scaleDecimal - the number of decimals to scale up by
 * @param roundDecimal - the number of decimals to round the result to
 * @param roundingStrategy - what strategy to use when rounding. Based on the strategies defined in `bignumber.js`. Default strategy is ROUND_HALF_UP
 * @returns the scaled up result as a string
 */
export const scaleNumberUp = (
    val: BigNumber.Value,
    scaleDecimal: number,
    roundDecimal = 0,
    roundingStrategy: RoundingMode = BigNumber.ROUND_HALF_UP,
): string => {
    try {
        if (scaleDecimal === 0) return new BigNumber(val).toFixed()
        if (scaleDecimal < 0)
            throw Error("Decimal value must be greater than or equal to 0")
        const valBn = new BigNumber(val)
        if (valBn.isNaN()) throw Error("The value provided is NaN.")

        const amount = valBn.times(`1${"0".repeat(scaleDecimal)}`)

        if (scaleDecimal === roundDecimal) return amount.toFixed()

        return amount.toFixed(roundDecimal, roundingStrategy)
    } catch (e) {
        error(e)
        throw e
        // throw VeWorldErrors.internal(`Failed to scale number up (${val})`, e)
    }
}

/**
 * Scale the number down by the specified number of decimal places
 * @param val - the value to scale down (a number or string representation of a number)
 * @param scaleDecimal - the number of decimals to scale down by
 * @param roundDecimal - the number of decimals to round the result to
 * @param roundingStrategy - what strategy to use when rounding. Based on the strategies defined in `bignumber.js`. Default strategy is ROUND_HALF_UP
 * @returns the scaled up result as a string
 */
export const scaleNumberDown = (
    val: BigNumber.Value,
    scaleDecimal: number,
    roundDecimal = 0,
    roundingStrategy: RoundingMode = BigNumber.ROUND_HALF_UP,
): string => {
    try {
        if (scaleDecimal === 0) return new BigNumber(val).toFixed()
        if (scaleDecimal < 0)
            throw Error("Decimal value must be greater than or equal to 0")

        const valBn = new BigNumber(val)
        if (valBn.isNaN()) throw Error("The value provided is NaN.")

        const amount = valBn.dividedBy(`1${"0".repeat(scaleDecimal)}`)

        if (scaleDecimal === roundDecimal) return amount.toFixed()

        return amount.toFixed(roundDecimal, roundingStrategy)
    } catch (e) {
        error(e)
        throw e
        // throw VeWorldErrors.internal(`Failed to scale number down (${val})`, e)
    }
}

/**
 * Convert token balance to fiat balance
 * @param balance - raw token balance
 * @param rate - exchange rate
 * @param decimals - the number of decimals for token
 * @returns the formatted time
 */
export const convertToFiatBalance = (
    balance: string,
    rate: number,
    decimals: number,
) => {
    const fiatBalance = new BigNumber(balance).multipliedBy(rate)
    return scaleNumberDown(fiatBalance, decimals, 2)
}

export type DateType = "short" | "full" | "long" | "medium" | undefined

/**
 * Format the date & time
 * @param time - epoch timestamp (in seconds)
 * @param dateSyle - the date style
 * @param timeStyle - the time style
 * @returns the formatted date time
 */
// export const humanDateTimeFromEpoch = (
//     time: number,
//     dateSyle: DateType = "short",
//     timeStyle: DateType = "short",
// ) => {
//     return humanDateTime(time * 1000, dateSyle, timeStyle)
// }

/**
 * Format the date & time
 * @param time - js timestamp (in milliseconds)
 * @param dateSyle - the date style
 * @param timeStyle - the time style
 * @returns the formatted date time
 */
// export const humanDateTime = (
//     time: number,
//     dateSyle: "short" | "full" | "long" | "medium" | undefined = "short",
//     timeStyle: "short" | "full" | "long" | "medium" | undefined = "short",
// ) => {
//     return new Date(time).toLocaleString(locale, {
//         hour12: false,
//         dateStyle: dateSyle,
//         timeStyle: timeStyle,
//     })
// }

/**
 * Format the date time from epoch timestamp
 * @param time - epoch timestamp (in seconds)
 * @returns the formatted time
 */
// export const humanDateTimeRelativeFromEpoch = (time: number) => {
//     return humanDateTimeRelative(time * 1000)
// }

/**
 * Format the time
 * @param time - js timestamp (in milliseconds)
 * @returns the formatted date time
 */
// export const humanDateTimeRelative = (time: number) => {
//     dayjs.extend(RelativeTime).locale(locale)

//     const today = dayjs()
//     const date = dayjs(time)
//     if (date.isSame(today, "hour")) {
//         return date.fromNow()
//     } else if (date.isSame(today, "week")) {
//         return `${date.fromNow()}, ${date.format("HH:mm")}`
//     } else {
//         return humanDateTime(time)
//     }
// }

/**
 * Format the time
 * @param time - value in timestamp
 * @param time - (optional) additional options
 * @returns the formatted time
 */
// export const humanTime = (
//     time: number,
//     options: object = {
//         hour: "2-digit",
//         minute: "2-digit",
//     },
// ) => {
//     const date = new Date(time)
//     return date.toLocaleTimeString(locale, options)
// }

/**
 * Format the number human friendly
 * @param formattedValue - value in string or number
 * @param originalValue - value in string or number to determine if the original value is 0
 * @param symbol - (optional) symbol to append at end of number (with a space)
 * @returns the formatted number
 */
export const humanNumber = (
    formattedValue: BigNumber.Value,
    originalValue?: BigNumber.Value,
    symbol: string | null = null,
) => {
    const suffix = symbol ? " " + symbol : ""
    let value = new Intl.NumberFormat("en", {
        style: "decimal",
        minimumFractionDigits:
            Number.parseFloat(formattedValue.toString()) % 1 === 0 ? 0 : 2,
    }).format(Number.parseFloat(formattedValue.toString()))

    //If the original number got scaled down to 0
    if (!isZero(originalValue) && isZero(value)) {
        value = "< 0.01"
    }

    return value + suffix
}

export const isZero = (value?: BigNumber.Value) => {
    if (!value) return false
    return new BigNumber(value).isZero()
}

/**
 * Format address
 * @param address - the address
 * @param lengthBefore - (optional, default 4) the characters to show before the dots
 * @param lengthAfter - (optional, default 4) the characters to show after the dots
 * @returns the formatted address
 */
export const humanAddress = (
    address: string,
    lengthBefore = 4,
    lengthAfter = 10,
) => {
    const before = address.substring(0, lengthBefore)
    const after = address.substring(address.length - lengthAfter)
    return `${before}…${after}`
}

export const humanUrl = (url: string, lengthBefore = 8, lengthAfter = 6) => {
    const before = url.substring(0, lengthBefore)
    const after = url.substring(url.length - lengthAfter)
    return `${before}…${after}`
}

export const formatAlias = (
    alias: string,
    maxLength = 18,
    lengthBefore = 6,
    lengthAfter = 6,
) => {
    if (alias.length <= maxLength) return alias
    const before = alias.substring(0, lengthBefore)
    const after = alias.substring(alias.length - lengthAfter)
    const formatted = `${before}…${after}`

    if (formatted.length > alias.length - 2) return alias

    return formatted
}

/**
 * Modify url to remove Protocol from prefix
 * @param url - raw token balance
 * @returns url without HTTP / HTTPS prefix
 */
export const removeUrlProtocolAndPath = (url: string) => {
    return new URL(url).host
}

/**
 * Format currency
 */
// export const formatCurrency = (currency: CURRENCY): string => {
//     let name = "Dollar (US)"
//     switch (currency) {
//         case CURRENCY.EUR:
//             name = "Euro"
//             break
//         case CURRENCY.USD:
//         default:
//     }

//     return `${currency} - ${name}`
// }
