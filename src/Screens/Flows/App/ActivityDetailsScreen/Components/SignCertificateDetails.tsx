import React, { memo, useMemo } from "react"
import { useCopyClipboard } from "~Hooks"
import { FormattingUtils } from "~Utils"
import { selectSelectedNetwork, useAppSelector } from "~Storage/Redux"
import { useI18nContext } from "~i18n"
import { SignCertActivity } from "~Model"
import { ActivityDetail } from "../Type"
import { ActivityDetailItem } from "./ActivityDetailItem"

type Props = {
    activity: SignCertActivity
}

export const SignCertificateDetails: React.FC<Props> = memo(({ activity }) => {
    const { LL } = useI18nContext()

    const network = useAppSelector(selectSelectedNetwork)

    const transactionIDshort = useMemo(() => {
        return FormattingUtils.humanAddress(activity.id, 7, 9)
    }, [activity.id])

    const { onCopyToClipboard } = useCopyClipboard()

    // Details List
    const details: Array<ActivityDetail> = [
        {
            id: 1,
            title: LL.ORIGIN(),
            value: `${activity.linkUrl}`,
            typographyFont: "subSubTitleLight",
            underline: true,
            //TODO onValuePress opens browser or in-app browser
        },
        {
            id: 2,
            title: LL.TRANSACTION_ID(),
            value: `${transactionIDshort}`,
            typographyFont: "subSubTitle",
            underline: false,
            icon: "content-copy",
            onValuePress: () =>
                onCopyToClipboard(activity.id, LL.COMMON_LBL_ADDRESS()),
        },
        {
            id: 3,
            title: LL.CONTENT(),
            value: `${activity.certMessage?.purpose || ""}`,
            typographyFont: "subSubTitle",
            underline: false,
        },
        {
            id: 4,
            title: LL.CONTENT(),
            value: `${activity.certMessage?.payload.content || ""}`,
            typographyFont: "subSubTitle",
            underline: false,
        },
        {
            id: 5,
            title: LL.TITLE_NETWORK(),
            value: network.name.toUpperCase(),
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
