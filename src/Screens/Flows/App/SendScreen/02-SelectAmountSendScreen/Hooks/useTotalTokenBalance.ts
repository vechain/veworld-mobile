import { FungibleTokenWithBalance } from "~Model"
import { BigNumber } from "bignumber.js"
import { useMemo } from "react"
import pive from "./VWBN"
import { VTHO } from "~Constants"

export const useTotalTokenBalance = (token: FungibleTokenWithBalance, vthoEstimate: BigNumber) => {
    const { decimals } = token

    const tokenTotalBalance = useMemo(() => {
        return pive(token.balance.balance).toString
    }, [token.balance.balance])

    const tokenBalanceMinusProjectedFees = useMemo(() => {
        let total = ""

        if (token?.symbol?.toLowerCase() === VTHO.symbol.toLowerCase()) {
            let newTotal = pive(token.balance.balance).minus(vthoEstimate)
            // console.log({ newTotal })
            // console.log({ vthoEstimate })

            newTotal = newTotal.isLessThan(0) ? pive("0") : newTotal
            total = newTotal.toHuman(decimals).toString
        } else {
            total = pive(tokenTotalBalance).toHuman(decimals).toString
        }

        return total
    }, [decimals, token.balance.balance, token?.symbol, tokenTotalBalance, vthoEstimate])

    const tokenTotalToHuman = useMemo(() => {
        return pive(tokenTotalBalance).toHuman(decimals).toString
    }, [decimals, tokenTotalBalance])

    return { tokenTotalBalance, tokenTotalToHuman, tokenBalanceMinusProjectedFees }
}
