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
import { useFonts } from "expo-font"
import { SecurityDowngradeScreen, LockScreen } from "~Screens"
import {
    AppLock,
    Biometrics,
    Config,
    RealmClass,
    useCache,
    useCachedQuery,
    useStore,
    useStoreQuery,
} from "~Storage"
import KeychainService from "~Services/KeychainService"
import { BaseStatusBar, Security } from "~Components"
import RealmPlugin from "realm-flipper-plugin-device"
import RNBootSplash from "react-native-bootsplash"
import { SwitchStack } from "~Navigation"
import { BiometricsUtils } from "~Common"

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

    // todo: this is a workaround until the new version is installed, then use the above
    const result3 = useCachedQuery(Biometrics)
    const biometrics = useMemo(() => result3.sorted("_id"), [result3])

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

    // this can be done in Realm provider but current version of Realm is bugged
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
            if (biometrics[0]?.accessControl) {
                if (!config[0].isAppLockActive || config[0]?.isFirstAppLoad) {
                    await RNBootSplash.hide({ fade: true })
                    return
                }

                if (
                    appLock[0]?.status === "LOCKED" &&
                    config[0].isAppLockActive
                ) {
                    let { success } =
                        await BiometricsUtils.authenticateWithbiometric()
                    if (success) {
                        await RNBootSplash.hide({ fade: true })
                        cache.write(() => {
                            appLock[0].status = "UNLOCKED"
                        })
                        return
                    }
                }
            } else {
                // show lock screen
                if (fontsLoaded && appLock[0]?.status) {
                    await RNBootSplash.hide({ fade: true })
                    return
                }
            }
        }
        init()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [biometrics, cache, config, fontsLoaded])

    // overwrite default cache if use hasn't activated the preference in app settings
    // used for first time the user activates the pref in app settings
    useEffect(() => {
        if (!config[0].isAppLockActive) {
            cache.write(() => {
                appLock[0].status = "UNLOCKED"
            })
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    if (
        appLock[0]?.status === "LOCKED" && // cache status default is LOCKED (this is set to UNLOCKED on LockScreen)
        !config[0]?.isFirstAppLoad && // dont' show while on onBoarding phase
        config[0].isAppLockActive && // user has activated the preference in app settings
        !biometrics[0]?.accessControl && // it's not biometrics enabled
        fontsLoaded // fonts are loaded (app is ready)
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

            {fontsLoaded && (
                <>
                    <BaseStatusBar />
                    <SwitchStack />
                </>
            )}
        </>
    )
}
