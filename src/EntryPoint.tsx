import React, { useCallback, useEffect, useMemo, useState } from "react"
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
import { BiometricsPlaceholder } from "~Screens/BiometricsPlaceholder"
import { useAppStateTransitions } from "~Common/Hooks/useAppStateTransitions"

export const EntryPoint = () => {
    const store = useStore()
    const cache = useCache()

    const { appLockStatus, unlockApp } = useAppLock()
    const { walletSecurity, isSecurityDowngrade } = useWalletSecurity()
    const { closedToActive, inactiveToBackground, backgroundToActive } =
        useAppStateTransitions()

    const [_isAppLock, setisAppLock] = useState(false)

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
        if (inactiveToBackground) {
            setisAppLock(true)
        }
    }, [inactiveToBackground])

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
        // Handle splash screen only when opening app from closed state
        if (closedToActive) init()
    }, [appLockStatus, walletSecurity, isSecurityDowngrade, closedToActive])

    if (
        _isAppLock &&
        appLockStatus !== AppLockStatus.NO_LOCK &&
        !isSecurityDowngrade &&
        LockScreenUtils.isBiometricLockFlow(appLockStatus, walletSecurity)
    ) {
        return (
            <BiometricsPlaceholder
                setisAppLock={setisAppLock}
                backgroundToActive={backgroundToActive}
            />
        )
    }

    if (LockScreenUtils.isLockScreenFlow(appLockStatus, walletSecurity)) {
        return <LockScreen onSuccess={unlockApp} />
    }

    return (
        <>
            {process.env.NODE_ENV === "development" && (
                <RealmPlugin realms={[store, cache]} />
            )}

            <Security />

            {isSecurityDowngrade ? (
                <SecurityDowngradeScreen />
            ) : (
                <>
                    <BaseStatusBar />
                    <SwitchStack />
                </>
            )}
        </>
    )
}

const recursiveFaceId = async () => {
    let results = await BiometricsUtils.authenticateWithBiometric()
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
