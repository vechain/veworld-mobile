import { BigNumber } from "bignumber.js"

export const ROUND_DECIMAL_ZERO = 0
export const ROUND_DECIMAL_DEFAULT = 2
export const ROUND_DECIMAL_PRECISE = 6

export type DateType = "short" | "full" | "long" | "medium" | undefined

export const isZero = (value?: BigNumber.Value) => {
    if (!value && value !== 0) return false
    return new BigNumber(value).isZero()
}

export const humanUrl = (url: string, lengthBefore = 8, lengthAfter = 6) => {
    const before = url.substring(0, lengthBefore)
    const after = url.substring(url.length - lengthAfter)
    return `${before}…${after}`
}

export const formatAlias = (alias: string, maxLength = 18, lengthBefore = 6, lengthAfter = 6) => {
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

// /**
//  * Format currency
//  */
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

export const limitChars = (text: string) => {
    if (text.length <= 24) {
        return text
    } else {
        return text.slice(0, 24)
    }
}
