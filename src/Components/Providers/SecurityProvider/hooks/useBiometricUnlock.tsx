import { useCallback, useEffect, useState } from "react"
import { useAppLock, useAppReset, useWalletSecurity } from "~Hooks"
import { AlertUtils, BiometricsUtils, LockScreenUtils, debug } from "~Utils"
import RNBootSplash from "react-native-bootsplash"
import { selectIsSecurityDowngrade, useAppSelector } from "~Storage/Redux"

export const useBiometricUnlock = () => {
    const { appLockStatusActive } = useAppLock()
    const { isWalletSecurityBiometrics } = useWalletSecurity()
    const appReset = useAppReset()
    const isSecurityDowngrade = useAppSelector(selectIsSecurityDowngrade)

    const [isBiometricsSucceeded, setIsBiometricsSucceeded] = useState(false)

    const recursiveFaceId = useCallback(async () => {
        let results = await BiometricsUtils.authenticateWithBiometrics()

        if (results.success) {
            await RNBootSplash.hide({ fade: true })
            setIsBiometricsSucceeded(true)
        } else if (results.error === "user_cancel") {
            AlertUtils.showCancelledFaceIdAlert(
                async () => {
                    await appReset()
                },
                async () => {
                    return await recursiveFaceId()
                },
            )
        } else {
            debug("BiometricUnlock", "Error", results.error)
            return
        }
    }, [appReset])

    useEffect(() => {
        const initBiometricUnlock = async () => {
            if (isSecurityDowngrade) {
                await RNBootSplash.hide({ fade: true, duration: 500 })
                return
            }

            if (
                LockScreenUtils.isBiometricLockFlow(
                    appLockStatusActive,
                    isWalletSecurityBiometrics,
                )
            ) {
                await recursiveFaceId()
            }
        }

        initBiometricUnlock()

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [appLockStatusActive, isSecurityDowngrade, isWalletSecurityBiometrics])

    return { isBiometricsSucceeded }
}
