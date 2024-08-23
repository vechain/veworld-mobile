import { BaseIcon, BaseSpacer, BaseText, BaseView, CompressAndExpandBaseText } from "~Components"
import { useI18nContext } from "~i18n"
import React, { useMemo } from "react"
import { DelegationType } from "~Model/Delegation"
import { getCoinGeckoIdBySymbol, VET, VTHO } from "~Constants"
import { useTheme } from "~Hooks"
import { capitalize } from "lodash"
import { BigNutils } from "~Utils"
import { Network, TransactionRequest } from "~Model"
import { selectCurrency, useAppSelector } from "~Storage/Redux"
import { BigNumber } from "bignumber.js"
import { useExchangeRate } from "~Api/Coingecko"
import FiatBalance from "~Screens/Flows/App/HomeScreen/Components/AccountCard/FiatBalance"

type Props = {
    selectedDelegationOption: DelegationType
    vthoGas: string
    isThereEnoughGas: boolean
    vtho: any
    request: TransactionRequest
    network: Network
    message: Connex.Vendor.TxMessage
    options: Connex.Signer.TxOptions
}

export const TransactionDetails = ({
    selectedDelegationOption,
    vthoGas,
    isThereEnoughGas,
    vtho,
    request,
    network,
    message,
    options,
}: Props) => {
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

    const vthoBalance = useMemo(
        () => BigNutils(vtho.balance.balance).toHuman(VET.decimals).decimals(2).toString,
        [vtho.balance.balance],
    )

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
                <FiatBalance typographyFont="buttonSecondary" ml={6} balances={[formattedFiatAmount]} prefix="≈ " />
            </BaseView>

            <BaseSpacer height={12} />
            <BaseSpacer height={0.5} width={"100%"} background={theme.colors.textDisabled} />

            <BaseSpacer height={12} />
            <BaseText typographyFont="buttonSecondary">{LL.SEND_GAS_FEE()}</BaseText>
            <BaseSpacer height={6} />
            {selectedDelegationOption === DelegationType.URL ? (
                <BaseText typographyFont="subSubTitle">{LL.SEND_DELEGATED_FEES()}</BaseText>
            ) : (
                <>
                    <BaseText typographyFont="subSubTitle">
                        {vthoGas || LL.COMMON_NOT_AVAILABLE()} {VTHO.symbol}
                    </BaseText>
                    {!isThereEnoughGas && (
                        <>
                            <BaseSpacer height={8} />
                            <BaseView flexDirection="row">
                                <BaseIcon name="alert-circle-outline" color={theme.colors.danger} size={16} />
                                <BaseSpacer width={4} />
                                <BaseText typographyFont="buttonSecondary" color={theme.colors.danger}>
                                    {LL.SEND_INSUFFICIENT_VTHO()} {vthoBalance} {VTHO.symbol}
                                </BaseText>
                            </BaseView>
                        </>
                    )}
                </>
            )}
            <BaseSpacer height={12} />
            <BaseSpacer height={0.5} width={"100%"} background={theme.colors.textDisabled} />
            <BaseSpacer height={12} />
            <BaseText typographyFont="buttonSecondary">{LL.SEND_ESTIMATED_TIME()}</BaseText>
            <BaseSpacer height={6} />
            <BaseText typographyFont="subSubTitle">{LL.SEND_LESS_THAN_1_MIN()}</BaseText>

            <BaseSpacer height={12} />
            <BaseSpacer height={0.5} width={"100%"} background={theme.colors.textDisabled} />

            <BaseSpacer height={12} />
            <BaseText typographyFont="buttonSecondary">{LL.CONNECTED_APP_SELECTED_MESSAGE_LABEL()}</BaseText>
            <BaseSpacer height={6} />

            {comment && <CompressAndExpandBaseText text={comment} typographyFont="subSubTitle" />}
        </>
    )
}
