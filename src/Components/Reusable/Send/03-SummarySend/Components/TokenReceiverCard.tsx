import React, { useMemo } from "react"
import { Animated } from "react-native"
import { CURRENCY_FORMATS, getNumberFormatter } from "~Constants"
import { useFormatFiat } from "~Hooks/useFormatFiat"
import { useAppSelector } from "~Storage/Redux/Hooks"
import { selectCurrencyFormat } from "~Storage/Redux/Selectors"
import { BigNutils } from "~Utils"
import { getDecimalSeparator } from "~Utils/BigNumberUtils/BigNumberUtils"
import { formatFullPrecision, formatWithLessThan } from "~Utils/StandardizedFormatting"
import { truncateToMaxDecimals } from "../../01-Amount/Hooks"
import { useTokenSendContext } from "../../Provider"
import { useCurrentExchangeRate } from "../Hooks"
import { DetailsContainer } from "./DetailsContainer"

export const TokenReceiverCard = () => {
    const { flowState } = useTokenSendContext()
    const { formatLocale } = useFormatFiat()
    const currencyFormat = useAppSelector(selectCurrencyFormat)
    const { data: exchangeRate } = useCurrentExchangeRate()

    const isInputInFiat = useMemo(() => {
        return flowState.amountInFiat ?? true
    }, [flowState.amountInFiat])

    const { locale, decimalSeparator } = useMemo(() => {
        switch (currencyFormat) {
            case CURRENCY_FORMATS.COMMA:
                return { locale: "de-DE", decimalSeparator: CURRENCY_FORMATS.COMMA }
            case CURRENCY_FORMATS.DOT:
                return { locale: "en-US", decimalSeparator: CURRENCY_FORMATS.DOT }
            case CURRENCY_FORMATS.SYSTEM:
            default:
                return {
                    locale: formatLocale,
                    decimalSeparator: getDecimalSeparator(formatLocale) ?? CURRENCY_FORMATS.DOT,
                }
        }
    }, [currencyFormat, formatLocale])

    const { displayTokenAmount, displayFiatAmount } = useMemo(() => {
        if (!exchangeRate) {
            return {
                displayTokenAmount: formatFullPrecision(flowState.amount ?? "0", {
                    locale: formatLocale,
                    tokenSymbol: flowState.token!.symbol,
                }),
                displayFiatAmount: flowState.fiatAmount,
            }
        }

        const nextFiatAmount = BigNutils().toCurrencyConversion(
            flowState.amount ?? "0",
            exchangeRate ?? 0,
            undefined,
            flowState.token!.decimals,
        )

        const [integerPart, decimalPart] = truncateToMaxDecimals(
            isInputInFiat ? flowState.fiatAmount ?? "0" : nextFiatAmount.value ?? "0",
            // Always use 2 decimals for converted value
            { kind: "fiat" },
        ).split(/[.,]/)

        const formatter = getNumberFormatter({
            locale,
            useGrouping: true,
            precision: 0,
            style: "decimal",
        })

        const formattedInteger = formatter.format(Number(integerPart))

        let fiatValue: string | undefined

        if (nextFiatAmount.isLeesThan_0_01) {
            fiatValue = formatWithLessThan(nextFiatAmount.preciseValue, 0.01, { showZeroAs: "0", locale })
        } else if (!BigNutils(decimalPart).isZero) {
            fiatValue = `${formattedInteger}${decimalSeparator}${decimalPart}`
        } else {
            fiatValue = formattedInteger
        }

        return {
            displayTokenAmount: formatFullPrecision(flowState.amount ?? "0", {
                locale: formatLocale,
                tokenSymbol: flowState.token!.symbol,
            }),
            displayFiatAmount: fiatValue,
        }
    }, [
        decimalSeparator,
        exchangeRate,
        flowState.amount,
        flowState.fiatAmount,
        flowState.token,
        formatLocale,
        locale,
        isInputInFiat,
    ])

    return (
        <Animated.View>
            <DetailsContainer>
                {isInputInFiat ? (
                    <>
                        {displayFiatAmount && <DetailsContainer.FiatValue value={displayFiatAmount} />}
                        <DetailsContainer.TokenValue value={displayTokenAmount} token={flowState.token!} />
                    </>
                ) : (
                    <>
                        <DetailsContainer.TokenValue value={displayTokenAmount} token={flowState.token!} />
                        {displayFiatAmount && <DetailsContainer.FiatValue value={displayFiatAmount} />}
                    </>
                )}
                <DetailsContainer.TokenReceiver address={flowState.address!} />
            </DetailsContainer>
        </Animated.View>
    )
}
