import React, { useEffect, useState } from "react"
import { TypesafeI18n, Locales, loadAllLocales_sync } from "~i18n"
import "~Utils/polyfill"
import { AppStateType } from "~Model"
import { useAppState } from "~Hooks"

type Props = {
    children: React.ReactNode
}

export const TranslationProvider = ({ children }: Props) => {
    const { currentState } = useAppState()
    const [loadedLocale, setLoadedLocale] = useState<Locales | null>(null)

    useEffect(() => {
        if (currentState === AppStateType.ACTIVE) {
            loadAllLocales_sync()
            setLoadedLocale("en")
        }
    }, [currentState])

    if (loadedLocale === null) {
        return null
    }

    return <TypesafeI18n locale={loadedLocale}>{children}</TypesafeI18n>
}
