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
    useAppLock,
    useWalletSecurity,
} from "~Common"
import { WALLET_STATUS } from "~Model"

export const EntryPoint = () => {
    const { store, cache } = useRealm()

    const { appLockStatus, unlockApp } = useAppLock()
    const { walletSecurity, isSecurityDowngrade } = useWalletSecurity()

    // TODO: Going form SecurityDowngrade to normal this is called twice and enters twice in "isBiometricLockFlow" causing the biometric prompt to be called twice
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
    } else if (results.error) {
        AlertUtils.showCancelledFaceIdAlert(
            async () => {
                // TODO: SIGN OUT USER
                console.log("cancel action - SIGN OUT USER")
            },
            async () => {
                return await recursiveFaceId()
            },
        )
    }
}
