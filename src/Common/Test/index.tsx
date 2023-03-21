/*
 * this file includes standard mocks for native modules to fix native Module not found errors in tests like:
 * "Failed to install react-native-quick-crypto: The native `QuickCrypto` Module could not be found."
 */
jest.mock("react-native-quick-crypto", () => ({
    getRandomValues: jest.fn(buffer => buffer),
    randomFillSync: jest.fn(buffer => buffer),
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

import React, { useEffect, useMemo, useState } from "react"
import Realm from "realm"
import {
    Account,
    Config,
    Device,
    Network,
    Mnemonic,
    AppLock,
    UserPreferences,
    XPub,
} from "~Storage"
import {
    ConfigContextProvider,
    ConnexContextProvider,
    UserPreferencesContextProvider,
} from "~Components"
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet"
import { NavigationContainer } from "@react-navigation/native"
import { useTheme } from "~Common"
import { initRealmClasses, RealmContext } from "~Storage/Realm/RealmContext"
import { loadLocale_sync, Locales, TypesafeI18n } from "~i18n"

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
let realmCache: Realm
let realmStore: Realm
const configCache = {
    schema: [Mnemonic, AppLock],
    inMemory: true,
    path: "test-cache",
}
const configStore = {
    schema: [Device, XPub, Config, Account, UserPreferences, Network],
    path: "test-store",
}
beforeAll(async () => {
    realmCache = await Realm.open(configCache)
    realmStore = await Realm.open(configStore)
    initRealmClasses(realmCache, realmStore, "light")
})
afterAll(async () => {
    if (!realmCache.isClosed) {
        realmCache.close()
    }
    if (!realmStore.isClosed) {
        realmStore.close()
    }
    if (configCache) {
        Realm.deleteFile(configCache)
    }
    if (configStore) {
        Realm.deleteFile(configStore)
    }
})

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
    const value = useMemo(() => ({ cache: realmCache, store: realmStore }), [])
    return (
        <RealmContext.Provider value={value}>
            <ConfigContextProvider>
                <UserPreferencesContextProvider>
                    <ConnexContextProvider>
                        <BottomSheetModalProvider>
                            <NavigationProvider>
                                <TestTranslationProvider>
                                    {children}
                                </TestTranslationProvider>
                            </NavigationProvider>
                        </BottomSheetModalProvider>
                    </ConnexContextProvider>
                </UserPreferencesContextProvider>
            </ConfigContextProvider>
        </RealmContext.Provider>
    )
}
