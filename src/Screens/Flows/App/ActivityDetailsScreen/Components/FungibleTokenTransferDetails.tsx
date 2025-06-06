import React, { memo, useMemo } from "react"
import { useExchangeRate } from "~Api/Coingecko"
import { VTHO, genesisesId, getCoinGeckoIdBySymbol } from "~Constants"
import { useCopyClipboard, useFungibleTokenInfo } from "~Hooks"
import { FungibleToken, FungibleTokenActivity } from "~Model"
import { selectCurrency, useAppSelector } from "~Storage/Redux"
import { AddressUtils, BigNutils } from "~Utils"
import { useI18nContext } from "~i18n"
import { useGasFee } from "../Hooks"
import { ActivityDetail } from "../Type"
import { ActivityDetailContent, ActivityDetailItem } from "./ActivityDetailItem"

type Props = {
    activity: FungibleTokenActivity
    token?: FungibleToken
    paid: string | undefined
    isLoading?: boolean
}

export const FungibleTokenTransferDetails: React.FC<Props> = memo(({ activity, token, paid, isLoading = false }) => {
    const { LL } = useI18nContext()

    const network = useMemo(() => {
        return activity.genesisId === genesisesId.main ? LL.NETWORK_LABEL_MAINNET() : LL.NETWORK_LABEL_TESTNET()
    }, [LL, activity.genesisId])

    const currency = useAppSelector(selectCurrency)

    const { onCopyToClipboard } = useCopyClipboard()

    const { vthoGasFee, fiatValueGasFeeSpent } = useGasFee(paid)

    const { symbol, decimals } = useFungibleTokenInfo(activity.tokenAddress)

    const amountTransferred = useMemo(() => {
        if (!token?.decimals && !decimals) return

        return BigNutils(activity.amount)
            .toHuman(token?.decimals ?? decimals ?? 0)
            .toTokenFormat_string(2)
    }, [activity.amount, decimals, token])

    const { data: exchangeRate } = useExchangeRate({
        id: getCoinGeckoIdBySymbol[symbol ?? token?.symbol ?? ""],
        vs_currency: currency,
    })

    const fiatValueTransferred = useMemo(() => {
        if (exchangeRate && token && decimals) {
            let amount = BigNutils(activity.amount).toHuman(decimals).toString
            const { value, isLeesThan_0_01 } = BigNutils().toCurrencyConversion(amount ?? "0", exchangeRate)
            return isLeesThan_0_01 ? `< ${value}` : value
        }
    }, [activity.amount, decimals, exchangeRate, token])

    const transactionIDshort = useMemo(() => {
        return AddressUtils.humanAddress(activity.txId ?? "", 7, 9)
    }, [activity.txId])

    const blockNumber = useMemo(() => {
        return activity.blockNumber
    }, [activity.blockNumber])

    // Details List
    const details: Array<ActivityDetailContent> = useMemo(
        () => [
            {
                id: 1,
                title: LL.VALUE_TITLE(),
                value: `${amountTransferred} ${token?.symbol ?? symbol}`,
                typographyFont: "subSubTitle",
                underline: false,
                valueAdditional: fiatValueTransferred ?? "",
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
                underline: false,
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
            activity.txId,
            amountTransferred,
            blockNumber,
            fiatValueGasFeeSpent,
            fiatValueTransferred,
            isLoading,
            network,
            onCopyToClipboard,
            symbol,
            token?.symbol,
            transactionIDshort,
            vthoGasFee,
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
