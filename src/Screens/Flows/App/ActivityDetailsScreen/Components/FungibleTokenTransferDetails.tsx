import React, { memo, useMemo } from "react"
import { VTHO, currencySymbolMap, useCopyClipboard } from "~Common"
import { FormattingUtils } from "~Utils"
import { FungibleToken, FungibleTokenActivity } from "~Model"
import {
    selectCurrency,
    selectCurrencyExchangeRate,
    selectSelectedNetwork,
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

        const network = useAppSelector(selectSelectedNetwork)

        const currency = useAppSelector(selectCurrency)

        const { onCopyToClipboard } = useCopyClipboard()

        const { gasFeeInVTHOHumanReadable, fiatValueGasFeeSpent } =
            useGasFee(activity)

        const amountTransferred = useMemo(() => {
            return FormattingUtils.humanNumber(
                FormattingUtils.scaleNumberDown(
                    activity.amount,
                    token?.decimals ?? 0,
                    FormattingUtils.ROUND_DECIMAL_DEFAULT,
                ),
                activity.amount,
            )
        }, [activity.amount, token?.decimals])

        const exchangeRate = useAppSelector((state: RootState) =>
            selectCurrencyExchangeRate(state, token?.symbol ?? ""),
        )

        const fiatValueTransferred = useMemo(() => {
            if (exchangeRate?.rate && token)
                return FormattingUtils.humanNumber(
                    FormattingUtils.convertToFiatBalance(
                        activity.amount as string,
                        exchangeRate.rate,
                        token.decimals,
                    ),
                    activity.amount,
                )
        }, [activity.amount, exchangeRate?.rate, token])

        const transactionIDshort = useMemo(() => {
            return FormattingUtils.humanAddress(activity.id, 7, 9)
        }, [activity.id])

        const blockNumber = useMemo(() => {
            return activity.blockNumber
        }, [activity.blockNumber])

        // Details List
        const details: Array<ActivityDetail> = [
            {
                id: 1,
                title: LL.VALUE_TITLE(),
                value: `${amountTransferred} ${token?.symbol}`,
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
                value: network.name.toUpperCase(),
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
