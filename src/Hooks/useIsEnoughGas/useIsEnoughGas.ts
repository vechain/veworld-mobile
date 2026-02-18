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
    isGasFeeSponsored?: boolean
    allFeeOptions:
        | {
              [token: string]: BigNumberUtils
          }
        | undefined
    isLoadingFees: boolean
    transactionOutputs: InspectableOutput[] | undefined
    origin: string
    isSmartWallet?: boolean
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
    isGasFeeSponsored = false,
    allFeeOptions,
    isLoadingFees,
    transactionOutputs,
    origin,
    isSmartWallet = false,
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
                //Always return true if it's either loading fees, fee options are not loaded yet or there are no transaction outputs.
                if (isLoadingFees || allFeeOptions === undefined || !transactionOutputs)
                    return [tokenSymbol, true] as const
                //If the generic delegator fails and doesn't have the specific symbol, return false to not break the UI
                if (allFeeOptions[tokenSymbol] === undefined) return [tokenSymbol, false] as const
                const foundTmpToken = officialTokens.find(tk => tk.symbol === tokenSymbol)
                //If the token is not found in the list of official tokens, which is unlikely, return false.
                if (!foundTmpToken) return [tokenSymbol, false]
                const foundBalance = balances?.find(tk =>
                    AddressUtils.compareAddresses(tk.tokenAddress, foundTmpToken.address),
                )
                //If the balance is not found, then it's probably loading
                if (!foundBalance) return [tokenSymbol, true]
                const balance = foundBalance.balance
                const clausesValue = calculateClausesValue({
                    transactionOutputs,
                    selectedToken: foundTmpToken,
                    processor,
                    origin,
                })

                // When delegation sponsorship covers gas fees (account delegation or custom URL delegator),
                // only ensure balance can cover the transfer clauses.
                if (isGasFeeSponsored)
                    return [tokenSymbol, BigNutils(balance).minus(clausesValue.toBN).isBiggerThanOrEqual("0")] as const

                //Delegation with VTHO should count as "0" for fees (only for non-smart wallets,
                //since smart wallets pay VTHO fees via the generic delegator)
                if (tokenSymbol === VTHO.symbol && isDelegated && !isSmartWallet)
                    return [tokenSymbol, BigNutils(balance).minus(clausesValue.toBN).isBiggerThanOrEqual("0")] as const

                return [
                    tokenSymbol,
                    BigNutils(balance).minus(clausesValue.toBN).isBiggerThanOrEqual(allFeeOptions[tokenSymbol].toBN),
                ] as const
            }),
        )
    }, [
        isLoadingFees,
        allFeeOptions,
        transactionOutputs,
        officialTokens,
        balances,
        processor,
        origin,
        isDelegated,
        isGasFeeSponsored,
        isSmartWallet,
    ])

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
