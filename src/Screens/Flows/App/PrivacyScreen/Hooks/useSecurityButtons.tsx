import { useCallback, useMemo } from "react"
import { useBiometricsValidation, useWalletSecurity } from "~Hooks"
import { BaseButtonGroupHorizontalType, SecurityLevelType } from "~Model"

export const useSecurityButtons = (handleOnSecurityUpgrade: () => void) => {
    const { isWalletSecurityBiometrics } = useWalletSecurity()
    const { authenticateBiometrics } = useBiometricsValidation()

    const securityButtons = useMemo(() => {
        return {
            buttons: [
                {
                    id: SecurityLevelType.BIOMETRIC,
                    label: "Face ID",
                    icon: "face-recognition",
                    disabled: false,
                },
                {
                    id: SecurityLevelType.SECRET,
                    label: "Pin",
                    icon: "dialpad",
                    disabled: isWalletSecurityBiometrics, // disable if wallet is already secured with biometrics
                },
            ],

            currentSecurity: isWalletSecurityBiometrics
                ? SecurityLevelType.BIOMETRIC
                : SecurityLevelType.SECRET,
        }
    }, [isWalletSecurityBiometrics])

    const shouldCallRequireBiometricsAndEnableIt = useCallback(
        (button: BaseButtonGroupHorizontalType) => {
            if (
                button.id === SecurityLevelType.BIOMETRIC &&
                !isWalletSecurityBiometrics
            )
                authenticateBiometrics(handleOnSecurityUpgrade)
        },
        [
            authenticateBiometrics,
            isWalletSecurityBiometrics,
            handleOnSecurityUpgrade,
        ],
    )

    return { securityButtons, shouldCallRequireBiometricsAndEnableIt }
}
