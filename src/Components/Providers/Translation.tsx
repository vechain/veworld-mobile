import React, { useEffect, useState } from "react"
import { Locales, TypesafeI18n, isLocale, loadLocaleAsync } from "~i18n"
import * as Localization from "expo-localization"
import "~Common/polyfill"
import { useAppSelector } from "~Storage/Caches"
import { selectCurrentAppState, selectPreviousAppState } from "~Selectors"
import { AppStateType } from "~Model"

type Props = {
    children: React.ReactNode
}

export const Translation = ({ children }: Props) => {
    const currentAppState = useAppSelector(selectCurrentAppState)
    const previousAppState = useAppSelector(selectPreviousAppState)

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

        if (currentAppState === AppStateType.ACTIVE) {
            init()
        }
    }, [currentAppState, previousAppState])

    if (localeLoaded === null) {
        return null
    }

    return <TypesafeI18n locale={localeLoaded}>{children}</TypesafeI18n>
}
