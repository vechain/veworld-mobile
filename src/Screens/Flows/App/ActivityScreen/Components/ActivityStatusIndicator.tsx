import React from "react"
import { useTheme } from "~Hooks"
import { BaseText, BaseView } from "~Components"
import { ActivityStatus } from "~Model"
import { useI18nContext } from "~i18n"
import { COLORS } from "~Constants"

type Props = {
    activityStatus: ActivityStatus
}

export const ActivityStatusIndicator = ({ activityStatus }: Props) => {
    const { LL } = useI18nContext()

    const theme = useTheme()

    const statusBgColor = activityStatus === ActivityStatus.PENDING ? theme.colors.testnetBackground : COLORS.RED_100

    const statusTextColor = activityStatus === ActivityStatus.PENDING ? theme.colors.textReversed : COLORS.RED_700

    const statusTitle =
        activityStatus === ActivityStatus.PENDING ? LL.ACTIVITIES_STATUS_pending() : LL.ACTIVITIES_STATUS_failed()

    return (
        <BaseView bg={statusBgColor} ml={8} alignItems="center" borderRadius={6}>
            <BaseText py={2} px={4} typographyFont="captionMedium" color={statusTextColor} numberOfLines={1}>
                {statusTitle}
            </BaseText>
        </BaseView>
    )
}
