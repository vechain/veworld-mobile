import { useMemo } from "react"
import { B3TR, VeB3TR } from "~Constants"
import { useTokenCardFiatInfo } from "~Hooks/useTokenCardFiatInfo"
import { useTokenWithCompleteInfo } from "~Hooks/useTokenWithCompleteInfo"
import { selectVeB3TRTokenWithBalance, useAppSelector } from "~Storage/Redux"
import { BalanceUtils } from "~Utils"

export const useVeB3TRFiat = () => {
    const tokenWithInfoB3TR = useTokenWithCompleteInfo(B3TR)
    const veB3tr = useAppSelector(selectVeB3TRTokenWithBalance)
    const { exchangeRate: b3trExchangeRate } = useTokenCardFiatInfo(tokenWithInfoB3TR)

    const veB3trBalance = useMemo(
        () => BalanceUtils.getFiatBalance(veB3tr?.balance.balance ?? "0", b3trExchangeRate ?? 0, VeB3TR.decimals),
        [b3trExchangeRate, veB3tr?.balance.balance],
    )
    return veB3trBalance
}
