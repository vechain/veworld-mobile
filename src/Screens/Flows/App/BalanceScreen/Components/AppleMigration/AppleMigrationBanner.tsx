import moment from "moment"
import React, { useMemo } from "react"
import { StyleSheet } from "react-native"
import { BaseIcon, BaseSpacer, BaseText, BaseTouchable, BaseView } from "~Components"
import { useFeatureFlags } from "~Components/Providers/FeatureFlagsProvider"
import { ColorThemeType } from "~Constants"
import { useThemedStyles } from "~Hooks"
import { useI18nContext } from "~i18n"
import { DateUtils } from "~Utils"

type Props = {
    onClose: () => void
}

/**
 * Parses a date coming from the remote feature flag payload.
 * Only full ISO dates are accepted: anything else (including a bare year, which the feature flag
 * parser converts to a boolean) falls back to the generic, date-less wording.
 */
const parseFlagDate = (value?: string) => {
    if (typeof value !== "string" || !value) return undefined
    const parsed = moment(value, moment.ISO_8601, true)
    return parsed.isValid() ? parsed : undefined
}

export const AppleMigrationBanner = ({ onClose }: Props) => {
    const { styles, theme } = useThemedStyles(baseStyles)
    const { LL, locale } = useI18nContext()
    const featureFlags = useFeatureFlags()

    const momentLocale = useMemo(() => DateUtils.getMomentLocale(locale), [locale])

    const banner = featureFlags?.appleMigrationFeature?.banner

    const description = useMemo(() => {
        const startDate = parseFlagDate(banner?.startDate)
        const endDate = parseFlagDate(banner?.endDate)

        if (!startDate || !endDate) return LL.APPLE_MIGRATION_BANNER_DESC()

        return LL.APPLE_MIGRATION_BANNER_DESC_WITH_DATES({
            startDate: DateUtils.formatDate(startDate, momentLocale, { includeYear: true }),
            endDate: DateUtils.formatDate(endDate, momentLocale, { includeYear: true }),
        })
    }, [LL, banner?.endDate, banner?.startDate, momentLocale])

    return (
        <BaseView style={styles.container} testID="APPLE_MIGRATION_BANNER">
            <BaseTouchable
                style={styles.closeIcon}
                action={onClose}
                haptics="Light"
                testID="APPLE_MIGRATION_BANNER_CLOSE_BUTTON">
                <BaseIcon name="icon-x" size={16} color={theme.colors.warningVariant.icon} />
            </BaseTouchable>

            <BaseView style={styles.head}>
                <BaseIcon name="icon-alert-triangle" size={16} color={theme.colors.warningVariant.icon} />
                <BaseSpacer width={8} />
                <BaseText typographyFont="bodyMedium" color={theme.colors.warningVariant.title}>
                    {LL.APPLE_MIGRATION_BANNER_TITLE()}
                </BaseText>
            </BaseView>
            <BaseSpacer height={4} />
            <BaseText
                typographyFont="captionRegular"
                color={theme.colors.alertDescription}
                style={styles.textContainer}>
                {description}
            </BaseText>
        </BaseView>
    )
}

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        container: {
            flexDirection: "column",
            backgroundColor: theme.colors.warningVariant.background,
            borderColor: theme.colors.warningVariant.border,
            borderRadius: 8,
            borderWidth: 1,
            marginHorizontal: 24,
            paddingHorizontal: 16,
            paddingVertical: 12,
            position: "relative",
        },
        head: {
            flexDirection: "row",
            alignItems: "flex-start",
            paddingRight: 24,
        },
        textContainer: {
            paddingLeft: 24,
        },
        closeIcon: {
            position: "absolute",
            padding: 8,
            right: 4,
            top: 4,
            zIndex: 1,
        },
    })
