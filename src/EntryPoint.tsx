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
    useAppLock,
    useWalletSecurity,
} from "~Common"
import { WALLET_STATUS } from "~Model"

export const EntryPoint = () => {
    const store = useStore()
    const cache = useCache()
    const { appLockStatus, unlockApp } = useAppLock()
    const { walletSecurity, isSecurityDowngrade } = useWalletSecurity()

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
                isSecurityDowngrade ||
                LockScreenUtils.isLockScreenFlow(appLockStatus, walletSecurity)
            ) {
                await RNBootSplash.hide({ fade: true })
            }

            if (
                LockScreenUtils.isBiometricLockFlow(
                    appLockStatus,
                    walletSecurity,
                )
            ) {
                await recursiveFaceId()
            }
        }
        init()
    }, [appLockStatus, walletSecurity, isSecurityDowngrade])

    if (LockScreenUtils.isLockScreenFlow(appLockStatus, walletSecurity)) {
        return <LockScreen onSuccess={unlockApp} />
    }

    return (
        <>
            {process.env.NODE_ENV === "development" && (
                <RealmPlugin realms={[store, cache]} />
            )}

            <Security />

            {isSecurityDowngrade && <SecurityDowngradeScreen />}

            {!isSecurityDowngrade && (
                <>
                    <BaseStatusBar />
                    <SwitchStack />
                </>
            )}
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
