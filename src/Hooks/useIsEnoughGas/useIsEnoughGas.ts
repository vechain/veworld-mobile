import { useMemo } from "react"
import { useReceiptProcessor } from "~Components/Providers/ReceiptProcessorProvider"
import { B3TR, VET, VTHO } from "~Constants"
import { useMultipleTokensBalance } from "~Hooks/useTokenBalance"
import { FungibleToken } from "~Model"
import { InspectableOutput, ReceiptOutput } from "~Services/AbiService"
import { ReceiptProcessor } from "~Services/AbiService/ReceiptProcessor"
import { selectNetworkVBDTokens, selectOfficialTokens, useAppSelector } from "~Storage/Redux"
import { BigNumberUtils, BigNutils } from "~Utils"
import AddressUtils from "~Utils/AddressUtils"

type Args = {
    selectedToken: string
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
    origin,
    processor,
}: {
    transactionOutputs: InspectableOutput[]
    selectedToken: FungibleToken
    origin: string
    processor: ReceiptProcessor
}) => {
    const analyzedOutputs = processor.analyzeReceipt(transactionOutputs, origin)
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

const DELEGATION_TOKENS = [VTHO.symbol, B3TR.symbol, VET.symbol]

export const useIsEnoughGas = ({
    selectedToken,
    isDelegated,
    allFeeOptions,
    isLoadingFees,
    transactionOutputs,
    origin,
}: Args) => {
    const officialTokens = useAppSelector(selectOfficialTokens)
    const { B3TR: networkB3TR } = useAppSelector(selectNetworkVBDTokens)
    const addressesToCheck = useMemo(() => [VTHO.address, networkB3TR.address, VET.address], [networkB3TR.address])
    const { data: balances } = useMultipleTokensBalance(addressesToCheck)
    const getReceiptProcessor = useReceiptProcessor()
    const processor = useMemo(() => getReceiptProcessor(["Generic", "Native"]), [getReceiptProcessor])

    const hasEnoughBalanceOnToken = useMemo(() => {
        return Object.fromEntries(
            DELEGATION_TOKENS.map(tokenSymbol => {
                if (tokenSymbol === VET.symbol) {
                    console.log("tokenSymbol in", tokenSymbol)
                }
                //Always return true if it's either loading fees, fee options are not loaded yet or there are no transaction outputs.
                if (isLoadingFees || allFeeOptions === undefined || !transactionOutputs) {
                    if (tokenSymbol === VET.symbol) {
                        console.log("VET exiting early")
                        console.log("VET allFeeOptions", allFeeOptions)
                        console.log("VET transactionOutputs", transactionOutputs)
                    }
                    return [tokenSymbol, true] as const
                }
                //If the generic delegator fails and doesn't have the specific symbol, return false to not break the UI
                if (allFeeOptions[tokenSymbol] === undefined) {
                    if (tokenSymbol === VET.symbol) {
                        console.log("Gen del fails, allFeeOptions", allFeeOptions[tokenSymbol], allFeeOptions)
                    }
                    return [tokenSymbol, false] as const
                }
                const foundTmpToken = officialTokens.find(tk => tk.symbol === tokenSymbol)

                //If the token is not found in the list of official tokens, which is unlikely, return false.
                if (!foundTmpToken) return [tokenSymbol, false]
                const foundBalance = balances?.find(tk =>
                    AddressUtils.compareAddresses(tk.tokenAddress, foundTmpToken.address),
                )
                if (tokenSymbol === VET.symbol) {
                    console.log("foundBalance", foundBalance)
                }
                //If the balance is not found, then it's probably loading
                if (!foundBalance) return [tokenSymbol, true]
                const balance = foundBalance.balance

                const clausesValue = calculateClausesValue({
                    transactionOutputs,
                    selectedToken: foundTmpToken,
                    processor,
                    origin,
                })
                //Delegation with VTHO should count as "0" for fees
                if (tokenSymbol === VTHO.symbol && isDelegated)
                    return [tokenSymbol, BigNutils(balance).minus(clausesValue.toBN).isBiggerThanOrEqual("0")] as const

                if (tokenSymbol === VET.symbol) {
                    const balanceMinusClauses = BigNutils(balance).minus(clausesValue.toBN)
                    const feeRequired = allFeeOptions[tokenSymbol].toBN
                    const hasEnough = balanceMinusClauses.isBiggerThanOrEqual(feeRequired)
                    console.log("VET balance check:", {
                        balance,
                        clausesValue: clausesValue.toBN,
                        balanceMinusClauses: balanceMinusClauses.toBN,
                        feeRequired,
                        hasEnough,
                    })
                }

                return [
                    tokenSymbol,
                    BigNutils(balance).minus(clausesValue.toBN).isBiggerThanOrEqual(allFeeOptions[tokenSymbol].toBN),
                ] as const
            }),
        )
    }, [isLoadingFees, allFeeOptions, transactionOutputs, officialTokens, balances, processor, origin, isDelegated])

    // console.log("hasEnoughBalanceOnToken", hasEnoughBalanceOnToken)
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
