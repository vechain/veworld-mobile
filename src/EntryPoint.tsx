import React, { useCallback, useEffect, useMemo } from "react"
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
import { App } from "./App"
import { useFonts } from "expo-font"
import { SecurityDowngradeScreen, LockScreen } from "~Screens"
import {
    AppLock,
    Config,
    RealmClass,
    useCache,
    useCachedQuery,
    useStore,
    useStoreQuery,
} from "~Storage"
import KeychainService from "~Services/KeychainService"
import { Security } from "~Components"
import RealmPlugin from "realm-flipper-plugin-device"
import RNBootSplash from "react-native-bootsplash"

export const EntryPoint = () => {
    const store = useStore()
    const cache = useCache()

    // const appConfig = useStoreObject(Config, "APP_CONFIG")
    // todo: this is a workaround until the new version is installed, then use the above
    const result1 = useStoreQuery(Config)
    const config = useMemo(() => result1.sorted("_id"), [result1])

    // todo: this is a workaround until the new version is installed
    const result2 = useCachedQuery(AppLock)
    const appLock = useMemo(() => result2.sorted("_id"), [result2])

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

    /*
        Keychain values persist between new app installs. This is an expected behaviour.
        Work around is to clear the keychain by checking a value in the async store.
    */
    const cleanKeychain = useCallback(async () => {
        const value = config[0]?.isFirstAppLoad
        if (value) {
            await KeychainService.removeEncryptionKey()
        }
    }, [config])

    const initRealmClasses = useCallback(() => {
        if (!appLock[0]) {
            cache.write(() => {
                cache.create(RealmClass.AppLock, { status: "LOCKED" })
            })
        }
        if (!config[0]) {
            store.write(() => {
                store.create(RealmClass.Config, {})
            })
        }
    }, [appLock, cache, config, store])

    useEffect(() => {
        initRealmClasses()
        cleanKeychain()
    }, [cleanKeychain, initRealmClasses])

    useEffect(() => {
        const init = async () => {
            if (fontsLoaded && appLock[0]?.status) {
                await RNBootSplash.hide({ fade: true })
            }
        }
        init()
    }, [appLock, fontsLoaded])

    if (
        appLock[0]?.status === "LOCKED" &&
        !config[0]?.isFirstAppLoad &&
        fontsLoaded
    ) {
        return <LockScreen />
    }

    return (
        <>
            {process.env.NODE_ENV === "development" && (
                <RealmPlugin realms={[store, cache]} />
            )}

            <Security />

            {fontsLoaded && config[0]?.isSecurityDowngrade && (
                <SecurityDowngradeScreen />
            )}
            {fontsLoaded && <App />}
        </>
    )
}
