import React, { useEffect, useMemo, useState } from "react"
import { BaseToast, ConnexContextProvider } from "~Components"
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet"
import { NavigationContainer } from "@react-navigation/native"
import { useTheme } from "~Common"
import { loadLocale_sync, Locales, TypesafeI18n } from "~i18n"
import { Provider } from "react-redux"
import { TokenApi, reducer } from "~Storage/Redux"
export { default as TestHelpers } from "./helpers"
import { configureStore } from "@reduxjs/toolkit"

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
const store = configureStore({
    reducer: reducer,
    middleware: getDefaultMiddleware =>
        getDefaultMiddleware().concat(TokenApi.middleware),
    preloadedState: {
        accounts: {
            accounts: [
                {
                    address: "0xCF130b42Ae33C5531277B4B7c0F1D994B8732957",
                    alias: "Account 1",
                    index: 0,
                    rootAddress: "0x90d70a5d0e9ce28336f7d45990b9c63c0a4142g0",
                    visible: true,
                },
            ],
            selectedAccount: "0xCF130b42Ae33C5531277B4B7c0F1D994B8732957",
        },
    },
})
export const TestWrapper = ({ children }: { children: React.ReactNode }) => {
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
                <BaseToast />
            </ConnexContextProvider>
        </Provider>
    )
}
