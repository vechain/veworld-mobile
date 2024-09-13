import { useCallback, useMemo, useRef } from "react"
import { Transaction } from "thor-devkit"
import { ERROR_EVENTS, GasPriceCoefficient, VTHO } from "~Constants"
import { useTransactionGas } from "~Hooks"
import { FungibleTokenWithBalance } from "~Model"
import { BigNumberUtils, BigNutils, GasUtils, TransactionUtils, error } from "~Utils"

export const useTotalTokenBalance = (token: FungibleTokenWithBalance, amount: string, address: string) => {
    const isVTHO = useRef(token.symbol.toLowerCase() === VTHO.symbol.toLowerCase())

    const clauses = useMemo(
        () => TransactionUtils.prepareFungibleClause(amount, token, address),
        [address, amount, token],
    )

    const { calculateGasFees } = useTransactionGas({
        clauses,
        disabled: true,
    })

    const getGasFees = useCallback(
        async (_clauses: Transaction.Body["clauses"]) => {
            let maxAmountMinusFees = BigNutils(token.balance.balance).minus("0")

            let maxAmountMinusFeesHuman = BigNutils(maxAmountMinusFees.toString)
                .toHuman(token.decimals)
                .decimals(8).toString

            let isEnoughGas = true
            let gasFee: BigNumberUtils = BigNutils("0")
            let isError = false

            if (isVTHO.current) {
                try {
                    const gas = await calculateGasFees(_clauses)
                    const { priorityFees } = GasUtils.getGasByCoefficient({
                        gas: gas,
                        selectedFeeOption: String(GasPriceCoefficient.REGULAR),
                    })

                    gasFee = priorityFees.gasRaw
                    maxAmountMinusFees = BigNutils(token.balance.balance).minus(priorityFees.gasRaw.toString)
                    isEnoughGas = maxAmountMinusFees.isLessThan(0)
                    maxAmountMinusFeesHuman = BigNutils(maxAmountMinusFees.toString)
                        .toHuman(token.decimals)
                        .decimals(8).toString
                } catch (e) {
                    isError = true
                    error(ERROR_EVENTS.SEND, e)
                }
            }

            return {
                maxAmountMinusFees: maxAmountMinusFees.toString,
                maxAmountMinusFeesHuman,
                isEnoughGas,
                gasFee,
                isError,
            }
        },
        [calculateGasFees, token],
    )

    const tokenTotalBalance = useMemo(() => {
        return BigNutils(token.balance.balance).toString
    }, [token.balance.balance])

    const tokenTotalToHuman = useMemo(() => {
        return BigNutils(tokenTotalBalance).toHuman(token.decimals).decimals(8).toString
    }, [token.decimals, tokenTotalBalance])

    return { tokenTotalBalance, tokenTotalToHuman, getGasFees }
}
