import React from "react"
import { useTheme } from "~Common"
import { BaseText, BaseView } from "~Components"
import { ActivityStatus } from "~Model"
import { useI18nContext } from "~i18n"

type Props = {
    activityStatus: ActivityStatus
}

export const ActivityStatusIndicator = ({ activityStatus }: Props) => {
    const { LL } = useI18nContext()

    const theme = useTheme()

    const statusBgColor =
        activityStatus === ActivityStatus.PENDING
            ? theme.colors.alertOrangeMedium
            : theme.colors.alertRedMedium

    const statusTitle =
        activityStatus === ActivityStatus.PENDING
            ? LL.ACTIVITIES_STATUS_pending()
            : LL.ACTIVITIES_STATUS_failed()

    return (
        <BaseView mb={5}>
            <BaseView
                bg={statusBgColor}
                ml={8}
                alignItems="center"
                borderRadius={6}>
                <BaseText
                    py={3}
                    px={6}
                    typographyFont="captionMedium"
                    color={theme.colors.textReversed}>
                    {statusTitle}
                </BaseText>
            </BaseView>
        </BaseView>
    )
}
