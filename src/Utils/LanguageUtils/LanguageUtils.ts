import { locales } from "~i18n"
import { languageMap } from "~Model"

/**
 * A custom method which returns an array of supported language names.
 * The language names are obtained from the `languageMap` object and the `locales` array.
 *
 * @returns An array of supported language names.
 */
export const getSupportedLanguages = () => {
    const supportedLanguages: Array<string> = []

    locales.forEach(locale => {
        // extract language code from locale string (e.g. "en-US" -> "en")
        const languageCode = locale.split("-")[0]
        // use language name from languageMap, or `locale` string if not available
        const languageName: string = languageMap[languageCode] || locale
        supportedLanguages.push(languageName)
    })

    return supportedLanguages
}
