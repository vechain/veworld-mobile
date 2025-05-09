import { BigNumber } from "bignumber.js"
import { capitalize } from "lodash"
import React, { useMemo } from "react"
import { useExchangeRate } from "~Api/Coingecko"
import { BaseSpacer, BaseText, BaseView, CompressAndExpandBaseText, FiatBalance } from "~Components"
import { getCoinGeckoIdBySymbol, VET } from "~Constants"
import { useTheme } from "~Hooks"
import { useI18nContext } from "~i18n"
import { Network, TransactionRequest } from "~Model"
import { selectCurrency, useAppSelector } from "~Storage/Redux"
import { BigNutils } from "~Utils"

type Props = {
    request: TransactionRequest
    network: Network
    message: Connex.Vendor.TxMessage
    options: Connex.Signer.TxOptions
}

export const TransactionDetails = ({ request, network, message, options }: Props) => {
    const { LL } = useI18nContext()
    const theme = useTheme()

    const currency = useAppSelector(selectCurrency)
    const { data: exchangeRate } = useExchangeRate({
        id: getCoinGeckoIdBySymbol[VET.symbol],
        vs_currency: currency,
    })

    const comment = options.comment ?? message[0].comment

    const spendingAmount = useMemo(() => {
        const amount = message
            .reduce((acc: BigNumber, clause: Connex.VM.Clause) => {
                return acc.plus(clause.value || "0")
            }, new BigNumber(0))
            .toString()
        return BigNutils(amount || "0").toHuman(VET.decimals).toString
    }, [message])

    const formattedFiatAmount = BigNutils().toCurrencyConversion(spendingAmount || "0", exchangeRate ?? 1)

    return (
        <>
            <BaseText typographyFont="subTitleBold">{LL.SEND_DETAILS()}</BaseText>

            <BaseSpacer height={24} />
            <BaseText typographyFont="buttonSecondary">{LL.CONNECTED_APP_SELECTED_ORIGIN_LABEL()}</BaseText>
            <BaseSpacer height={6} />
            <BaseText typographyFont="subSubTitle">{request.appName}</BaseText>

            <BaseSpacer height={12} />
            <BaseSpacer height={0.5} width={"100%"} background={theme.colors.textDisabled} />

            <BaseSpacer height={12} />
            <BaseText typographyFont="buttonSecondary">{LL.CONNECTED_APP_SELECTED_NETWORK_LABEL()}</BaseText>
            <BaseSpacer height={6} />
            <BaseText typographyFont="subSubTitle">{capitalize(network.name)}</BaseText>

            <BaseSpacer height={12} />
            <BaseSpacer height={0.5} width={"100%"} background={theme.colors.textDisabled} />

            <BaseSpacer height={12} />
            <BaseText typographyFont="buttonSecondary">{LL.SEND_AMOUNT()}</BaseText>
            <BaseSpacer height={6} />
            <BaseView flexDirection="row">
                <BaseText typographyFont="subSubTitle">
                    {spendingAmount.toString()} {VET.symbol}
                </BaseText>
                <FiatBalance
                    typographyFont="buttonSecondary"
                    ml={6}
                    balances={[formattedFiatAmount.value]}
                    prefix="≈ "
                />
            </BaseView>

            <BaseSpacer height={12} />
            <BaseSpacer height={0.5} width={"100%"} background={theme.colors.textDisabled} />

            <BaseSpacer height={12} />
            <BaseText typographyFont="buttonSecondary">{LL.CONNECTED_APP_SELECTED_MESSAGE_LABEL()}</BaseText>
            <BaseSpacer height={6} />

            {comment && <CompressAndExpandBaseText text={comment} typographyFont="subSubTitle" />}
        </>
    )
}
