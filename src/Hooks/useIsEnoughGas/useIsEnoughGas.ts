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

export const useIsEnoughGas = ({ selectedToken, fee, clauses, isDelegated }: Args) => {
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
        //Delegation with VTHO should count as "0" for fees
        if (isDelegated && selectedToken === VTHO.symbol)
            return BigNutils(tokenBalance).minus(clausesAmount.toBN).isBiggerThan("0")
        return BigNutils(tokenBalance).minus(clausesAmount.toBN).isBiggerThan(fee.toBN)
    }, [clausesAmount.toBN, fee.toBN, isDelegated, selectedToken, tokenBalance])

    const memoized = useMemo(() => ({ hasEnoughBalance }), [hasEnoughBalance])

    return memoized
}
