import { FungibleTokenWithBalance } from "~Model"
import { useMemo } from "react"
import { VTHO } from "~Constants"
import { BigNutils } from "~Utils"

export const useTotalTokenBalance = (
    token: FungibleTokenWithBalance,
    vthoEstimate: string,
    // setIsError: React.Dispatch<React.SetStateAction<boolean>>,
) => {
    const { decimals } = token

    const tokenTotalBalance = useMemo(() => {
        return BigNutils(token.balance.balance).toString
    }, [token.balance.balance])

    const tokenBalanceMinusProjectedFees = useMemo(() => {
        let total = ""

        if (token?.symbol?.toLowerCase() === VTHO.symbol.toLowerCase()) {
            let newTotal = BigNutils(token.balance.balance).minus(vthoEstimate)

            if (newTotal.isLessThan(0)) {
                //! this should br reinstated when tokenBalanceMinusProjectedFees will be in use again
                // setIsError(true)
                newTotal = BigNutils("0")
            }

            total = newTotal.toHuman(decimals).toString
        } else {
            total = BigNutils(tokenTotalBalance).toHuman(decimals).toString
        }

        return total
    }, [decimals, token.balance.balance, token?.symbol, tokenTotalBalance, vthoEstimate])

    const tokenTotalToHuman = useMemo(() => {
        return BigNutils(tokenTotalBalance).toHuman(decimals).decimals(8).toString
    }, [decimals, tokenTotalBalance])

    return { tokenTotalBalance, tokenTotalToHuman, tokenBalanceMinusProjectedFees }
}
