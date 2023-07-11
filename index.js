/* eslint-disable react-native/no-inline-styles */
import React, { useMemo } from "react"
import { AppRegistry, LogBox } from "react-native"
import { enableAllPlugins } from "immer"
import { EntryPoint } from "./src/EntryPoint"
import { name as appName } from "./app.json"
import "@walletconnect/react-native-compat"
import { NavigationContainer } from "@react-navigation/native"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { useTheme } from "~Hooks"
import {
    BaseToast,
    ConnexContextProvider,
    TranslationProvider,
    WalletConnectContextProvider,
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
import { typography } from "~Constants"
import { info } from "~Utils"
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet"
import "./errorHandler"
import { StoreContextProvider } from "~Components/Providers/StoreProvider"
import "react-native-url-polyfill/auto"

const { fontFamily } = typography

// immer setup
enableAllPlugins()

const isHermes = () => !!global.HermesInternal
info("is Hermes active : ", isHermes())

if (__DEV__ && process.env.REACT_APP_UI_LOG === "false") {
    // hide all ui logs
    LogBox.ignoreAllLogs()
}

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

    return (
        <StoreContextProvider>
            <GestureHandlerRootView style={{ flex: 1 }}>
                <ConnexContextProvider>
                    <SafeAreaProvider>
                        <TranslationProvider>
                            <NavigationProvider>
                                <BottomSheetModalProvider>
                                    <WalletConnectContextProvider>
                                        {fontsLoaded && <EntryPoint />}
                                    </WalletConnectContextProvider>
                                </BottomSheetModalProvider>
                            </NavigationProvider>
                            <BaseToast />
                        </TranslationProvider>
                    </SafeAreaProvider>
                </ConnexContextProvider>
            </GestureHandlerRootView>
        </StoreContextProvider>
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
