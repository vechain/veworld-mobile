import { useCallback, useMemo } from "react"
import { useBiometrics, useBiometricsValidation, useWalletSecurity } from "~Hooks"
import { BaseButtonGroupHorizontalType, SecurityLevelType } from "~Model"
import { useI18nContext } from "~i18n"
import { debug, PlatformUtils } from "~Utils"
import { ERROR_EVENTS } from "~Constants"

export type SecurityButtons = {
    buttons: BaseButtonGroupHorizontalType[]
    currentSecurity: SecurityLevelType
}

export const useSecurityButtons = (handleOnSecurityUpgrade: () => void) => {
    const { isWalletSecurityBiometrics } = useWalletSecurity()
    const { authenticateBiometrics } = useBiometricsValidation()
    const { LL } = useI18nContext()

    const biometrics = useBiometrics()

    const securityButtons: SecurityButtons = useMemo(() => {
        const { authTypeAvailable } = biometrics || {}

        debug(ERROR_EVENTS.SECURTIY, { authTypeAvailable })

        return {
            buttons: [
                {
                    id: SecurityLevelType.BIOMETRIC,
                    label: PlatformUtils.isAndroid() ? LL.TOUCH_ID() : LL.FACE_ID(),
                    icon: PlatformUtils.isAndroid() ? "fingerprint" : "face-recognition",
                    disabled: !biometrics || biometrics.currentSecurityLevel !== SecurityLevelType.BIOMETRIC,
                },
                {
                    id: SecurityLevelType.SECRET,
                    label: LL.PIN_CODE(),
                    icon: "dialpad",
                    disabled: isWalletSecurityBiometrics, // disable if wallet is already secured with biometrics
                },
            ],

            currentSecurity: isWalletSecurityBiometrics ? SecurityLevelType.BIOMETRIC : SecurityLevelType.SECRET,
        }
    }, [LL, biometrics, isWalletSecurityBiometrics])

    const shouldCallRequireBiometricsAndEnableIt = useCallback(
        (button: BaseButtonGroupHorizontalType) => {
            if (button.id === SecurityLevelType.BIOMETRIC && !isWalletSecurityBiometrics)
                authenticateBiometrics(handleOnSecurityUpgrade)
        },
        [authenticateBiometrics, isWalletSecurityBiometrics, handleOnSecurityUpgrade],
    )

    return { securityButtons, shouldCallRequireBiometricsAndEnableIt }
}
