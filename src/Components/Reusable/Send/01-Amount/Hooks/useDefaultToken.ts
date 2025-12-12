import { useMemo } from "react"
import { B3TR, VeDelegate, VET, VOT3, VTHO } from "~Constants"
import { useNonVechainTokenFiat } from "~Hooks/useNonVechainTokenFiat"
import { useNonVechainTokensBalance } from "~Hooks/useNonVechainTokensBalance"
import { useSendableTokensWithBalance } from "~Hooks/useSendableTokensWithBalance"
import { useTokenWithCompleteInfo } from "~Hooks/useTokenWithCompleteInfo"
import { BalanceUtils, BigNutils } from "~Utils"
import { useTokenSendContext } from "../../Provider"

export const useDefaultToken = () => {
    const { flowState } = useTokenSendContext()
    const availableTokens = useSendableTokensWithBalance()

    const vetInfo = useTokenWithCompleteInfo(VET)
    const vthoInfo = useTokenWithCompleteInfo(VTHO)
    const b3trInfo = useTokenWithCompleteInfo(B3TR)

    const { data: nonVechainTokensWithBalance } = useNonVechainTokensBalance()
    const { data: nonVechainTokensFiat } = useNonVechainTokenFiat()

    return useMemo(() => {
        if (flowState.token) return flowState.token

        const sendableTokens = availableTokens.filter(
            t => t.symbol !== VOT3.symbol && !BigNutils(t.balance.balance).isZero && t.symbol !== VeDelegate.symbol,
        )

        if (sendableTokens.length === 0) {
            const vetToken = availableTokens.find(t => t.symbol === VET.symbol)
            return vetToken || availableTokens[0]
        }

        const tokensWithFiatValue = sendableTokens.map(t => {
            let fiatValue = 0

            if (t.symbol === VET.symbol && vetInfo.exchangeRate) {
                const fiatStr = BalanceUtils.getFiatBalance(t.balance.balance, vetInfo.exchangeRate, t.decimals)
                fiatValue = Number.parseFloat(fiatStr.replaceAll(/[^0-9.]/g, "")) || 0
            } else if (t.symbol === VTHO.symbol && vthoInfo.exchangeRate) {
                const fiatStr = BalanceUtils.getFiatBalance(t.balance.balance, vthoInfo.exchangeRate, t.decimals)
                fiatValue = Number.parseFloat(fiatStr.replaceAll(/[^0-9.]/g, "")) || 0
            } else if (t.symbol === B3TR.symbol && b3trInfo.exchangeRate) {
                const fiatStr = BalanceUtils.getFiatBalance(t.balance.balance, b3trInfo.exchangeRate, t.decimals)
                fiatValue = Number.parseFloat(fiatStr.replaceAll(/[^0-9.]/g, "")) || 0
            } else if (nonVechainTokensWithBalance && nonVechainTokensFiat) {
                const tokenIndex = nonVechainTokensWithBalance.findIndex(nt => nt.address === t.address)
                if (tokenIndex >= 0 && tokenIndex < nonVechainTokensFiat.length) {
                    const fiatStr = nonVechainTokensFiat[tokenIndex]
                    if (fiatStr) {
                        fiatValue = Number.parseFloat(fiatStr.replaceAll(/[^0-9.]/g, "")) || 0
                    }
                }
            }

            return { token: t, fiatValue }
        })

        tokensWithFiatValue.sort((a, b) => b.fiatValue - a.fiatValue)

        return tokensWithFiatValue[0]?.token || sendableTokens[0]
    }, [
        flowState.token,
        availableTokens,
        vetInfo.exchangeRate,
        vthoInfo.exchangeRate,
        b3trInfo.exchangeRate,
        nonVechainTokensWithBalance,
        nonVechainTokensFiat,
    ])
}
