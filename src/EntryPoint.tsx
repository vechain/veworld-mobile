import React from "react"
import { AppState, RealmProvider, Security } from "~Components"
import {
    Inter_Bold,
    Inter_Light,
    Inter_Medium,
    Inter_Regular,
    Mono_Bold,
    Mono_Extra_Bold,
    Mono_Light,
    Mono_Regular,
} from "~Assets"
import { selectSecurityDowngrade, useAppSelector } from "~Storage/Caches"
import { App } from "./App"
import { useFonts } from "expo-font"
import { SecurityDowngradeScreen } from "~Screens"

export const EntryPoint = () => {
    const isSecurityDowngrade = useAppSelector(selectSecurityDowngrade)

    const [fontsLoaded] = useFonts({
        "Inter-Bold": Inter_Bold,
        "Inter-Regular": Inter_Regular,
        "Inter-Light": Inter_Light,
        "Inter-Medium": Inter_Medium,
        "Mono-Extra-Bold": Mono_Extra_Bold,
        "Mono-Bold": Mono_Bold,
        "Mono-Regular": Mono_Regular,
        "Mono-Light": Mono_Light,
    })

    return (
        <>
            <AppState />
            <Security />

            {fontsLoaded && (
                <RealmProvider>
                    {isSecurityDowngrade && <SecurityDowngradeScreen />}
                    <App />
                </RealmProvider>
            )}
        </>
    )
}
