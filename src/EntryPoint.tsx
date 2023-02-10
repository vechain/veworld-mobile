import React, { useCallback, useEffect, useMemo } from "react"
// import {
//     Inter_Bold,
//     Inter_Light,
//     Inter_Medium,
//     Inter_Regular,
//     Mono_Bold,
//     Mono_Extra_Bold,
//     Mono_Light,
//     Mono_Regular,
// } from "~Assets"
// import { useFonts } from "expo-font"
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
import {
    AppLockStatus,
    AppUnlockFlow,
    BiometricsUtils,
    useAppLockStatus,
    useUnlockFlow,
} from "~Common"

export const EntryPoint = () => {
    const store = useStore()
    const cache = useCache()
    const appLockStatus = useAppLockStatus()
    const unlockFlow = useUnlockFlow()

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

    // const [fontsLoaded] = useFonts({
    //     "Inter-Bold": Inter_Bold,
    //     "Inter-Regular": Inter_Regular,
    //     "Inter-Light": Inter_Light,
    //     "Inter-Medium": Inter_Medium,
    //     "Mono-Extra-Bold": Mono_Extra_Bold,
    //     "Mono-Bold": Mono_Bold,
    //     "Mono-Regular": Mono_Regular,
    //     "Mono-Light": Mono_Light,
    // })

    /*
        Keychain values persist between new app installs. This is an expected behaviour.
        Work around is to clear the keychain by checking a value in the async store.
    */
    const cleanKeychain = useCallback(async () => {
        if (appLockStatus === AppLockStatus.INIT_STATE) {
            await KeychainService.removeEncryptionKey()
        }
    }, [appLockStatus])

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

    const initBiometricUnlock = useCallback(async () => {
        let { success } = await BiometricsUtils.authenticateWithbiometric()
        cache.write(() => (appLock[0].status = "UNLOCKED"))
        success && (await RNBootSplash.hide({ fade: true }))
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cache])

    const initUserPasswordUnlock = useCallback(async () => {
        await RNBootSplash.hide({ fade: true })
    }, [])

    useEffect(() => {
        const init = async () => {
            if (unlockFlow === AppUnlockFlow.BIO_UNLOCK) {
                initBiometricUnlock()
            } else {
                initUserPasswordUnlock()
            }
        }
        biometrics[0] && config[0] && unlockFlow && init()
    }, [
        biometrics,
        config,
        initBiometricUnlock,
        initUserPasswordUnlock,
        unlockFlow,
    ])

    console.log("appLockStatus", appLockStatus)
    console.log("unlockFlow", unlockFlow)

    if (
        appLockStatus === AppLockStatus.LOCKED_STATE &&
        unlockFlow === AppUnlockFlow.PASS_UNLOCK
    ) {
        return <LockScreen />
    }

    return (
        <>
            {process.env.NODE_ENV === "development" && (
                <RealmPlugin realms={[store, cache]} />
            )}

            <Security />

            {config[0]?.isSecurityDowngrade && <SecurityDowngradeScreen />}

            <>
                <BaseStatusBar />
                <SwitchStack />
            </>
        </>
    )
}
