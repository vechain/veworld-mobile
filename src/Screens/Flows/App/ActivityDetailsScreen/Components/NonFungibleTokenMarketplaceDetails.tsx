import React, { memo, useMemo } from "react"
import { DIRECTIONS, VTHO, genesisesId } from "~Constants"
import { useCopyClipboard, useFormatFiat } from "~Hooks"
import { NFTMarketplaceActivity } from "~Model"
import { selectSelectedAccount, useAppSelector } from "~Storage/Redux"
import { AddressUtils, BigNutils } from "~Utils"
import { useI18nContext } from "~i18n"
import { useGasFee } from "../Hooks"
import { ActivityDetail } from "../Type"
import { ActivityDetailItem } from "./ActivityDetailItem"

type Props = {
    activity: NFTMarketplaceActivity
    paid: string | undefined
    isLoading?: boolean
}

export const NonFungibleTokenMarketplaceDetails: React.FC<Props> = memo(({ activity, paid, isLoading = false }) => {
    const { LL } = useI18nContext()
    const { formatLocale } = useFormatFiat()

    const { onCopyToClipboard } = useCopyClipboard()

    const { vthoGasFee, fiatValueGasFeeSpent } = useGasFee(paid)

    const selectedAccount = useAppSelector(selectSelectedAccount)
    const isBuyer = AddressUtils.compareAddresses(activity.buyer, selectedAccount.address)

    const transactionIDshort = useMemo(() => {
        return AddressUtils.humanAddress(activity.txId ?? "", 7, 9)
    }, [activity.txId])

    const blockNumber = useMemo(() => {
        return activity.blockNumber
    }, [activity.blockNumber])

    const network = useMemo(() => {
        return activity.genesisId === genesisesId.main ? LL.NETWORK_LABEL_MAINNET() : LL.NETWORK_LABEL_TESTNET()
    }, [LL, activity.genesisId])

    const formattedPrice = useMemo(() => {
        return BigNutils(activity.price).toHuman(18).toTokenFormat_string(2, formatLocale)
    }, [activity.price, formatLocale])

    const transactionType = useMemo(() => {
        return isBuyer ? LL.NFT_PURCHASED() : LL.NFT_SOLD()
    }, [isBuyer, LL])

    const priceDirection = useMemo(() => {
        return isBuyer ? DIRECTIONS.DOWN : DIRECTIONS.UP
    }, [isBuyer])

    // Details List
    const details: Array<ActivityDetail> = [
        {
            id: 1,
            title: LL.TYPE(),
            value: transactionType,
            typographyFont: "subSubTitle",
            underline: false,
        },
        {
            id: 2,
            title: LL.COMMON_PRICE(),
            value: `${priceDirection} ${formattedPrice}`,
            typographyFont: "subSubTitle",
            underline: false,
            valueAdditional: activity.paymentToken || "VET",
        },
        {
            id: 3,
            title: LL.GAS_FEE(),
            value: vthoGasFee ? `${vthoGasFee} ${VTHO.symbol}` : "",
            typographyFont: "subSubTitle",
            underline: false,
            valueAdditional: fiatValueGasFeeSpent ?? "",
            isLoading: isLoading,
        },
        {
            id: 4,
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
            id: 5,
            title: LL.BLOCK_NUMBER(),
            value: blockNumber ? `${blockNumber}` : "",
            typographyFont: "subSubTitle",
            underline: false,
        },
        {
            id: 6,
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
                    testID={`nft-marketplace-detail-${detail.id}`}
                />
            ))}
        </>
    )
})
