import { FungibleTokenWithBalance } from "~Model"
import { useMemo } from "react"
import { VTHO } from "~Constants"
import { BigNumberUtils } from "~Utils"

export const useTotalTokenBalance = (
    token: FungibleTokenWithBalance,
    vthoEstimate: string,
    setIsError: React.Dispatch<React.SetStateAction<boolean>>,
) => {
    const { decimals } = token

    const tokenTotalBalance = useMemo(() => {
        return BigNumberUtils(token.balance.balance).toString
    }, [token.balance.balance])

    const tokenBalanceMinusProjectedFees = useMemo(() => {
        let total = ""

        if (token?.symbol?.toLowerCase() === VTHO.symbol.toLowerCase()) {
            let newTotal = BigNumberUtils(token.balance.balance).minus(vthoEstimate)

            if (newTotal.isLessThan(0)) {
                setIsError(true)
                newTotal = BigNumberUtils("0")
            }

            total = newTotal.toHuman(decimals).toString
        } else {
            total = BigNumberUtils(tokenTotalBalance).toHuman(decimals).toString
        }

        return total
    }, [decimals, setIsError, token.balance.balance, token?.symbol, tokenTotalBalance, vthoEstimate])

    const tokenTotalToHuman = useMemo(() => {
        return BigNumberUtils(tokenTotalBalance).toHuman(decimals).toString
    }, [decimals, tokenTotalBalance])

    return { tokenTotalBalance, tokenTotalToHuman, tokenBalanceMinusProjectedFees }
}
