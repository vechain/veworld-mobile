import React, { useMemo } from "react"
import { AppRegistry } from "react-native"
import { enableAllPlugins } from "immer"
import { EntryPoint } from "./src/EntryPoint"
import { name as appName } from "./app.json"

import { NavigationContainer } from "@react-navigation/native"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { useColorScheme, useTheme } from "~Common"
import { RealmProvider, Translation as TranslationProvider } from "~Components"

// immer setup
enableAllPlugins()

const getTheme = (scheme, colorTheme) => {
    const theme = {
        colors: {
            background: colorTheme,
            border: colorTheme,
        },
    }
    return theme
}

const Main = () => {
    const scheme = useColorScheme()
    const theme = useTheme()

    const colorScheme = useMemo(
        () => getTheme(scheme, theme.colors.background),
        [scheme, theme],
    )

    return (
        <RealmProvider>
            <NavigationContainer theme={colorScheme}>
                <SafeAreaProvider>
                    <TranslationProvider>
                        <EntryPoint />
                    </TranslationProvider>
                </SafeAreaProvider>
            </NavigationContainer>
        </RealmProvider>
    )
}

AppRegistry.registerComponent(appName, () => Main)
