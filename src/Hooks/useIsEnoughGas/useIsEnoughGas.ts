import { TransactionClause } from "@vechain/sdk-core"
import { useMemo } from "react"
import { VTHO } from "~Constants"
import { FungibleToken } from "~Model"
import { selectAllTokens, selectTokensWithBalances, useAppSelector } from "~Storage/Redux"
import { BigNumberUtils, BigNutils } from "~Utils"
import AddressUtils from "~Utils/AddressUtils"
import TransactionUtils from "~Utils/TransactionUtils"

type Args = {
    selectedToken: string
    fee: BigNumberUtils
    clauses: TransactionClause[]
    isDelegated: boolean
    allFeeOptions:
        | {
              [token: string]: BigNumberUtils
          }
        | undefined
    isLoadingFees: boolean
}

const calculateClausesValue = ({
    clauses,
    selectedToken,
}: {
    clauses: TransactionClause[]
    selectedToken: FungibleToken
}) => {
    const filteredClauses = clauses.filter(clause =>
        selectedToken.symbol === "VET"
            ? clause.data === "0x" && clause.to
            : clause.to &&
              AddressUtils.compareAddresses(clause.to, selectedToken.address) &&
              TransactionUtils.isTokenTransferClause(clause),
    )

    let sum = filteredClauses.reduce(
        (acc, clause) => acc.plus(TransactionUtils.getAmountFromClause(clause) ?? "0"),
        BigNutils("0"),
    )

    return sum
}

export const useIsEnoughGas = ({ selectedToken, fee, clauses, isDelegated, allFeeOptions, isLoadingFees }: Args) => {
    const allTokens = useAppSelector(selectAllTokens)
    const tokens = useAppSelector(selectTokensWithBalances)

    const foundToken = useMemo(() => {
        return allTokens.find(tk => tk.symbol === selectedToken)!
    }, [allTokens, selectedToken])

    const tokenBalance = useMemo(
        () => tokens.find(tk => tk.symbol === selectedToken)?.balance?.balance ?? "0",
        [selectedToken, tokens],
    )

    const clausesAmount = useMemo(
        () => calculateClausesValue({ clauses, selectedToken: foundToken }),
        [clauses, foundToken],
    )

    const hasEnoughBalance = useMemo(() => {
        if (isLoadingFees) return true
        //Delegation with VTHO should count as "0" for fees
        if (isDelegated && selectedToken === VTHO.symbol)
            return BigNutils(tokenBalance).minus(clausesAmount.toBN).isBiggerThan("0")
        return BigNutils(tokenBalance).minus(clausesAmount.toBN).isBiggerThan(fee.toBN)
    }, [clausesAmount.toBN, fee.toBN, isDelegated, isLoadingFees, selectedToken, tokenBalance])

    const hasEnoughBalanceOnAny = useMemo(() => {
        if (isLoadingFees || typeof allFeeOptions === "undefined") return true
        if (selectedToken === VTHO.symbol && isDelegated)
            return BigNutils(tokenBalance).minus(clausesAmount.toBN).isBiggerThan("0")
        return Object.entries(allFeeOptions).some(([token, tokenFee]) => {
            const balance = tokens.find(tk => tk.symbol === token)?.balance?.balance ?? "0"
            const foundTmpToken = allTokens.find(tk => tk.symbol === token)!
            const clausesValue = calculateClausesValue({ clauses, selectedToken: foundTmpToken })
            return BigNutils(balance).minus(clausesValue.toBN).isBiggerThan(tokenFee.toBN)
        })
    }, [
        allFeeOptions,
        allTokens,
        clauses,
        clausesAmount.toBN,
        isDelegated,
        isLoadingFees,
        selectedToken,
        tokenBalance,
        tokens,
    ])

    const memoized = useMemo(
        () => ({ hasEnoughBalance, hasEnoughBalanceOnAny }),
        [hasEnoughBalance, hasEnoughBalanceOnAny],
    )

    return memoized
}
