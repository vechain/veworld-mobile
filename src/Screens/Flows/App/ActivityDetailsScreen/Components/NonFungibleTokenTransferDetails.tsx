import React, { memo, useMemo } from "react"
import { VTHO, currencySymbolMap, genesisesId } from "~Constants"
import { useCopyClipboard } from "~Hooks"
import { FormattingUtils } from "~Utils"
import { NonFungibleTokenActivity } from "~Model"
import { selectCurrency, useAppSelector } from "~Storage/Redux"
import { useI18nContext } from "~i18n"
import { ActivityDetail } from "../Type"
import { useGasFee } from "../Hooks"
import { ActivityDetailItem } from "./ActivityDetailItem"

type Props = {
    activity: NonFungibleTokenActivity
}

export const NonFungibleTokenTransferDetails: React.FC<Props> = memo(
    ({ activity }) => {
        const { LL } = useI18nContext()

        const currency = useAppSelector(selectCurrency)

        const { onCopyToClipboard } = useCopyClipboard()

        const { gasFeeInVTHOHumanReadable, fiatValueGasFeeSpent } =
            useGasFee(activity)

        const transactionIDshort = useMemo(() => {
            return FormattingUtils.humanAddress(activity.id, 7, 9)
        }, [activity.id])

        const blockNumber = useMemo(() => {
            return activity.blockNumber
        }, [activity.blockNumber])

        const network = useMemo(() => {
            return activity.genesisId === genesisesId.main
                ? LL.NETWORK_LABEL_MAINNET()
                : LL.NETWORK_LABEL_TESTNET()
        }, [LL, activity.genesisId])

        // Details List
        const details: Array<ActivityDetail> = [
            {
                id: 1,
                title: LL.GAS_FEE(),
                value: gasFeeInVTHOHumanReadable
                    ? `${gasFeeInVTHOHumanReadable} ${VTHO.symbol}`
                    : "",
                typographyFont: "subSubTitle",
                underline: false,
                valueAdditional: fiatValueGasFeeSpent
                    ? `≈ ${fiatValueGasFeeSpent} ${currencySymbolMap[currency]}`
                    : "",
            },
            {
                id: 3,
                title: LL.TRANSACTION_ID(),
                value: `${transactionIDshort}`,
                typographyFont: "subSubTitle",
                underline: true,
                icon: "content-copy",
                onValuePress: () =>
                    onCopyToClipboard(activity.id, LL.COMMON_LBL_ADDRESS()),
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
        ]

        return (
            <>
                {details.map((detail: ActivityDetail, index: number) => (
                    <ActivityDetailItem
                        key={detail.id}
                        activityDetail={detail}
                        border={index !== details.length - 1}
                    />
                ))}
            </>
        )
    },
)
