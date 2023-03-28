/*
 * this file includes standard mocks for native modules to fix native Module not found errors in tests like:
 * "Failed to install react-native-quick-crypto: The native `QuickCrypto` Module could not be found."
 */
jest.mock("react-native-quick-crypto", () => ({
    getRandomValues: jest.fn(buffer => buffer),
    randomFillSync: jest.fn(buffer => buffer),
    createCipheriv: jest.fn(() => ({
        update: (first: string) => first,
        final: () => "",
    })),
    createDecipheriv: jest.fn(() => ({
        update: (first: string) => first,
        final: () => "",
    })),
}))

jest.mock("expo-secure-store", () => ({
    getItemAsync: jest.fn(),
    setItemAsync: jest.fn(),
}))
jest.mock("expo-local-authentication", () => {})
jest.mock("expo-haptics", () => {})
jest.mock("expo-localization", () => {})
jest.mock("expo-clipboard", () => {})
jest.mock("react-native-wagmi-charts", () => {})
jest.mock("react-native-draggable-flatlist", () => {})
jest.mock("react-native-gesture-handler", () => {})
jest.mock("expo-camera", () => {})
jest.mock("expo-barcode-scanner", () => {})
jest.mock("react-native-flipper", () => ({
    addPlugin: jest.fn(),
}))

import React, { useEffect, useMemo, useState } from "react"
import { ConnexContextProvider } from "~Components"
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet"
import { NavigationContainer } from "@react-navigation/native"
import { useTheme } from "~Common"
import { loadLocale_sync, Locales, TypesafeI18n } from "~i18n"
import { Provider } from "react-redux"
import { useInitStore } from "~Storage/Redux"

const NavigationProvider = ({ children }: { children: React.ReactNode }) => {
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

export const TestTranslationProvider = ({
    children,
}: {
    children: React.ReactNode
}) => {
    const [localeLoaded, setLocaleLoaded] = useState<Locales | null>(null)

    useEffect(() => {
        async function init() {
            const DEFAULT_LOCALE = "en"
            loadLocale_sync(DEFAULT_LOCALE)
            setLocaleLoaded(DEFAULT_LOCALE)
        }

        init()
    }, [])

    if (localeLoaded === null) {
        return null
    }

    return <TypesafeI18n locale={localeLoaded}>{children}</TypesafeI18n>
}

export const TestWrapper = ({ children }: { children: React.ReactNode }) => {
    const { store, persistor } = useInitStore()

    if (!store || !persistor) return <></>

    return (
        <Provider store={store}>
            <ConnexContextProvider>
                <BottomSheetModalProvider>
                    <NavigationProvider>
                        <TestTranslationProvider>
                            {children}
                        </TestTranslationProvider>
                    </NavigationProvider>
                </BottomSheetModalProvider>
            </ConnexContextProvider>
        </Provider>
    )
}
