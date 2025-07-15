import { TransactionClause } from "@vechain/sdk-core"
import { useMemo } from "react"
import { B3TR, VET, VTHO } from "~Constants"
import { FungibleToken } from "~Model"
import { selectAllTokens, selectTokensWithBalances, useAppSelector } from "~Storage/Redux"
import { BigNumberUtils, BigNutils } from "~Utils"
import AddressUtils from "~Utils/AddressUtils"
import TransactionUtils from "~Utils/TransactionUtils"

type Args = {
    selectedToken: string
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

export const useIsEnoughGas = ({ selectedToken, clauses, isDelegated, allFeeOptions, isLoadingFees }: Args) => {
    const allTokens = useAppSelector(selectAllTokens)
    const tokens = useAppSelector(selectTokensWithBalances)

    const hasEnoughBalanceOnToken = useMemo(() => {
        const availableTokens = [VTHO.symbol, B3TR.symbol, VET.symbol]
        return Object.fromEntries(
            availableTokens.map(tokenSymbol => {
                if (isLoadingFees || allFeeOptions === undefined) return [tokenSymbol, true] as const
                if (allFeeOptions[tokenSymbol] === undefined) return [tokenSymbol, false] as const
                const foundTmpToken = allTokens.find(tk => tk.symbol === tokenSymbol)!
                const balance = tokens.find(tk => tk.symbol === tokenSymbol)?.balance?.balance ?? "0"
                const clausesValue = calculateClausesValue({ clauses, selectedToken: foundTmpToken })
                //Delegation with VTHO should count as "0" for fees
                if (tokenSymbol === VTHO.symbol && isDelegated)
                    return [tokenSymbol, BigNutils(balance).minus(clausesValue.toBN).isBiggerThan("0")] as const
                return [
                    tokenSymbol,
                    BigNutils(balance).minus(clausesValue.toBN).isBiggerThan(allFeeOptions[tokenSymbol].toBN),
                ] as const
            }),
        )
    }, [allFeeOptions, allTokens, clauses, isDelegated, isLoadingFees, tokens])

    const hasEnoughBalanceOnAny = useMemo(() => {
        return Object.values(hasEnoughBalanceOnToken).some(Boolean)
    }, [hasEnoughBalanceOnToken])

    const hasEnoughBalance = useMemo(() => {
        return hasEnoughBalanceOnToken[selectedToken]
    }, [hasEnoughBalanceOnToken, selectedToken])

    const memoized = useMemo(
        () => ({
            hasEnoughBalance,
            hasEnoughBalanceOnAny,
            hasEnoughBalanceOnToken,
        }),
        [hasEnoughBalance, hasEnoughBalanceOnAny, hasEnoughBalanceOnToken],
    )

    return memoized
}
