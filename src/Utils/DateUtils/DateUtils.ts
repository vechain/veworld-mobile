import moment, { Moment } from "moment"
import { Locales } from "~i18n"

/**
 * Checks if the provided locale string is valid.
 *
 * @param {string} locale - The locale string to check.
 * @returns {boolean} True if the locale is valid, false otherwise.
 */
export const isValidDateLocale = (locale: string): boolean => {
    try {
        Intl.DateTimeFormat(locale)
        return true
    } catch (ex) {
        return false
    }
}

/**
 * Checks if the provided timezone string is valid.
 *
 * @param {string} timezone - The timezone string to check.
 * @returns {boolean} True if the timezone is valid, false otherwise.
 */
export const isValidTimezone = (timezone: string): boolean => {
    try {
        Intl.DateTimeFormat(undefined, { timeZone: timezone })
        return true
    } catch (ex) {
        return false
    }
}

/**
 * Formats a timestamp into a localized date and time string.
 *
 * @param {number} timestamp - The timestamp to format.
 * @param {string} locale - The locale to use for formatting.
 * @param {string} timeZone - The timezone to use for formatting.
 * @param {Object} options - The options for formatting.
 *    @param {boolean} options.hideTime - Whether to only include the date in the formatted string.
 *    @param {boolean} options.hideDay - Whether to include the day number in the formatted string.
 * @returns {string} The formatted date and time string.
 * @throws {Error} If the provided locale or timezone is invalid.
 */
export const formatDateTime = (
    timestamp: number,
    locale: string,
    timeZone: string,
    options?: { hideTime?: boolean; hideDay: boolean },
): string => {
    if (!isValidDateLocale(locale)) return ""
    if (isNaN(timestamp) || !timestamp || timestamp < 0) return ""
    if (!isValidTimezone(timeZone)) return ""

    const date: Date = new Date(timestamp)

    const dateFormatterOptions: Intl.DateTimeFormatOptions = {
        timeZone,
        year: "numeric",
        month: "short",
    }

    if (!options?.hideDay) {
        dateFormatterOptions.day = "2-digit"
    }

    const dateFormatter = new Intl.DateTimeFormat(locale, dateFormatterOptions)
    const timeFormatter = new Intl.DateTimeFormat(locale, {
        timeZone,
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
    })

    const formattedDate = dateFormatter.format(date)
    const formattedTime = timeFormatter.format(date)
    const time = options?.hideTime ? "" : ` - ${formattedTime.replace(/ (AM|PM)/, "")}`

    return `${formattedDate}${time}`
}

export const DEFAULT_TIMEZONE = "UTC"

/**
 * Get the moment locale from the internationalization library (from useI18nContext())
 * @param locale Locale from our internationalization library
 * @returns the correct locale from moment
 */
export const getMomentLocale = (locale: Locales) => {
    switch (locale) {
        case "tw":
            return "zh-tw"
        case "zh":
            return "zh-cn"
        case "de":
            return "de"
        case "en":
            return "en"
        case "es":
            return "es"
        case "fr":
            return "fr"
        case "hi":
            return "hi"
        case "it":
            return "it"
        case "ja":
            return "ja"
        case "ko":
            return "ko"
        case "nl":
            return "nl"
        case "pl":
            return "pl"
        case "pt":
            return "pt"
        case "ru":
            return "ru"
        case "sv":
            return "sv"
        case "tr":
            return "tr"
        case "vi":
            return "vi"
        default:
            return "en"
    }
}

type FormatDateArgs = {
    /**
     * Include the year as part of the formatted date.
     * @default false
     */
    includeYear?: boolean
    /**
     * Decide on how to display the month.
     * `short` will show `Sep` for September, `long` will show `September`
     * @default short
     */
    monthDisplay?: "short" | "long"
}
export const formatDate = (
    value: string | number | Moment | Date,
    locale: string,
    { includeYear, monthDisplay = "short" }: FormatDateArgs = {},
) => {
    const parsedLocale = locale.includes("zh") ? "zh" : locale
    const formatter = new Intl.DateTimeFormat(parsedLocale, {
        month: monthDisplay,
        day: "2-digit",
        ...(includeYear && { year: "numeric" }),
    })
    return formatter.format(moment(value).valueOf())
}
