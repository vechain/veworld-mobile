import React, { useCallback, useEffect, useMemo } from "react"
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

    /*
        Keychain values persist between new app installs. This is an expected behaviour.
        Work around is to clear the keychain by checking if it's the first app load.
    */
    const cleanKeychain = useCallback(async () => {
        if (appLockStatus === AppLockStatus.NO_LOCK) {
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

    useEffect(() => {
        const init = async () => {
            if (
                appLockStatus === AppLockStatus.NO_LOCK ||
                isLockScreenFlow(appLockStatus, unlockFlow)
            ) {
                await RNBootSplash.hide({ fade: true })
            }

            if (isBiometricLockFlow(appLockStatus, unlockFlow)) {
                let { success } =
                    await BiometricsUtils.authenticateWithbiometric()
                if (success) {
                    await RNBootSplash.hide({ fade: true })
                }
            }
        }
        init()
    }, [appLockStatus, unlockFlow])

    if (isLockScreenFlow(appLockStatus, unlockFlow)) {
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

export const isLockScreenFlow = (
    appLockStatus: AppLockStatus | undefined,
    unlockFlow: AppUnlockFlow,
) => {
    return (
        appLockStatus === AppLockStatus.LOCKED_STATE &&
        unlockFlow === AppUnlockFlow.PASS_UNLOCK
    )
}

export const isBiometricLockFlow = (
    appLockStatus: AppLockStatus | undefined,
    unlockFlow: AppUnlockFlow,
) => {
    return (
        appLockStatus === AppLockStatus.LOCKED_STATE &&
        unlockFlow === AppUnlockFlow.BIO_UNLOCK
    )
}
