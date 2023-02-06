import React, { useMemo } from "react"
import { AppRegistry } from "react-native"
import { enableAllPlugins } from "immer"
import { EntryPoint } from "./src/EntryPoint"
import { name as appName } from "./app.json"

import { NavigationContainer } from "@react-navigation/native"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { useColorScheme, useTheme } from "~Common"
import { RealmProvider, Translation as TranslationProvider } from "~Components"
import { GestureHandlerRootView } from "react-native-gesture-handler"

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
        // eslint-disable-next-line react-native/no-inline-styles
        <GestureHandlerRootView style={{ flex: 1 }}>
            <RealmProvider>
                <NavigationContainer theme={colorScheme}>
                    <SafeAreaProvider>
                        <TranslationProvider>
                            <EntryPoint />
                        </TranslationProvider>
                    </SafeAreaProvider>
                </NavigationContainer>
            </RealmProvider>
        </GestureHandlerRootView>
    )
}

AppRegistry.registerComponent(appName, () => Main)
