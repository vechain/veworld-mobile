import React, { useEffect, useState } from "react"
import { Locales, TypesafeI18n, isLocale, loadLocale_sync } from "~i18n"
import * as Localization from "expo-localization"
import "~Utils/polyfill"
import { AppStateType } from "~Model"
import { useAppState } from "~Hooks"

type Props = {
    children: React.ReactNode
}

export const TranslationProvider = ({ children }: Props) => {
    const { currentState } = useAppState()
    const [localeLoaded, setLocaleLoaded] = useState<Locales | null>(null)

    useEffect(() => {
        async function init() {
            const DEFAULT_LOCALE =
                Localization.getLocales()
                    .map(loc => loc.languageCode)
                    .find(isLocale) ?? "en"

            loadLocale_sync(DEFAULT_LOCALE)
            setLocaleLoaded(DEFAULT_LOCALE)
        }

        if (currentState === AppStateType.ACTIVE) {
            init()
        }
    }, [currentState])

    if (localeLoaded === null) {
        return null
    }

    return <TypesafeI18n locale={localeLoaded}>{children}</TypesafeI18n>
}
