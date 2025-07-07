import React, { memo, useMemo } from "react"
import { VTHO, genesisesId } from "~Constants"
import { useCopyClipboard } from "~Hooks"
import { StargateActivity } from "~Model"
import { AddressUtils } from "~Utils"
import { useI18nContext } from "~i18n"
import { useGasFee } from "../Hooks"
import { ActivityDetail } from "../Type"
import { ActivityDetailItem } from "./ActivityDetailItem"
import { getActivityTitle } from "../util"

type Props = {
    activity: StargateActivity
    paid: string | undefined
    isLoading?: boolean
}

export const StargateActivityDetails: React.FC<Props> = memo(({ activity, paid, isLoading = false }) => {
    const { LL } = useI18nContext()

    const { onCopyToClipboard } = useCopyClipboard()

    const { vthoGasFee, fiatValueGasFeeSpent } = useGasFee(paid)

    const transactionIDshort = useMemo(() => {
        return AddressUtils.humanAddress(activity.txId ?? "", 7, 9)
    }, [activity.txId])

    const blockNumber = useMemo(() => {
        return activity.blockNumber
    }, [activity.blockNumber])

    const network = useMemo(() => {
        return activity.genesisId === genesisesId.main ? LL.NETWORK_LABEL_MAINNET() : LL.NETWORK_LABEL_TESTNET()
    }, [LL, activity.genesisId])

    // Details List
    const details: Array<ActivityDetail> = useMemo(
        () => [
            {
                id: 1,
                title: LL.ACTIVITY_EVENT_NAME(),
                value: getActivityTitle(activity, LL) ?? "",
                typographyFont: "subSubTitle",
                underline: false,
                valueAdditional: "",
                isLoading: isLoading,
            },
            {
                id: 2,
                title: LL.GAS_FEE(),
                value: vthoGasFee ? `${vthoGasFee} ${VTHO.symbol}` : "",
                typographyFont: "subSubTitle",
                underline: false,
                valueAdditional: fiatValueGasFeeSpent ?? "",
                isLoading: isLoading,
            },
            {
                id: 3,
                title: LL.TRANSACTION_ID(),
                value: `${transactionIDshort}`,
                typographyFont: "subSubTitle",
                underline: true,
                icon: activity.txId ? "icon-copy" : undefined,
                onValuePress: () => {
                    if (activity.txId) onCopyToClipboard(activity.txId, LL.TRANSACTION_ID())
                },
            },
            {
                id: 4,
                title: LL.BLOCK_NUMBER(),
                value: blockNumber ? `${blockNumber}` : "",
                typographyFont: "subSubTitle",
                underline: false,
            },
            {
                id: 5,
                title: LL.TITLE_NETWORK(),
                value: network.toUpperCase(),
                typographyFont: "subSubTitle",
                underline: false,
            },
        ],
        [
            LL,
            activity,
            isLoading,
            vthoGasFee,
            fiatValueGasFeeSpent,
            transactionIDshort,
            blockNumber,
            network,
            onCopyToClipboard,
        ],
    )

    return (
        <>
            {details.map((detail: ActivityDetail, index: number) => (
                <ActivityDetailItem key={detail.id} activityDetail={detail} border={index !== details.length - 1} />
            ))}
        </>
    )
})
