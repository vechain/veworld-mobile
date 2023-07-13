import React, { memo, useMemo } from "react"
import { BaseSpacer } from "~Components"
import { useI18nContext } from "~i18n"
import { ConnectedAppTxActivity } from "~Model"
import { ActivityDetail } from "../../Type"
import { ActivityDetailItem } from "../ActivityDetailItem"
import { Linking } from "react-native"
import { wcMethodsToRequestTranslations } from "./Helpers"

type Props = {
    activity: ConnectedAppTxActivity
}

export const ConnectedAppDetails: React.FC<Props> = memo(({ activity }) => {
    const { LL } = useI18nContext()

    const connectionRequests = useMemo(() => {
        return wcMethodsToRequestTranslations(activity.methods ?? [], LL)
    }, [LL, activity.methods])

    // Details List
    const details: Array<ActivityDetail> = [
        {
            id: 1,
            title: LL.COMMON_LBL_NAME(),
            value: activity.name ?? "",
            typographyFont: "subSubTitleLight",
            underline: false,
        },
        {
            id: 2,
            title: LL.ORIGIN(),
            value: activity.linkUrl ?? "",
            typographyFont: "subSubTitleLight",
            underline: true,
            onValuePress: async () =>
                await Linking.openURL(activity.linkUrl ?? ""),
        },
        {
            id: 3,
            title: LL.SB_DESCRIPTION(),
            value: activity.description ?? "",
            typographyFont: "subSubTitleLight",
            underline: false,
        },
        {
            id: 4,
            title: LL.CONNECTED_APP_CONNECTION_REQUESTS(),
            value: connectionRequests,
            typographyFont: "subSubTitleLight",
            underline: false,
        },
    ]

    return (
        <>
            {details.map(
                (detail: ActivityDetail, index: number) =>
                    detail.value && (
                        <ActivityDetailItem
                            key={detail.id}
                            activityDetail={detail}
                            border={index !== details.length - 1}
                        />
                    ),
            )}

            <BaseSpacer height={16} />
        </>
    )
})
