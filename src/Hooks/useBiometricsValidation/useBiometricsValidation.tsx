import { useCallback } from "react"
import { Linking } from "react-native"
import { AnalyticsEvent } from "~Constants"
import { useAnalyticTracking } from "~Hooks/useAnalyticTracking"
import { AlertUtils, BiometricsUtils } from "~Utils"
import { useI18nContext } from "~i18n"

/**
 * it validates biometrics response and shows alert if needed
 */
export const useBiometricsValidation = () => {
    const { LL } = useI18nContext()
    const track = useAnalyticTracking()

    const authenticateBiometrics = useCallback(
        async (onSuccess: () => void) => {
            let result = await BiometricsUtils.authenticateWithBiometrics()
            // user_cancel
            // not_available
            // not_enrolled
            // user_cancel
            // system_cancel

            if (result.success) {
                track(AnalyticsEvent.APP_BIOMETRICS_UNLOCKED)
                onSuccess()
            } else {
                if (result.error === "not_enrolled") {
                    AlertUtils.showDefaultAlert(
                        LL.ALERT_TITLE_NOT_ENROLLED(),
                        LL.ALERT_MSG_NOT_ENROLLED(),
                        LL.COMMON_BTN_OK(),
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
        [LL, track],
    )

    return { authenticateBiometrics }
}
