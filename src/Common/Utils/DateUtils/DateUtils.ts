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
 * @param {string} timezone - The timezone to use for formatting.
 * @returns {string} The formatted date and time string.
 * @throws {Error} If the provided locale or timezone is invalid.
 */
export const formatDateTime = (
    timestamp: number,
    locale: string,
    timezone: string,
): string => {
    if (!isValidDateLocale(locale))
        throw new Error(`Invalid locale: ${locale}.`)
    if (!isValidTimezone(timezone))
        throw new Error(`Invalid timezone: ${timezone}.`)

    const date: Date = new Date(timestamp)

    const dateFormatter = new Intl.DateTimeFormat(locale, {
        timeZone: timezone,
        year: "numeric",
        month: "short",
        day: "numeric",
    })

    const timeFormatter = new Intl.DateTimeFormat(locale, {
        timeZone: timezone,
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
    })

    const formattedDate = dateFormatter.format(date)
    const formattedTime = timeFormatter.format(date)
    const timeSuffix = formattedTime.includes("AM") ? " am" : " pm"

    return `${formattedDate} - ${formattedTime.replace(
        / (AM|PM)/,
        "",
    )}${timeSuffix}`
}

export const DEFAULT_TIMEZONE = "UTC"
