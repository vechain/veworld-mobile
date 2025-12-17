import React, { useMemo } from "react"
import { Animated } from "react-native"
import { useFormatFiat } from "~Hooks/useFormatFiat"
import { BigNutils } from "~Utils"
import { useTokenSendContext } from "../../Provider"
import { useCurrentExchangeRate } from "../Hooks"
import { DetailsContainer } from "./DetailsContainer"
import { truncateToMaxDecimals, useDisplayInput, useSendAmountInput } from "../../01-Amount/Hooks"
import { ethers } from "ethers"
import { useAppSelector } from "~Storage/Redux/Hooks"
import { selectCurrencyFormat } from "~Storage/Redux/Selectors"
import { CURRENCY_FORMATS, getNumberFormatter } from "~Constants"
import { getDecimalSeparator } from "~Utils/BigNumberUtils/BigNumberUtils"
import { formatFullPrecision, formatWithLessThan } from "~Utils/StandardizedFormatting"

export const TokenReceiverCard = () => {
    const { flowState } = useTokenSendContext()
    const { formatLocale } = useFormatFiat()
    const currencyFormat = useAppSelector(selectCurrencyFormat)
    const { data: exchangeRate } = useCurrentExchangeRate()

    const isInputInFiat = useMemo(() => {
        return flowState.amountInFiat ?? true
    }, [flowState.amountInFiat])

    const { input, tokenAmount, fiatAmount } = useSendAmountInput({
        token: flowState.token!,
        isInputInFiat,
    })

    const { formattedInput, formattedConverted } = useDisplayInput({
        input,
        tokenAmount,
        fiatAmount,
        isInputInFiat,
        token: flowState.token!,
    })

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
                displayTokenAmount: isInputInFiat ? formattedConverted : formattedInput,
                displayFiatAmount: isInputInFiat ? formattedInput : formattedConverted,
            }
        }

        if (flowState.amountInFiat && flowState.fiatAmount != null) {
            const nextTokenAmount = BigNutils().toTokenConversion(
                ethers.utils.formatUnits(fiatAmount, flowState.token!.decimals),
                exchangeRate,
            ).toString

            return {
                displayTokenAmount: formatFullPrecision(nextTokenAmount, {
                    locale: formatLocale,
                    tokenSymbol: flowState.token!.symbol,
                }),
                displayFiatAmount: formattedInput,
            }
        }

        const parsedTokenAmount = ethers.utils.formatUnits(tokenAmount, flowState.token!.decimals)

        const nextFiatAmount = BigNutils().toCurrencyConversion(
            ethers.utils.formatUnits(tokenAmount, flowState.token!.decimals),
            exchangeRate ?? 0,
            undefined,
            flowState.token!.decimals,
        )

        const [integerPart, decimalPart] = truncateToMaxDecimals(
            nextFiatAmount.value,
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

        let fiatValue = ""

        if (nextFiatAmount.isLeesThan_0_01) {
            fiatValue = formatWithLessThan(nextFiatAmount.preciseValue, 0.01, { showZeroAs: "0", locale })
        } else if (!BigNutils(decimalPart).isZero) {
            fiatValue = `${formattedInteger}${decimalSeparator}${decimalPart}`
        } else {
            fiatValue = formattedInteger
        }

        return {
            displayTokenAmount: formatFullPrecision(parsedTokenAmount, {
                locale: formatLocale,
                tokenSymbol: flowState.token!.symbol,
            }),
            displayFiatAmount: fiatValue,
        }
    }, [
        decimalSeparator,
        exchangeRate,
        fiatAmount,
        flowState.amountInFiat,
        flowState.fiatAmount,
        flowState.token,
        formatLocale,
        formattedConverted,
        formattedInput,
        isInputInFiat,
        locale,
        tokenAmount,
    ])

    return (
        <Animated.View>
            <DetailsContainer>
                {isInputInFiat ? (
                    <>
                        <DetailsContainer.FiatValue value={displayFiatAmount} />
                        <DetailsContainer.TokenValue value={displayTokenAmount} token={flowState.token!} />
                    </>
                ) : (
                    <>
                        <DetailsContainer.TokenValue value={displayTokenAmount} token={flowState.token!} />
                        <DetailsContainer.FiatValue value={displayFiatAmount} />
                    </>
                )}
                <DetailsContainer.TokenReceiver address={flowState.address!} />
            </DetailsContainer>
        </Animated.View>
    )
}
