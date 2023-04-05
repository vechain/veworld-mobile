import { useCallback } from "react"
import { Linking } from "react-native"
import { AlertUtils, BiometricsUtils } from "~Common/Utils"
import { useI18nContext } from "~i18n"

export const useBiometricsValidation = () => {
    const { LL } = useI18nContext()

    const authenticateBiometrics = useCallback(
        async (onSuccess: () => void) => {
            let result = await BiometricsUtils.authenticateWithBiometric()
            // user_cancel
            // not_available
            // not_enrolled
            // user_cancel
            // system_cancel

            if (result.success) {
                onSuccess()
            } else {
                if (result.error === "not_enrolled") {
                    AlertUtils.showDefaultAlert(
                        LL.ALERT_TITLE_NOT_ENROLLED(),
                        LL.ALERT_MSG_NOT_ENROLLED(),
                        LL.COMMON_BTN_OK(),
                        () => {
                            return
                        },
                    )
                }

                if (result.error === "not_available") {
                    AlertUtils.showGoToSettingsAlert(
                        LL.ALERT_TITLE_BIO_PREVIOUSLY_DENIED(),
                        LL.ALERT_MSG_BIO_PREVIOUSLY_DENIED(),
                        () => {
                            return
                        },
                        () => {
                            Linking.openSettings()
                        },
                    )
                }
            }
        },
        [LL],
    )

    return { authenticateBiometrics }
}
