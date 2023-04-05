import { useCallback, useMemo } from "react"
import { useBiometricsValidation, useWalletSecurity } from "~Common"
import {
    BaseButtonGroupHorizontalType,
    UserSelectedSecurityLevel,
} from "~Model"

export const useSecurityButtons = (handleOnSecurityUpgrade: () => void) => {
    const { isWalletSecurityBiometrics } = useWalletSecurity()
    const { authenticateBiometrics } = useBiometricsValidation()

    const securityButtons = useMemo(() => {
        return {
            buttons: [
                {
                    id: UserSelectedSecurityLevel.BIOMETRIC,
                    label: "Face ID",
                    icon: "face-recognition",
                    disabled: false,
                },
                {
                    id: UserSelectedSecurityLevel.PASSWORD,
                    label: "Pin",
                    icon: "dialpad",
                    disabled: isWalletSecurityBiometrics, // disable if wallet is already secured with biometrics
                },
            ],

            currentSecurity: isWalletSecurityBiometrics
                ? UserSelectedSecurityLevel.BIOMETRIC
                : UserSelectedSecurityLevel.PASSWORD,
        }
    }, [isWalletSecurityBiometrics])

    const shouldCallRequireBiometricsAndEnableIt = useCallback(
        (button: BaseButtonGroupHorizontalType) => {
            if (
                button.id === UserSelectedSecurityLevel.BIOMETRIC &&
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
