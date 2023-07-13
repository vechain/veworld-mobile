import React, { memo } from "react"
import { useI18nContext } from "~i18n"
import { SignCertActivity } from "~Model"
import { ActivityDetail } from "../Type"
import { ActivityDetailItem } from "./ActivityDetailItem"
import { Linking } from "react-native"

type Props = {
    activity: SignCertActivity
}

export const SignCertificateDetails: React.FC<Props> = memo(({ activity }) => {
    const { LL } = useI18nContext()

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
            value: `${activity.linkUrl}`,
            typographyFont: "subSubTitleLight",
            underline: true,
            onValuePress: async () =>
                await Linking.openURL(activity.linkUrl ?? ""),
        },
        {
            id: 3,
            title: LL.CONNECTED_APP_SELECTED_PURPOSE_LABEL(),
            value: `${activity.purpose ?? ""}`.toUpperCase(),
            typographyFont: "subSubTitle",
            underline: false,
        },
        {
            id: 4,
            title: LL.CONTENT(),
            value: `${activity.content || ""}`,
            typographyFont: "subSubTitle",
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
        </>
    )
})
