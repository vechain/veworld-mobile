import React, { useEffect, useMemo } from "react"
import { useAppLock, useWalletSecurity } from "~Hooks"
import { LockScreenUtils } from "~Utils"
import RNBootSplash from "react-native-bootsplash"
import { LockScreen } from "~Screens"
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
