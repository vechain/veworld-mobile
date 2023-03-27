import React, { useEffect, useMemo, useState } from "react"
import Realm from "realm"
import {
    Account,
    Device,
    Network,
    Mnemonic,
    AppLock,
    UserPreferences,
    XPub,
} from "~Storage"
import {
    ConnexContextProvider,
    UserPreferencesContextProvider,
} from "~Components"
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet"
import { NavigationContainer } from "@react-navigation/native"
import { useTheme } from "~Common"
import { initRealmClasses, RealmContext } from "~Storage/Realm/RealmContext"
import { loadLocale_sync, Locales, TypesafeI18n } from "~i18n"
import { Provider } from "react-redux"
import { useInitStore } from "~Storage/Redux"
import { ColorSchemeName } from "react-native"

export const getTheme = (): NonNullable<ColorSchemeName> => "light"

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
    schema: [Device, XPub, Account, UserPreferences, Network],
    path: "test-store",
}
beforeAll(async () => {
    realmCache = await Realm.open(configCache)
    realmStore = await Realm.open(configStore)
    initRealmClasses(realmCache, realmStore, getTheme())
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
    const [store, persist] = useInitStore()

    if (!store || !persist) return null

    return (
        <Provider store={store as any}>
            <RealmContext.Provider value={value}>
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
            </RealmContext.Provider>
        </Provider>
    )
}
