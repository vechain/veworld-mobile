import { useCallback, useEffect } from "react"
import { useAppLock, useAppReset, useWalletSecurity } from "~Hooks"
import { AlertUtils, BiometricsUtils, LockScreenUtils } from "~Utils"
import RNBootSplash from "react-native-bootsplash"
import { selectIsSecurityDowngrade, useAppSelector } from "~Storage/Redux"

export const useBiometricUnlock = () => {
    const { appLockStatusActive } = useAppLock()
    const { isWalletSecurityBiometrics } = useWalletSecurity()
    const appReset = useAppReset()
    const isSecurityDowngrade = useAppSelector(selectIsSecurityDowngrade)

    const recursiveFaceId = useCallback(async () => {
        let results = await BiometricsUtils.authenticateWithBiometrics()
        if (results.success) {
            await RNBootSplash.hide({ fade: true })
        } else if (results.error) {
            AlertUtils.showCancelledFaceIdAlert(
                async () => {
                    await appReset()
                },
                async () => {
                    return await recursiveFaceId()
                },
            )
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
    }, [
        appLockStatusActive,
        isSecurityDowngrade,
        isWalletSecurityBiometrics,
        recursiveFaceId,
    ])
}
