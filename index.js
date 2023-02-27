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
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet"

// immer setup
enableAllPlugins()

const Main = () => {
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
