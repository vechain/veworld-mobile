import { useMemo } from "react"
import { getCoinGeckoIdBySymbol, useExchangeRate } from "~Api/Coingecko"
import { useSendContext } from "~Components"
import { selectCurrency, useAppSelector } from "~Storage/Redux"

export const useCurrentExchangeRate = () => {
    const currency = useAppSelector(selectCurrency)
    const { flowState } = useSendContext()

    const exchangeRateId = useMemo(
        () => (flowState.token ? getCoinGeckoIdBySymbol[flowState.token.symbol] : undefined),
        [flowState.token],
    )

    return useExchangeRate({
        id: exchangeRateId,
        vs_currency: currency,
        refetchIntervalMs: 20000,
    })
}
