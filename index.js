import React, { useMemo } from "react"
import { AppRegistry } from "react-native"
import { enableAllPlugins } from "immer"
import { Provider } from "react-redux"
import App from "./src/App"
import { name as appName } from "./app.json"

import { NavigationContainer } from "@react-navigation/native"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { useColorScheme, useTheme } from "~Common"
import { store } from "~Storage/Caches"
import { RealmProvider } from "~Storage/Realm"

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
        <Provider store={store}>
            <RealmProvider>
                <NavigationContainer theme={colorScheme}>
                    <SafeAreaProvider>
                        <App />
                    </SafeAreaProvider>
                </NavigationContainer>
            </RealmProvider>
        </Provider>
    )
}

AppRegistry.registerComponent(appName, () => Main)
