import React, { useCallback, useEffect, useMemo, useState } from "react"
import { AppRegistry } from "react-native"
import { enableAllPlugins } from "immer"
import { Provider as ReduxProvider } from "react-redux"
import { EntryPoint } from "./src/EntryPoint.tsx"
import { name as appName } from "./app.json"

import { NavigationContainer } from "@react-navigation/native"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { AsyncStoreType, useColorScheme, useTheme } from "~Common"
import { store } from "~Storage/Caches"
import { AsyncStore } from "~Storage/Stores"
import KeychainService from "~Services/KeychainService"
import { Translation as TranslationProvider } from "~Components"

// immer setup
enableAllPlugins()

export const AppContext = React.createContext()

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
        Work around is to clear the keychain by checking a value in the async store.
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

    const [isEncryptionKey, setIsEncryptionKey] = useState(false)

    return (
        <ReduxProvider store={store}>
            <AppContext.Provider
                value={{
                    isEncryptionKey,
                    setIsEncryptionKey,
                }}>
                <NavigationContainer theme={colorScheme}>
                    <SafeAreaProvider>
                        <TranslationProvider>
                            <EntryPoint />
                        </TranslationProvider>
                    </SafeAreaProvider>
                </NavigationContainer>
            </AppContext.Provider>
        </ReduxProvider>
    )
}

AppRegistry.registerComponent(appName, () => Main)
