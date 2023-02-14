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
import { BaseStatusBar, Security } from "~Components"
import RealmPlugin from "realm-flipper-plugin-device"
import RNBootSplash from "react-native-bootsplash"
import { SwitchStack } from "~Navigation"
import {
    AppLockStatus,
    BiometricsUtils,
    LockScreenUtils,
    useAppLockStatus,
    useUnlockFlow,
} from "~Common"
import { WALLET_STATUS } from "~Model"

export const EntryPoint = () => {
    const store = useStore()
    const cache = useCache()
    const appLockStatus = useAppLockStatus()
    const unlockFlow = useUnlockFlow()

    // const appConfig = useStoreObject(Config, "APP_CONFIG")
    // todo: this is a workaround until the new version is installed, then use the above
    const configQuery = useStoreQuery(Config)
    const config = useMemo(() => configQuery.sorted("_id"), [configQuery])

    // todo: this is a workaround until the new version is installed
    const appLockQuery = useCachedQuery(AppLock)
    const appLock = useMemo(() => appLockQuery.sorted("_id"), [appLockQuery])

    // this can be done in Realm provider but current version of Realm is bugged
    const initRealmClasses = useCallback(() => {
        if (!appLock[0]) {
            cache.write(() => {
                cache.create(RealmClass.AppLock, {
                    status: WALLET_STATUS.LOCKED,
                })
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
    }, [initRealmClasses])

    useEffect(() => {
        const init = async () => {
            if (
                appLockStatus === AppLockStatus.NO_LOCK ||
                LockScreenUtils.isLockScreenFlow(appLockStatus, unlockFlow)
            ) {
                await RNBootSplash.hide({ fade: true })
            }

            if (
                LockScreenUtils.isBiometricLockFlow(appLockStatus, unlockFlow)
            ) {
                let { success } =
                    await BiometricsUtils.authenticateWithbiometric()
                if (success) {
                    await RNBootSplash.hide({ fade: true })
                }
            }
        }
        init()
    }, [appLockStatus, unlockFlow])

    const unlockWallet = useCallback(() => {
        cache.write(() => {
            appLock[0].status = WALLET_STATUS.UNLOCKED
        })
    }, [cache, appLock])

    if (LockScreenUtils.isLockScreenFlow(appLockStatus, unlockFlow)) {
        return <LockScreen onSuccess={unlockWallet} />
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
