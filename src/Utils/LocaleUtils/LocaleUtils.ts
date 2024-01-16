import { getLocales } from "react-native-localize"
import { isLocale } from "~i18n"

export const getLocale = () => {
    return (
        getLocales()
            .map(loc => loc.languageCode)
            .find(isLocale) ?? "en"
    )
}

export const getLanguageTag = () => {
    const localeLanguage = getLocales().find(loc => isLocale(loc.languageCode))
    return localeLanguage?.languageTag
}

export default {
    getLocale,
    getLanguageTag,
}
