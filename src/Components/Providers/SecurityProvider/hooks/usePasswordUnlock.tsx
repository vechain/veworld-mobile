import React, { useCallback, useEffect, useMemo, useState } from "react"
import { useAppLock, useWalletSecurity } from "~Hooks"
import { debug, LockScreenUtils } from "~Utils"
import RNBootSplash from "react-native-bootsplash"
import { LockScreen } from "~Screens"
import { LOCKSCREEN_SCENARIO } from "~Screens/LockScreen/Enums"
import { usePinCode } from "~Components/Providers/PinCodeProvider/PinCodeProvider"

export const usePasswordUnlock = () => {
    const { unlockApp, appLockStatusActive, appLockStatusInactive } =
        useAppLock()
    const { isWalletSecurityPassword } = useWalletSecurity()
    const { updatePinCode } = usePinCode()

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

    const onUserPinSuccess = useCallback(
        (password: string) => {
            debug("onUserPinSuccess")
            updatePinCode(password)
            unlockApp()
        },
        [updatePinCode, unlockApp],
    )

    const showLockScreen = useMemo(() => {
        if (
            LockScreenUtils.isLockScreenFlow(
                appLockStatusActive,
                isWalletSecurityPassword,
            )
        ) {
            return (
                <LockScreen
                    onSuccess={onUserPinSuccess}
                    scenario={LOCKSCREEN_SCENARIO.UNLOCK_WALLET}
                    isSafeView
                />
            )
        }
    }, [onUserPinSuccess, appLockStatusActive, isWalletSecurityPassword])

    return { showLockScreen, isSplashHidden }
}
