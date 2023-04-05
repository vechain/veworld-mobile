import { useEffect, useMemo } from "react"
import { LockScreenUtils, useAppLock, useWalletSecurity } from "~Common"
import RNBootSplash from "react-native-bootsplash"
import { LockScreen } from "~Screens"
import React from "react"
import { LOCKSCREEN_SCENARIO } from "~Screens/LockScreen/Enums"

export const usePasswordUnlock = () => {
    const { unlockApp, appLockStatusActive, appLockStatusInactive } =
        useAppLock()
    const { isWalletSecurityPassword } = useWalletSecurity()

    useEffect(() => {
        const initPasswordUnlock = async () => {
            if (
                LockScreenUtils.isHideSplash(
                    appLockStatusInactive,
                    isWalletSecurityPassword,
                )
            )
                await RNBootSplash.hide({ fade: true })
        }
        initPasswordUnlock()
    }, [appLockStatusActive, isWalletSecurityPassword, appLockStatusInactive])

    const showLockScreen = useMemo(() => {
        if (
            LockScreenUtils.isLockScreenFlow(
                appLockStatusActive,
                isWalletSecurityPassword,
            )
        ) {
            return (
                <LockScreen
                    onSuccess={unlockApp}
                    scenario={LOCKSCREEN_SCENARIO.UNLOCK_WALLET}
                />
            )
        }
    }, [appLockStatusActive, isWalletSecurityPassword, unlockApp])

    return { showLockScreen }
}
