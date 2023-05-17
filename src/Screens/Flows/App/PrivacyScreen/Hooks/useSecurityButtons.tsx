import { useCallback, useMemo } from "react"
import { useBiometricsValidation, useWalletSecurity } from "~Common"
import { BaseButtonGroupHorizontalType, SecurityLevelType } from "~Model"

export const useSecurityButtons = (handleOnSecurityUpgrade: () => void) => {
    const { isWalletSecurityBiometrics } = useWalletSecurity()
    const { authenticateBiometrics } = useBiometricsValidation()

    const securityButtons = useMemo(() => {
        return {
            buttons: [
                {
                    id: SecurityLevelType.BIOMETRICS,
                    label: "Face ID",
                    icon: "face-recognition",
                    disabled: false,
                },
                {
                    id: SecurityLevelType.PASSWORD,
                    label: "Pin",
                    icon: "dialpad",
                    disabled: isWalletSecurityBiometrics, // disable if wallet is already secured with biometrics
                },
            ],

            currentSecurity: isWalletSecurityBiometrics
                ? SecurityLevelType.BIOMETRICS
                : SecurityLevelType.PASSWORD,
        }
    }, [isWalletSecurityBiometrics])

    const shouldCallRequireBiometricsAndEnableIt = useCallback(
        (button: BaseButtonGroupHorizontalType) => {
            if (
                button.id === SecurityLevelType.BIOMETRICS &&
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
