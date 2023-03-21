import { useMemo } from "react"
import { locales } from "~i18n"
import { languageMap } from "~Model"

/**
 * A custom React hook that returns an array of supported language names.
 * The language names are obtained from the `languageMap` object and the `locales` array.
 *
 * @returns An array of supported language names.
 */
export const useSupportedLanguages = () => {
    const supportedLanguages = useMemo(() => {
        const result: Array<string> = []

        locales.forEach(locale => {
            const languageCode = locale.split("-")[0] // extract language code from locale string
            const languageName: string = languageMap[languageCode] || locale // use language name from languageMap, or locale string if not available
            result.push(languageName)
        })

        return result
    }, [])

    return supportedLanguages
}
