import React, { useCallback, useEffect, useState } from "react"
import { SecurityDowngradeScreen, LockScreen } from "~Screens"
import { useCache, useStore } from "~Storage"
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
    useInitRealmClasses,
    useWalletSecurity,
} from "~Common"
import { BiometricsPlaceholder } from "~Screens/BiometricsPlaceholder"
import { useAppStateTransitions } from "~Common/Hooks/useAppStateTransitions"

export const EntryPoint = () => {
    const store = useStore()
    const cache = useCache()

    useInitRealmClasses()

    const { appLockStatus, unlockApp, lockApp } = useAppLock()
    const { walletSecurity, isSecurityDowngrade } = useWalletSecurity()

    const [isBackgroundTransition, setIsBackgroundTransition] = useState(false)
    const { activeToBackground, backgroundToActive, closedToActive } =
        useAppStateTransitions()

    /*
     * Biometrics validation prompt transitions the AppStatus into 'inactive' state
     * Make sure from the flow point of view, that the background state isn't removed
     * until we unlock the wallet, and not only when the bio is prompted
     */
    const unlockFromBackground = useCallback(() => {
        unlockApp()
        setIsBackgroundTransition(false)
    }, [unlockApp])

    useEffect(() => {
        if (backgroundToActive) {
            setIsBackgroundTransition(true)
        }
    }, [backgroundToActive])

    useEffect(() => {
        if (activeToBackground) {
            lockApp()
        }
    }, [activeToBackground, lockApp])

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
    }, [
        appLockStatus,
        walletSecurity,
        isSecurityDowngrade,
        isBackgroundTransition,
        closedToActive,
    ])

    if (
        isBackgroundTransition &&
        appLockStatus !== AppLockStatus.NO_LOCK &&
        !isSecurityDowngrade &&
        LockScreenUtils.isBiometricLockFlow(appLockStatus, walletSecurity)
    ) {
        return <BiometricsPlaceholder onSuccess={unlockFromBackground} />
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
