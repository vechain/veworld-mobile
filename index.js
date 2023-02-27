import React, { useMemo } from "react"
import { AppRegistry } from "react-native"
import { enableAllPlugins } from "immer"
import { EntryPoint } from "./src/EntryPoint"
import { name as appName } from "./app.json"

import { NavigationContainer } from "@react-navigation/native"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { useColorScheme, useTheme } from "~Common"
import { Translation as TranslationProvider } from "~Components"
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

    const colorScheme = useMemo(
        () => getTheme(scheme, theme.colors.background),
        [scheme, theme],
    )

    return (
        // eslint-disable-next-line react-native/no-inline-styles
        <GestureHandlerRootView style={{ flex: 1 }}>
            <RealmContextProvider>
                <BottomSheetModalProvider>
                    <NavigationContainer theme={colorScheme}>
                        <SafeAreaProvider>
                            <TranslationProvider>
                                {fontsLoaded && <EntryPoint />}
                            </TranslationProvider>
                        </SafeAreaProvider>
                    </NavigationContainer>
                </BottomSheetModalProvider>
            </RealmContextProvider>
        </GestureHandlerRootView>
    )
}

AppRegistry.registerComponent(appName, () => Main)
