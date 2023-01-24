import React, { useCallback, useEffect, useMemo } from "react"
import { AppRegistry } from "react-native"
import { enableAllPlugins } from "immer"
import { Provider } from "react-redux"
import App from "./src/App"
import { name as appName } from "./app.json"

import { NavigationContainer } from "@react-navigation/native"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { AsyncStoreType, useColorScheme, useTheme } from "~Common"
import { store } from "~Storage/Caches"
import { RealmProvider } from "~Storage/Realm"
import { AsyncStore } from "~Storage/Stores"
import KeychainService from "~Services/KeychainService"

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

    /*
        Keychain values persist between new app installs. This is an expected behaviour.
        Work around is to clear the keychain by checking a flag in the async store.
    */
    const cleanKeychain = useCallback(async () => {
        const value = await AsyncStore.getFor(AsyncStoreType.IsFirstAppLoad)
        if (!value) {
            await KeychainService.removeEncryptionKey()
        }
    }, [])

    useEffect(() => {
        cleanKeychain()
    }, [cleanKeychain])

    const colorScheme = useMemo(
        () => getTheme(scheme, theme.colors.background),
        [scheme, theme],
    )

    return (
        <Provider store={store}>
            <NavigationContainer theme={colorScheme}>
                <RealmProvider>
                    <SafeAreaProvider>
                        <App />
                    </SafeAreaProvider>
                </RealmProvider>
            </NavigationContainer>
        </Provider>
    )
}

AppRegistry.registerComponent(appName, () => Main)
