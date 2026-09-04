import { useCallback } from "react"
import { useFeatureFlags } from "~Components/Providers/FeatureFlagsProvider"
import { Feedback } from "~Components/Providers/FeedbackProvider/Events"
import { FeedbackSeverity, FeedbackType } from "~Components/Providers/FeedbackProvider/Model"
import { useI18nContext } from "~i18n"

/**
 * Single guard for every "Continue with Apple" surface during the Apple developer org migration.
 *
 * While `appleMigrationFeature.loginDisabled` is enabled the buttons stay VISIBLE (Apple review
 * requirement) but pressing them must show a maintenance message instead of starting OAuth.
 */
export const useAppleLoginAvailability = () => {
    const featureFlags = useFeatureFlags()
    const { LL } = useI18nContext()

    const isAppleLoginDisabled = Boolean(featureFlags?.appleMigrationFeature?.loginDisabled?.enabled)

    const showMaintenanceMessage = useCallback(() => {
        Feedback.show({
            severity: FeedbackSeverity.WARNING,
            type: FeedbackType.ALERT,
            message: LL.APPLE_MIGRATION_MAINTENANCE_MSG(),
            icon: "icon-alert-triangle",
        })
    }, [LL])

    return { isAppleLoginDisabled, showMaintenanceMessage }
}
