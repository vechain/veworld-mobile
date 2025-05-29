import { useCallback, useMemo } from "react"
import { Transaction } from "thor-devkit"
import { ERROR_EVENTS, GasPriceCoefficient } from "~Constants"
import { useTransactionGas } from "~Hooks"
import { useFormatFiat } from "~Hooks/useFormatFiat"
import { FungibleTokenWithBalance } from "~Model"
import { BigNumberUtils, BigNutils, GasUtils, TransactionUtils, error } from "~Utils"

export const useTotalTokenBalance = (
    token: FungibleTokenWithBalance,
    amount: string,
    address: string,
    decimals?: number,
) => {
    const { formatLocale } = useFormatFiat()

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
            let gasFee: BigNumberUtils = BigNutils("0")
            let isError = false

            try {
                const gas = await calculateGasFees(_clauses)
                const { priorityFees } = GasUtils.getGasByCoefficient({
                    gas: gas,
                    selectedFeeOption: String(GasPriceCoefficient.REGULAR),
                })

                gasFee = priorityFees.gasRaw
            } catch (e) {
                isError = true
                error(ERROR_EVENTS.SEND, e)
            }

            return {
                gasFee,
                isError,
            }
        },
        [calculateGasFees],
    )

    const tokenTotalBalance = useMemo(() => {
        return BigNutils(token.balance.balance).toString
    }, [token.balance.balance])

    const tokenTotalToHuman = useMemo(() => {
        return BigNutils(tokenTotalBalance).toHuman(token.decimals)
    }, [token.decimals, tokenTotalBalance])

    const tokenTotalToHumanFormatted = useMemo(() => {
        return BigNutils(tokenTotalBalance)
            .toHuman(token.decimals)
            .toTokenFormatFull_string(decimals ?? 8, formatLocale)
    }, [decimals, formatLocale, token.decimals, tokenTotalBalance])

    return { tokenTotalBalance, tokenTotalToHuman, tokenTotalToHumanFormatted, getGasFees }
}
