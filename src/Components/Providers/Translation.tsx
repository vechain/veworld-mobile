import React, { useEffect, useState } from "react"
import { Locales, TypesafeI18n, isLocale, loadLocaleAsync } from "~i18n"
import * as Localization from "expo-localization"
import "~Common/polyfill"

type Props = {
    children: React.ReactNode
}

export const Translation = ({ children }: Props) => {
    // todo.vas -> issue #25

    const [localeLoaded, setLocaleLoaded] = useState<Locales | null>(null)

    useEffect(() => {
        async function init() {
            const DEFAULT_LOCALE =
                Localization.getLocales()
                    .map(loc => loc.languageCode)
                    .find(isLocale) ?? "en"

            await loadLocaleAsync(DEFAULT_LOCALE)
            setLocaleLoaded(DEFAULT_LOCALE)
        }
        init()
    }, [])

    if (localeLoaded === null) {
        return null
    }

    return <TypesafeI18n locale={localeLoaded}>{children}</TypesafeI18n>
}
