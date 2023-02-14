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
    AlertUtils,
    AppLockStatus,
    BiometricsUtils,
    LockScreenUtils,
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
                await recursiveFaceId()
            }
        }
        init()
    }, [appLockStatus, unlockFlow])

    if (LockScreenUtils.isLockScreenFlow(appLockStatus, unlockFlow)) {
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

const recursiveFaceId = async () => {
    let results = await BiometricsUtils.authenticateWithbiometric()
    if (results.success) {
        await RNBootSplash.hide({ fade: true })
        return
    } else if (results.error) {
        AlertUtils.showCancelledFaceIdAlert(
            async () => {
                // TODO: SIGN OUT USER
                console.log("cancel action - SIGN OUT USER")
                return
            },
            async () => {
                await recursiveFaceId()
            },
        )
    }
}
