import { useMemo } from "react"
import { getCoinGeckoIdBySymbol, useExchangeRate } from "~Api/Coingecko"
import { B3TR, VET, VTHO } from "~Constants"
import { useNonVechainTokenFiat } from "~Hooks/useNonVechainTokenFiat"
import { useNonVechainTokensBalance } from "~Hooks/useNonVechainTokensBalance"
import { useSendableTokensWithBalance } from "~Hooks/useSendableTokensWithBalance"
import { selectCurrency, selectLastSentToken, useAppSelector } from "~Storage/Redux"
import { AddressUtils, BalanceUtils, BigNutils } from "~Utils"
import { useTokenSendContext } from "../../Provider"

export const useDefaultToken = () => {
    const { flowState } = useTokenSendContext()
    const availableTokens = useSendableTokensWithBalance()

    const currency = useAppSelector(selectCurrency)
    const { data: vetExchangeRate } = useExchangeRate({ vs_currency: currency, id: getCoinGeckoIdBySymbol[VET.symbol] })
    const { data: vthoExchangeRate } = useExchangeRate({
        vs_currency: currency,
        id: getCoinGeckoIdBySymbol[VTHO.symbol],
    })
    const { data: b3trExchangeRate } = useExchangeRate({
        vs_currency: currency,
        id: getCoinGeckoIdBySymbol[B3TR.symbol],
    })

    const { data: nonVechainTokensWithBalance, isLoading: isLoadingVechainTokensBalance } = useNonVechainTokensBalance()
    const { data: nonVechainTokensFiat, isLoading: isLoadingNonVechainTokenFiat } = useNonVechainTokenFiat()

    const isLoading = useMemo(
        () => isLoadingVechainTokensBalance || isLoadingNonVechainTokenFiat,
        [isLoadingNonVechainTokenFiat, isLoadingVechainTokensBalance],
    )

    const lastSentTokenAddress = useAppSelector(selectLastSentToken)

    return useMemo(() => {
        if (flowState.token) return flowState.token
        const lastToken = availableTokens.find(token =>
            AddressUtils.compareAddresses(token.address, lastSentTokenAddress),
        )

        if (lastToken) return lastToken
        if (isLoading || !nonVechainTokensWithBalance || !nonVechainTokensFiat) return

        const tokensWithFiatValue = availableTokens.map(token => {
            if (token.symbol === VET.symbol && vetExchangeRate) {
                return {
                    token,
                    fiatValue: BalanceUtils.getPreciseFiatBalance(
                        token.balance.balance,
                        vetExchangeRate,
                        token.decimals,
                    ),
                }
            }
            if (token.symbol === VTHO.symbol && vthoExchangeRate) {
                return {
                    token,
                    fiatValue: BalanceUtils.getPreciseFiatBalance(
                        token.balance.balance,
                        vthoExchangeRate,
                        token.decimals,
                    ),
                }
            }
            if (token.symbol === B3TR.symbol && b3trExchangeRate) {
                return {
                    token,
                    fiatValue: BalanceUtils.getPreciseFiatBalance(
                        token.balance.balance,
                        b3trExchangeRate,
                        token.decimals,
                    ),
                }
            }
            const tokenIndex = nonVechainTokensWithBalance.findIndex(nt =>
                AddressUtils.compareAddresses(nt.address, token.address),
            )
            if (tokenIndex === -1 || tokenIndex >= nonVechainTokensFiat.length) return { token, fiatValue: "0" }

            return {
                token,
                fiatValue: nonVechainTokensFiat[tokenIndex],
            }
        })

        tokensWithFiatValue.sort((a, b) => BigNutils(b.fiatValue).toBN.comparedTo(BigNutils(a.fiatValue).toBN))

        return tokensWithFiatValue[0]?.token || availableTokens[0]
    }, [
        flowState.token,
        availableTokens,
        isLoading,
        nonVechainTokensWithBalance,
        nonVechainTokensFiat,
        lastSentTokenAddress,
        vetExchangeRate,
        vthoExchangeRate,
        b3trExchangeRate,
    ])
}
