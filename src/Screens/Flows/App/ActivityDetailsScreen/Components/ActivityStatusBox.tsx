import React, { memo } from "react"
import { COLORS } from "~Common/Theme"
import { BaseText, BaseView } from "~Components"
import { ActivityStatus } from "~Model"
import { useI18nContext } from "~i18n"

type Props = {
    status: ActivityStatus
}

export const ActivityStatusBox: React.FC<Props> = memo(({ status }) => {
    const { LL } = useI18nContext()

    const statusTitle =
        status === ActivityStatus.PENDING
            ? LL.ACTIVITIES_STATUS_pending()
            : LL.ACTIVITIES_STATUS_failed()

    const statusDescription =
        status === ActivityStatus.PENDING
            ? LL.ACTIVITIES_PENDING_DESCRIPTION()
            : LL.ACTIVITIES_FAILED_DESCRIPTION()

    const statusBgColor =
        status === ActivityStatus.PENDING
            ? COLORS.PASTEL_ORANGE
            : COLORS.PASTEL_RED

    const statusTitleBgColor =
        status === ActivityStatus.PENDING
            ? COLORS.MEDIUM_ORANGE
            : COLORS.MEDIUM_RED

    return (
        <BaseView bg={statusBgColor} borderRadius={12}>
            <BaseView mx={16} my={12}>
                <BaseView flexDirection="row">
                    <BaseView bg={statusTitleBgColor} borderRadius={6}>
                        <BaseText
                            py={3}
                            px={6}
                            typographyFont="captionMedium"
                            color={COLORS.WHITE}>
                            {statusTitle}
                        </BaseText>
                    </BaseView>
                </BaseView>
                <BaseText
                    typographyFont="buttonSecondary"
                    pt={8}
                    color={COLORS.DARK_PURPLE}>
                    {statusDescription}
                </BaseText>
            </BaseView>
        </BaseView>
    )
})
