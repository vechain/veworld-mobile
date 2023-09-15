import React, { useEffect, useMemo, useState } from "react"
import { BaseToast, ConnexContext, usePersistedTheme } from "~Components"
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet"
import { NavigationContainer } from "@react-navigation/native"
import { useTheme } from "~Hooks"
import { loadLocale_sync, Locales, TypesafeI18n } from "~i18n"
import { Provider } from "react-redux"
import { newStorage, NftSlice, NftSliceState, reducer } from "~Storage/Redux"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { configureStore } from "@reduxjs/toolkit"
import { DEVICE_TYPE } from "~Model"
import { RootState } from "~Storage/Redux/Types"
import { Platform } from "react-native"
import TestHelpers from "./helpers"
import { PersistConfig } from "redux-persist/es/types"
import { MMKV } from "react-native-mmkv"
import { SecurePersistedCache } from "~Storage/PersistedCache"
import { ThemeEnum } from "~Constants"

export { default as TestHelpers } from "./helpers"

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

export const setPlatform = (platform: "ios" | "android") => {
    Object.defineProperty(Platform, "OS", { get: jest.fn(() => platform) })
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

const nftPersistence: PersistConfig<NftSliceState> = {
    key: NftSlice.name,
    storage: newStorage(new MMKV({ id: "test-nft-storage" })),
    whitelist: ["blackListedCollections"],
}

const getStore = (preloadedState: Partial<RootState>) =>
    configureStore({
        reducer: reducer(nftPersistence),
        middleware: getDefaultMiddleware => getDefaultMiddleware(),
        preloadedState: {
            accounts: {
                accounts: [
                    {
                        address: "0xCF130b42Ae33C5531277B4B7c0F1D994B8732957",
                        alias: "Account 1",
                        index: 0,
                        rootAddress:
                            "0x90d70a5d0e9ce28336f7d45990b9c63c0a4142g0",
                        visible: true,
                    },
                ],
                selectedAccount: "0xCF130b42Ae33C5531277B4B7c0F1D994B8732957",
            },
            devices: [
                {
                    alias: "Wallet 1",
                    index: 0,
                    rootAddress: "0x90d70a5d0e9ce28336f7d45990b9c63c0a4142g0",
                    type: DEVICE_TYPE.LOCAL_MNEMONIC,
                    xPub: {
                        chainCode:
                            "8877fc5974c5b06d1fba342d0a04799f4239b8ea9934ea319d5428cf066926be",
                        publicKey:
                            "0494c3ff1acb0cf8e842c54a2bf109b7549d8f800895576892a4ea67eff584a427904a4b2545cf84569be87387bc5fe221c20d1ba5f23d278468faa98f54ddedbe",
                    },
                    wallet: JSON.stringify({
                        mnemonic:
                            "denial kitchen pet squirrel other broom bar gas better priority spoil cross".split(
                                " ",
                            ),
                        rootAddress:
                            "0x0c1a60341e1064bebb94e8769bd508b11ca2a27d",
                        nonce: "nonce",
                    }),
                    position: 0,
                },
            ],
            ...preloadedState,
        },
    })

export const TestWrapper = ({
    children,
    preloadedState,
}: {
    children: React.ReactNode
    preloadedState: Partial<RootState>
}) => {
    ;(
        usePersistedTheme as jest.Mock<ReturnType<typeof usePersistedTheme>>
    ).mockReturnValue({
        themeCache: new SecurePersistedCache<ThemeEnum>(
            "test-theme-key",
            "test-theme",
        ),
        theme: ThemeEnum.DARK,
        initThemeCache: jest.fn(),
        resetThemeCache: jest.fn(),
        changeTheme: jest.fn(),
    })

    return (
        <Provider store={getStore(preloadedState)}>
            <GestureHandlerRootView>
                <ConnexContext.Provider
                    value={TestHelpers.thor.mockThorInstance({})}>
                    <BottomSheetModalProvider>
                        <NavigationProvider>
                            <TestTranslationProvider>
                                {children}
                            </TestTranslationProvider>
                        </NavigationProvider>
                    </BottomSheetModalProvider>
                    <BaseToast />
                </ConnexContext.Provider>
            </GestureHandlerRootView>
        </Provider>
    )
}
