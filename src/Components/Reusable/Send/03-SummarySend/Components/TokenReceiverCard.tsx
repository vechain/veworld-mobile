import React, { useMemo } from "react"
import { Animated } from "react-native"
import { getCoinGeckoIdBySymbol, useExchangeRate } from "~Api/Coingecko"
import { useFormatFiat } from "~Hooks/useFormatFiat"
import { selectCurrency, useAppSelector } from "~Storage/Redux"
import { BigNutils } from "~Utils"
import { formatFullPrecision } from "~Utils/StandardizedFormatting"
import { useSendContext } from "../../Provider"
import { DetailsContainer } from "./DetailsContainer"

type TokenReceiverCardProps = {
    address: string
}

export const TokenReceiverCard = ({ address }: TokenReceiverCardProps) => {
    const { flowState } = useSendContext()
    const currency = useAppSelector(selectCurrency)
    const { formatLocale } = useFormatFiat()

    const exchangeRateId = useMemo(
        () => (flowState.token ? getCoinGeckoIdBySymbol[flowState.token.symbol] : undefined),
        [flowState.token],
    )

    const { data: exchangeRate } = useExchangeRate({
        id: exchangeRateId,
        vs_currency: currency,
        refetchIntervalMs: 20000,
    })

    const { displayTokenAmount, displayFiatAmount } = useMemo(() => {
        if (!exchangeRate) {
            return {
                displayTokenAmount: flowState.amount ?? "0",
                displayFiatAmount: flowState.fiatAmount,
            }
        }

        if (flowState.amountInFiat && flowState.fiatAmount != null) {
            const nextTokenAmount = BigNutils().toTokenConversion(flowState.fiatAmount, exchangeRate).toString

            return {
                displayTokenAmount: nextTokenAmount,
                displayFiatAmount: flowState.fiatAmount,
            }
        }

        const sourceAmount = flowState.amount ?? "0"
        const { value } = BigNutils().toCurrencyConversion(sourceAmount, exchangeRate)

        return {
            displayTokenAmount: sourceAmount,
            displayFiatAmount: value,
        }
    }, [exchangeRate, flowState.amount, flowState.amountInFiat, flowState.fiatAmount])

    const formattedTokenAmount = useMemo(() => {
        if (!flowState.token) return undefined

        const raw = (displayTokenAmount ?? "").trim()
        if (!raw) return undefined

        // Preserve any special "< 0.00001" style strings just in case
        if (raw.startsWith("<")) return raw

        return formatFullPrecision(raw, {
            locale: formatLocale,
            forceDecimals: 5,
            tokenSymbol: flowState.token.symbol,
        })
    }, [displayTokenAmount, flowState.token, formatLocale])

    const formattedFiatAmount = useMemo(() => {
        if (displayFiatAmount == null) return undefined

        const trimmed = displayFiatAmount.trim()
        // Preserve special "< 0.01" style strings
        if (trimmed.startsWith("<")) return trimmed

        return formatFullPrecision(trimmed, {
            locale: formatLocale,
            forceDecimals: 2,
        })
    }, [displayFiatAmount, formatLocale])

    return (
        <Animated.View>
            <DetailsContainer>
                {flowState.amountInFiat ? (
                    <>
                        {formattedFiatAmount && <DetailsContainer.FiatValue value={formattedFiatAmount} />}
                        <DetailsContainer.TokenValue
                            value={formattedTokenAmount ?? displayTokenAmount}
                            token={flowState.token!}
                        />
                    </>
                ) : (
                    <>
                        <DetailsContainer.TokenValue
                            value={formattedTokenAmount ?? displayTokenAmount}
                            token={flowState.token!}
                        />
                        {formattedFiatAmount && <DetailsContainer.FiatValue value={formattedFiatAmount} />}
                    </>
                )}
                <DetailsContainer.TokenReceiver address={address} />
            </DetailsContainer>
        </Animated.View>
    )
}
