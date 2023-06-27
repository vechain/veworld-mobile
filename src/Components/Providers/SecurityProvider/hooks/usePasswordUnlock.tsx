import React, { useEffect, useMemo, useState } from "react"
import { useAppLock, useWalletSecurity } from "~Hooks"
import { LockScreenUtils } from "~Utils"
import RNBootSplash from "react-native-bootsplash"
import { LockScreen } from "~Screens"
import { LOCKSCREEN_SCENARIO } from "~Screens/LockScreen/Enums"

export const usePasswordUnlock = () => {
    const { unlockApp, appLockStatusActive, appLockStatusInactive } =
        useAppLock()
    const { isWalletSecurityPassword } = useWalletSecurity()

    const [isSplashHidden, setIsSplashHidden] = useState(false)

    useEffect(() => {
        const initPasswordUnlock = async () => {
            if (
                LockScreenUtils.isHideSplash(
                    appLockStatusInactive,
                    isWalletSecurityPassword,
                )
            ) {
                await RNBootSplash.hide({ fade: true, duration: 500 })
                setIsSplashHidden(true)
            }
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

    return { showLockScreen, isSplashHidden }
}
