import React, { memo, useMemo } from "react"
import { VTHO, currencySymbolMap, genesisesId } from "~Constants"
import { useCopyClipboard, useFungibleTokenInfo } from "~Hooks"
import { FormattingUtils } from "~Utils"
import { FungibleToken, FungibleTokenActivity } from "~Model"
import {
    selectCurrency,
    selectCurrencyExchangeRate,
    useAppSelector,
} from "~Storage/Redux"
import { RootState } from "~Storage/Redux/Types"
import { useI18nContext } from "~i18n"
import { ActivityDetail } from "../Type"
import { useGasFee } from "../Hooks"
import { ActivityDetailItem } from "./ActivityDetailItem"

type Props = {
    activity: FungibleTokenActivity
    token?: FungibleToken
}

export const FungibleTokenTransferDetails: React.FC<Props> = memo(
    ({ activity, token }) => {
        const { LL } = useI18nContext()

        const network = useMemo(() => {
            return activity.genesisId === genesisesId.main
                ? LL.NETWORK_LABEL_MAINNET()
                : LL.NETWORK_LABEL_TESTNET()
        }, [LL, activity.genesisId])

        const currency = useAppSelector(selectCurrency)

        const { onCopyToClipboard } = useCopyClipboard()

        const { gasFeeInVTHOHumanReadable, fiatValueGasFeeSpent } =
            useGasFee(activity)

        const { symbol, decimals } = useFungibleTokenInfo(activity.tokenAddress)

        const amountTransferred = useMemo(() => {
            if (!token?.decimals && !decimals) return

            return FormattingUtils.humanNumber(
                FormattingUtils.scaleNumberDown(
                    activity.amount,
                    token?.decimals ?? decimals ?? 0,
                    FormattingUtils.ROUND_DECIMAL_DEFAULT,
                ),
                activity.amount,
            )
        }, [activity.amount, decimals, token])

        const exchangeRate = useAppSelector((state: RootState) =>
            selectCurrencyExchangeRate(state, token?.symbol ?? ""),
        )

        const fiatValueTransferred = useMemo(() => {
            if (exchangeRate?.rate && token) {
                return FormattingUtils.humanNumber(
                    FormattingUtils.convertToFiatBalance(
                        activity.amount as string,
                        exchangeRate.rate,
                        token.decimals,
                    ),
                    activity.amount,
                )
            }
        }, [activity.amount, exchangeRate?.rate, token])

        const transactionIDshort = useMemo(() => {
            return FormattingUtils.humanAddress(activity.txId ?? "", 7, 9)
        }, [activity.txId])

        const blockNumber = useMemo(() => {
            return activity.blockNumber
        }, [activity.blockNumber])

        // Details List
        const details: Array<ActivityDetail> = [
            {
                id: 1,
                title: LL.VALUE_TITLE(),
                value: `${amountTransferred} ${token?.symbol ?? symbol}`,
                typographyFont: "subSubTitle",
                underline: false,
                valueAdditional: fiatValueTransferred
                    ? `≈ ${fiatValueTransferred} ${currencySymbolMap[currency]}`
                    : "",
            },
            {
                id: 2,
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
                underline: false,
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
