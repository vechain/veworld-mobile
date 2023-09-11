import { useCallback, useEffect, useMemo, useState } from "react"
import { useAppLock, useWalletSecurity } from "~Hooks"
import { LockScreenUtils } from "~Utils"
import RNBootSplash from "react-native-bootsplash"
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
            updatePinCode(password)
            unlockApp()
        },
        [updatePinCode, unlockApp],
    )

    const showLockScreen = useMemo(() => {
        return false
    }, [onUserPinSuccess, appLockStatusActive, isWalletSecurityPassword])

    return { showLockScreen, isSplashHidden }
}
