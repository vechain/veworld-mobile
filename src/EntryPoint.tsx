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
import { SecurityDowngradeScreen } from "~Screens"
import { Config, RealmClass, useCache, useStore, useStoreQuery } from "~Storage"
import KeychainService from "~Services/KeychainService"
import { Security } from "~Components"
import RealmPlugin from "realm-flipper-plugin-device"

export const EntryPoint = () => {
    const store = useStore()
    const cache = useCache()
    // const appConfig = useStoreObject(Config, "APP_CONFIG")
    // todo: this is a workaround until the new version is installed, then use the above
    const result = useStoreQuery(Config)
    const config = useMemo(() => result.sorted("_id"), [result])

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

    const initRealmModels = useCallback(() => {
        if (!config[0]) {
            store.write(() => {
                store.create(RealmClass.Config, {})
            })
        }
    }, [config, store])

    useEffect(() => {
        initRealmModels()
        cleanKeychain()
    }, [cleanKeychain, initRealmModels])

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
