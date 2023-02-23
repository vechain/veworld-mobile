import React, { useEffect } from "react"
import { SecurityDowngradeScreen, LockScreen } from "~Screens"
import { useCache, useStore } from "~Storage"
import { BaseStatusBar, Security } from "~Components"
import RealmPlugin from "realm-flipper-plugin-device"
import RNBootSplash from "react-native-bootsplash"
import { SwitchStack } from "~Navigation"
import {
    AlertUtils,
    BiometricsUtils,
    LockScreenUtils,
    useAppLock,
    useInitRealmClasses,
    useRenderCounter,
    useWalletSecurity,
    useAppStateTransitions,
} from "~Common"
import { WALLET_STATUS } from "~Model"

export const EntryPoint = () => {
    const store = useStore()
    const cache = useCache()

    useInitRealmClasses()
    useRenderCounter("EntryPoint")

    const { appLockStatus, unlockApp } = useAppLock()
    const { walletSecurity, isSecurityDowngrade } = useWalletSecurity()
    const { closedToActive } = useAppStateTransitions()

    useEffect(() => {
        const init = async () => {
            if (
                appLockStatus === WALLET_STATUS.NOT_INITIALISED ||
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

        if (closedToActive) init()
    }, [appLockStatus, walletSecurity, isSecurityDowngrade, closedToActive])

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
