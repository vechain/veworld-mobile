import React, { useEffect } from "react"
import { SecurityDowngradeScreen, LockScreen } from "~Screens"
import { useRealm } from "~Storage"
import { BaseStatusBar, Security } from "~Components"
import RealmPlugin from "realm-flipper-plugin-device"
import RNBootSplash from "react-native-bootsplash"
import { SwitchStack } from "~Navigation"
import {
    AlertUtils,
    BiometricsUtils,
    LockScreenUtils,
    useAppLockStatus,
    useWalletSecurity,
} from "~Common"
import { WALLET_STATUS } from "~Model"

export const EntryPoint = () => {
    const { store, cache } = useRealm()

    const { appLockStatus, unlockApp } = useAppLockStatus()
    const { walletSecurity, isSecurityDowngrade } = useWalletSecurity()

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
