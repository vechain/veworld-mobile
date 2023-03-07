import React, { useMemo } from "react"
import { AppRegistry } from "react-native"
import { enableAllPlugins } from "immer"
import { EntryPoint } from "./src/EntryPoint"
import { name as appName } from "./app.json"

import { NavigationContainer } from "@react-navigation/native"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { useTheme } from "~Common"
import { TranslationProvider } from "~Components"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { useFonts } from "expo-font"
import { RealmContextProvider } from "~Storage"
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
const { fontFamily } = typography
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet"

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

    return (
        // eslint-disable-next-line react-native/no-inline-styles
        <GestureHandlerRootView style={{ flex: 1 }}>
            <RealmContextProvider>
                <BottomSheetModalProvider>
                    <NavigationProvider>
                        <SafeAreaProvider>
                            <TranslationProvider>
                                {fontsLoaded && <EntryPoint />}
                            </TranslationProvider>
                        </SafeAreaProvider>
                    </NavigationProvider>
                </BottomSheetModalProvider>
            </RealmContextProvider>
        </GestureHandlerRootView>
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
            if (arg[0].startsWith(error)) {
                return
            }
        }
        errorWarn(...arg)
    }
}
