import { FungibleTokenWithBalance } from "~Model"
import { useTokenSendContext } from "../../Provider"
import { useMemo, useState } from "react"
import { BigNutils } from "~Utils"
import { ethers } from "ethers"

type Args = {
    token: FungibleTokenWithBalance
    exchangeRate: number | null | undefined
}

/**
 * Hook to initialize the fiat amount correctly
 * @param param0 Arguments
 * @returns The hook for retrieving and setting the fiat amount
 */
export const useFiatAmount = ({ token, exchangeRate }: Args) => {
    const { flowState } = useTokenSendContext()

    const tokenTotalBalance = useMemo(() => {
        return BigNutils(token.balance.balance).toString
    }, [token?.balance.balance])

    return useState(() => {
        if (
            flowState.amountInFiat &&
            ethers.utils.parseUnits(flowState.amount ?? "0", token.decimals).toString() !== tokenTotalBalance
        )
            return ethers.utils.parseUnits(flowState.fiatAmount ?? "0", token.decimals).toString()
        return BigNutils()
            .toCurrencyConversion(
                ethers.utils.parseUnits(flowState.amount ?? "0", token.decimals).toString(),
                exchangeRate ?? 0,
                undefined,
                token.decimals,
            )
            .self.toBigInt.toString()
    })
}
