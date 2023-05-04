import * as Localization from "expo-localization"
import { isLocale } from "~i18n"

export const getLocale = () => {
    return (
        Localization.getLocales()
            .map(loc => loc.languageCode)
            .find(isLocale) ?? "en"
    )
}

export const getLanguageTag = () => {
    const localeLanguage = Localization.getLocales().find(loc =>
        isLocale(loc.languageCode),
    )
    return localeLanguage?.languageTag
}

export default {
    getLocale,
    getLanguageTag,
}
