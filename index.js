import React, { useMemo } from "react"
import { AppRegistry } from "react-native"
import { enableAllPlugins } from "immer"
import { EntryPoint } from "./src/EntryPoint"
import { name as appName } from "./app.json"

import { PersistGate } from "redux-persist/integration/react"
import { Provider } from "react-redux"
import { NavigationContainer } from "@react-navigation/native"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { useTheme } from "~Common"
import {
    ConnexContextProvider,
    TranslationProvider,
    BaseToast,
} from "~Components"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { useFonts } from "expo-font"
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
import { typography } from "~Common/Theme/Typography"

import { BottomSheetModalProvider } from "@gorhom/bottom-sheet"
import "./errorHandler"
import { useInitStore } from "~Storage/Redux"

const { fontFamily } = typography

// immer setup
enableAllPlugins()

const Main = () => {
    const [fontsLoaded] = useFonts({
        [fontFamily["Inter-Bold"]]: Inter_Bold,
        [fontFamily["Inter-Regular"]]: Inter_Regular,
        [fontFamily["Inter-Light"]]: Inter_Light,
        [fontFamily["Inter-Medium"]]: Inter_Medium,
        [fontFamily["Mono-Extra-Bold"]]: Mono_Extra_Bold,
        [fontFamily["Mono-Bold"]]: Mono_Bold,
        [fontFamily["Mono-Regular"]]: Mono_Regular,
        [fontFamily["Mono-Light"]]: Mono_Light,
    })

    const { store, persistor } = useInitStore()

    if (!store || !persistor) return <></>

    return (
        <Provider store={store}>
            <PersistGate loading={null} persistor={persistor}>
                <GestureHandlerRootView style={{ flex: 1 }}>
                    <ConnexContextProvider>
                        <SafeAreaProvider>
                            <BottomSheetModalProvider>
                                <NavigationProvider>
                                    <TranslationProvider>
                                        {fontsLoaded && <EntryPoint />}
                                    </TranslationProvider>
                                </NavigationProvider>
                            </BottomSheetModalProvider>
                            <BaseToast />
                        </SafeAreaProvider>
                    </ConnexContextProvider>
                </GestureHandlerRootView>
            </PersistGate>
        </Provider>
    )
}

const NavigationProvider = ({ children }) => {
    const theme = useTheme()

    const navigationTheme = useMemo(
        () => ({
            dark: theme.isDark,
            colors: theme.colors,
        }),
        [theme],
    )
    return (
        <NavigationContainer theme={navigationTheme}>
            {children}
        </NavigationContainer>
    )
}

AppRegistry.registerComponent(appName, () => Main)

if (__DEV__) {
    const ignoreWarns = [
        "VirtualizedLists should never be nested inside plain ScrollViews",
    ]

    const errorWarn = global.console.error
    global.console.error = (...arg) => {
        for (const error of ignoreWarns) {
            if (arg[0]?.startsWith?.(error)) {
                return
            }
        }
        errorWarn(...arg)
    }
}
