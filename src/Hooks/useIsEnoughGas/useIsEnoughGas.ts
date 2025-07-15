import { TransactionClause } from "@vechain/sdk-core"
import { useMemo } from "react"
import { B3TR, VET, VTHO } from "~Constants"
import { FungibleToken, NETWORK_TYPE } from "~Model"
import { getReceiptProcessor, InspectableOutput, ReceiptOutput } from "~Services/AbiService"
import { selectAllTokens, selectSelectedNetwork, selectTokensWithBalances, useAppSelector } from "~Storage/Redux"
import { BigNumberUtils, BigNutils } from "~Utils"
import AddressUtils from "~Utils/AddressUtils"

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
    transactionOutputs: InspectableOutput[] | undefined
    origin: string
}

const calculateClausesValue = ({
    transactionOutputs,
    selectedToken,
    network,
    origin,
}: {
    transactionOutputs: InspectableOutput[]
    selectedToken: FungibleToken
    network: NETWORK_TYPE
    origin: string
}) => {
    const receiptProcessor = getReceiptProcessor(network, ["Generic", "Native"])
    const analyzedOutputs = receiptProcessor.analyzeReceipt(transactionOutputs, origin)
    const filtered: Extract<
        ReceiptOutput,
        | { name: "VET_TRANSFER(address,address,uint256)" }
        | { name: "Transfer(indexed address,indexed address,uint256)" }
    >[] = analyzedOutputs.filter(output => {
        if (selectedToken.symbol === "VET") {
            if (output.name !== "VET_TRANSFER(address,address,uint256)") return false
            if (!AddressUtils.compareAddresses(output.params.from, origin)) return false
            return true
        }
        if (output.name !== "Transfer(indexed address,indexed address,uint256)") return false
        if (!AddressUtils.compareAddresses(output.params.from, origin)) return false
        if (!AddressUtils.compareAddresses(output.address, selectedToken.address)) return false
        return true
    }) as any[]

    return filtered.reduce((acc, output) => {
        if (output.name === "VET_TRANSFER(address,address,uint256)") return acc.plus(output.params.amount.toString())
        return acc.plus(output.params.value.toString())
    }, BigNutils("0"))
}

export const useIsEnoughGas = ({
    selectedToken,
    isDelegated,
    allFeeOptions,
    isLoadingFees,
    transactionOutputs,
    origin,
}: Args) => {
    const allTokens = useAppSelector(selectAllTokens)
    const tokens = useAppSelector(selectTokensWithBalances)
    const network = useAppSelector(selectSelectedNetwork)

    const hasEnoughBalanceOnToken = useMemo(() => {
        const availableTokens = [VTHO.symbol, B3TR.symbol, VET.symbol]
        return Object.fromEntries(
            availableTokens.map(tokenSymbol => {
                if (isLoadingFees || allFeeOptions === undefined || !transactionOutputs)
                    return [tokenSymbol, true] as const
                if (allFeeOptions[tokenSymbol] === undefined) return [tokenSymbol, false] as const
                const foundTmpToken = allTokens.find(tk => tk.symbol === tokenSymbol)!
                const balance = tokens.find(tk => tk.symbol === tokenSymbol)?.balance?.balance ?? "0"
                const clausesValue = calculateClausesValue({
                    transactionOutputs,
                    selectedToken: foundTmpToken,
                    network: network.type,
                    origin,
                })
                //Delegation with VTHO should count as "0" for fees
                if (tokenSymbol === VTHO.symbol && isDelegated)
                    return [tokenSymbol, BigNutils(balance).minus(clausesValue.toBN).isBiggerThanOrEqual("0")] as const
                return [
                    tokenSymbol,
                    BigNutils(balance).minus(clausesValue.toBN).isBiggerThanOrEqual(allFeeOptions[tokenSymbol].toBN),
                ] as const
            }),
        )
    }, [allFeeOptions, allTokens, isDelegated, isLoadingFees, network.type, tokens, transactionOutputs, origin])

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
