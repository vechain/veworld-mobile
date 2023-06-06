import { abi, Transaction } from "thor-devkit"
import { abis } from "~Common/Constant/Thor/ThorConstants"
import { debug } from "~Common/Logger"
import {
    ClauseType,
    ClauseWithMetadata,
    ConnectedAppTxActivity,
    ConnexClause,
    SwapEvent,
    SwapResult,
    Token,
    TransactionOutcomes,
} from "~Model"
import { BigNumber } from "bignumber.js"
import { VET } from "~Common/Constant"

export const TRANSFER_SIG = new abi.Function(abis.VIP180.transfer).signature

export const SWAP_EXACT_VET_FOR_TOKENS_SIG = new abi.Function(
    abis.RouterV2.swapExactVETForTokens,
).signature

export const SWAP_VET_FOR_EXACT_TOKENS_SIG = new abi.Function(
    abis.RouterV2.swapVETForExactTokens,
).signature

export const SWAP_EXACT_TOKENS_FOR_TOKENS_SIG = new abi.Function(
    abis.RouterV2.swapExactTokensForTokens,
).signature

export const SWAP_TOKENS_FOR_EXACT_VET_SIG = new abi.Function(
    abis.RouterV2.swapTokensForExactVET,
).signature

export const SWAP_EXACT_TOKENS_FOR_VET_SIG = new abi.Function(
    abis.RouterV2.swapExactTokensForVET,
).signature

export const SWAP_EXACT_ETH_FOR_TOKENS_SIG = new abi.Function(
    abis.UniswapRouterV2.swapExactETHForTokens,
).signature

export const SWAP_EXACT_TOKENS_FOR_ETH_SIG = new abi.Function(
    abis.UniswapRouterV2.swapExactTokensForETH,
).signature

export const SWAP_EVENT_SIG = new abi.Event(abis.UniswapPairV2.SwapEvent)
    .signature

/**
 * Checks if a clause represents a VET transfer.
 *
 * @param clause - The clause to check.
 * @returns true if the clause represents a VET transfer, false otherwise.
 */
export const isVETtransferClause = (clause: Connex.VM.Clause): boolean => {
    let { data, value } = clause
    return data === "0x" && Number(value) > 0
}

/**
 * Checks if a clause represents a token transfer.
 *
 * @param clause - The clause to check.
 * @returns true if the clause represents a token transfer, false otherwise.
 */
export const isTokenTransferClause = (clause: Connex.VM.Clause): boolean => {
    return clause.data?.startsWith(TRANSFER_SIG) || false
}

export const getTokenAddressFromClause = (
    clause: Connex.VM.Clause,
): string | undefined => {
    if (isVETtransferClause(clause)) return VET.address
    if (isTokenTransferClause(clause)) {
        const tokenAddress = clause.to?.toLowerCase()
        return tokenAddress
    }

    return undefined
}

export const getAmountFromClause = (
    clause: Connex.VM.Clause,
): string | undefined => {
    if (isVETtransferClause(clause)) return Number(clause.value).toString()
    if (isTokenTransferClause(clause)) {
        const decoded = decodeTokenTransferClause(clause)
        return decoded?.amount
    }

    return undefined
}

/**
 * Decodes a clause as a token transfer clause.
 *
 * @param clause - The clause to decode.
 * @returns The decoded clause as a token transfer clause, or null if the clause cannot be decoded.
 */
export const decodeTokenTransferClause = (
    clause: Connex.VM.Clause,
): { to: string; amount: string } | null => {
    if (clause.data?.startsWith(TRANSFER_SIG)) {
        try {
            const decoded = abi.decodeParameters(
                abis.VIP180.transfer.inputs,
                "0x" + clause.data.slice(TRANSFER_SIG.length),
            )
            return {
                to: decoded.to,
                amount: decoded.amount,
            }
        } catch (e) {
            debug("Failed to decode parameters", e)
        }
    }

    return null
}

/**
 * Decodes a clause from a contract that implements an Automated Market Maker (AMM) interface.
 *
 * @param clause - The clause to decode.
 * @param parameters - The parameters of the contract function being called.
 * @param methodSignature - The method signature of the contract function being called.
 * @param clauseType - The type of clause being interpreted.
 * @returns The decoded clause as a ClauseWithMetadata object, or null if the clause cannot be decoded.
 */
export const decodeAMMClause = (
    clause: Connex.VM.Clause,
    paramters: abi.Function.Parameter[],
    methodSignature: string,
    clauseType: ClauseType,
): ClauseWithMetadata | null => {
    if (clause.data?.startsWith(methodSignature)) {
        try {
            const decoded = abi.decodeParameters(
                paramters,
                "0x" + clause.data.slice(methodSignature.length),
            )
            return {
                ...clause,
                type: clauseType,
                to: decoded.to,
                data: clause.data,
                path: decoded.path,
            }
        } catch (e) {
            debug("Failed to decode parameters", e)
        }
    }

    return null
}

export const decodeSwapEvent = (event: Connex.VM.Event): SwapEvent | null => {
    if (event.topics[0]?.startsWith(SWAP_EVENT_SIG)) {
        try {
            const decoded = new abi.Event(abis.UniswapPairV2.SwapEvent).decode(
                event.data,
                event.topics,
            )

            return {
                sender: decoded.sender,
                amount0In: decoded.amount0In,
                amount1In: decoded.amount1In,
                amount0Out: decoded.amount0Out,
                amount1Out: decoded.amount1Out,
                to: decoded.to,
            }
        } catch (e) {
            debug("Failed to decode parameters", e)
        }
    }

    return null
}

/**
 * Decodes a clause that represents a swap of VET for tokens.
 *
 * @param clause - The clause to decode.
 * @returns The decoded clause as a ClauseWithMetadata object, or null if the clause cannot be decoded.
 */
export const decodeSwapExactVETForTokensClause = (
    clause: Connex.VM.Clause,
): ClauseWithMetadata | null => {
    return decodeAMMClause(
        clause,
        abis.RouterV2.swapExactVETForTokens.inputs,
        SWAP_EXACT_VET_FOR_TOKENS_SIG,
        ClauseType.SWAP_VET_FOR_TOKENS,
    )
}

/**
 * Decodes a clause that represents a swap of VET for a specified number of tokens.
 *
 * @param clause - The clause to decode.
 * @returns The decoded clause as a ClauseWithMetadata object, or null if the clause cannot be decoded.
 */
export const decodeSwapVETForExactTokensClause = (
    clause: Connex.VM.Clause,
): ClauseWithMetadata | null => {
    return decodeAMMClause(
        clause,
        abis.RouterV2.swapVETForExactTokens.inputs,
        SWAP_VET_FOR_EXACT_TOKENS_SIG,
        ClauseType.SWAP_VET_FOR_TOKENS,
    )
}

/**
 * Decodes a clause that represents a swap of tokens for a specified amount of VET.
 *
 * @param clause - The clause to decode.
 * @returns The decoded clause as a ClauseWithMetadata object, or null if the clause cannot be decoded.
 */
export const decodeSwapTokensForExactVETClause = (
    clause: Connex.VM.Clause,
): ClauseWithMetadata | null => {
    return decodeAMMClause(
        clause,
        abis.RouterV2.swapTokensForExactVET.inputs,
        SWAP_TOKENS_FOR_EXACT_VET_SIG,
        ClauseType.SWAP_TOKENS_FOR_VET,
    )
}

/**
 * Decodes a clause that represents a swap of tokens for VET.
 *
 * @param clause - The clause to decode.
 * @returns The decoded clause as a ClauseWithMetadata object, or null if the clause cannot be decoded.
 */
export const decodeSwapExactTokensForVETClause = (
    clause: Connex.VM.Clause,
): ClauseWithMetadata | null => {
    return decodeAMMClause(
        clause,
        abis.RouterV2.swapExactTokensForVET.inputs,
        SWAP_EXACT_TOKENS_FOR_VET_SIG,
        ClauseType.SWAP_TOKENS_FOR_VET,
    )
}

/**
 * Decodes a clause that represents a swap of one type of tokens for another type of tokens.
 *
 * @param clause - The clause to decode.
 * @returns The decoded clause as a ClauseWithMetadata object, or null if the clause cannot be decoded.
 */
export const decodeSwapExactTokensForTokensClause = (
    clause: Connex.VM.Clause,
): ClauseWithMetadata | null => {
    return decodeAMMClause(
        clause,
        abis.RouterV2.swapExactTokensForTokens.inputs,
        SWAP_EXACT_TOKENS_FOR_TOKENS_SIG,
        ClauseType.SWAP_TOKENS_FOR_TOKENS,
    )
}

/**
 * Decodes a clause that represents a swap of VET for tokens but with ETH method signature.
 *
 * @param clause - The clause to decode.
 * @returns The decoded clause as a ClauseWithMetadata object, or null if the clause cannot be decoded.
 */
export const decodeSwapExactETHForTokensClause = (
    clause: Connex.VM.Clause,
): ClauseWithMetadata | null => {
    return decodeAMMClause(
        clause,
        abis.UniswapRouterV2.swapExactETHForTokens.inputs,
        SWAP_EXACT_ETH_FOR_TOKENS_SIG,
        ClauseType.SWAP_VET_FOR_TOKENS,
    )
}

/**
 * Decodes a clause that represents a swap of tokens for VET but with ETH method signature.
 *
 * @param clause - The clause to decode.
 * @returns The decoded clause as a ClauseWithMetadata object, or null if the clause cannot be decoded.
 */
export const decodeSwapExactTokensForETHClause = (
    clause: Connex.VM.Clause,
): ClauseWithMetadata | null => {
    return decodeAMMClause(
        clause,
        abis.UniswapRouterV2.swapExactTokensForETH.inputs,
        SWAP_EXACT_TOKENS_FOR_ETH_SIG,
        ClauseType.SWAP_TOKENS_FOR_VET,
    )
}

/**
 * Decodes a clause as a token transfer clause given a specific token.
 *
 * @param clause - The clause to decode.
 * @param token - The specific token to check the clause against.
 * @returns The decoded clause as a token transfer clause, or null if the clause cannot be decoded.
 */
export const decodeAsTokenTransferClause = (
    clause: Connex.VM.Clause,
    token: Token,
): { to: string; amount: string } | null => {
    let to = clause.to?.toLowerCase()

    return to === token.address ? decodeTokenTransferClause(clause) : null
}

/**
 * Function lifted from Sync2 with some modifications
 *
 * It will interpret the Connex.Vendor.TxMessage and create extra clauses if needed
 *  - Eg. If clause specifies VET transfer AND a contract call in 1 clause, it will split that clause in 2
 *
 * @param message - the connex transaction request message
 * @param tokens - the tokens to check the message against
 */
export const interpretClauses = (
    message: Connex.Vendor.TxMessage,
    tokens: Token[],
): TransactionOutcomes => {
    const result: TransactionOutcomes = []

    message.forEach((clause: ConnexClause) => {
        const contractClauses: TransactionOutcomes = interpretContractClause(
            clause,
            tokens,
        )

        result.push(...contractClauses)

        // Interpret the clause value
        const amount = new BigNumber(clause.value)
        // If the value is a valid amount
        if (!amount.isZero() && !amount.isNaN()) {
            // Push the VET Clause
            result.unshift({
                ...clause,
                type: ClauseType.TRANSFER,
                tokenSymbol: VET.symbol,
                amount: amount.toNumber(),
                to: clause.to,
                data: "0x",
            })
        }
    })

    return result
}

/**
 * Interprets a contract clause and generates transaction outcomes.
 *
 * @param clause - The clause to interpret.
 * @param tokens - The tokens to check the clause against.
 * @returns An array of transaction outcomes.
 */
export const interpretContractClause = (
    clause: ConnexClause,
    tokens: Token[],
): TransactionOutcomes => {
    const result: TransactionOutcomes = []

    if (clause.to) {
        const contractCalls = interpretContractCall(clause, tokens)
        result.push(...contractCalls)
    } else {
        // contract creation
        result.push({
            ...clause,
            type: ClauseType.DEPLOY_CONTRACT,
            data: clause.data || "0x",
        })
    }

    return result
}

/**
 * Interprets a contract call clause and generates transaction outcomes.
 *
 * @param clause - The clause to interpret.
 * @param tokens - The tokens to check the clause against.
 * @returns An array of transaction outcomes.
 */
export const interpretContractCall = (
    clause: ConnexClause,
    tokens: Token[],
) => {
    const result: TransactionOutcomes = []

    if (clause.data && clause.data !== "0x") {
        let isTokenTransfer = false
        //Check the clause against the known tokens
        for (const token of tokens) {
            const r = decodeAsTokenTransferClause(clause, token)
            if (r) {
                isTokenTransfer = true
                // Found a KNOWN token transfer
                result.push({
                    ...clause,
                    type: ClauseType.TRANSFER,
                    tokenSymbol: token.symbol,
                    amount: new BigNumber(r.amount).toNumber(),
                    to: r.to,
                    data: "0x",
                })
                break
            }
        }

        // Check if the clause is a known contract call defined by a decoder mVETod
        let isDecodedClause = false
        if (!isTokenTransfer) {
            const decodedClause = decodeContractCall(clause)

            if (decodedClause) {
                isDecodedClause = true
                result.push(decodedClause)
            }
        }

        // If the clause has not been decoded, add as a contract call
        if (!isDecodedClause && !isTokenTransfer) {
            result.push({
                ...clause,
                type: ClauseType.CONTRACT_CALL,
                to: clause.to,
                data: clause.data,
            })
        }
    }

    return result
}

/**
 * Decodes a contract call clause by attempting to interpret it as various actions.
 * It sequentially tries to interpret the clause as a variety of token swap actions.
 *
 * @param clause - The contract call clause to be decoded.
 * @returns The decoded clause as a ClauseWithMetadata object, or null if the clause cannot be decoded as any of the specified swap actions.
 */
export const decodeContractCall = (clause: ConnexClause) => {
    let decodedClause =
        decodeSwapExactVETForTokensClause(clause) ??
        decodeSwapVETForExactTokensClause(clause) ??
        decodeSwapTokensForExactVETClause(clause) ??
        decodeSwapExactTokensForVETClause(clause) ??
        decodeSwapExactETHForTokensClause(clause) ??
        decodeSwapExactTokensForETHClause(clause) ??
        decodeSwapExactTokensForTokensClause(clause)

    return decodedClause
}

export const isSwapClause = (clause: ClauseWithMetadata) => {
    return (
        clause.type === ClauseType.SWAP_TOKENS_FOR_VET ||
        clause.type === ClauseType.SWAP_VET_FOR_TOKENS ||
        clause.type === ClauseType.SWAP_TOKENS_FOR_TOKENS
    )
}

export const isSwapTransaction = (outcomes: TransactionOutcomes) => {
    return outcomes.filter(isSwapClause).length === 1
}

export const findAndDecodeSwapEvents = (events: Connex.VM.Event[]) => {
    const decodedEvents: SwapEvent[] = []

    for (const event of events) {
        const decodedEvent = decodeSwapEvent(event)
        if (decodedEvent) decodedEvents.push(decodedEvent)
    }

    return decodedEvents
}

export const extractEventAmounts = (decodedSwapEvent: SwapEvent) => {
    const paidAmount =
        decodedSwapEvent.amount0In !== "0"
            ? decodedSwapEvent.amount0In
            : decodedSwapEvent.amount1In

    const receivedAmount =
        decodedSwapEvent.amount0Out !== "0"
            ? decodedSwapEvent.amount0Out
            : decodedSwapEvent.amount1Out

    return { paidAmount, receivedAmount }
}

export const validateSwapEvents = (
    decodedSwapEvents: SwapEvent[],
    expectedLength: number,
) => {
    if (decodedSwapEvents.length !== expectedLength)
        throw new Error(`Invalid swap event count, expected ${expectedLength}`)
}

export const decodeSwapTransferAmounts = (
    decodedClauses: TransactionOutcomes,
    activity: ConnectedAppTxActivity,
): SwapResult | null => {
    if (!isSwapTransaction(decodedClauses))
        throw new Error("Transaction is not a swap transaction")

    const events = activity.outputs.flatMap(output => output.events)
    const decodedSwapEvents = findAndDecodeSwapEvents(events)

    if (decodedSwapEvents.length === 0)
        throw new Error("Could not find or decode swap events")

    const swapClause = decodedClauses.find(isSwapClause)

    if (!swapClause?.path || swapClause.path.length < 2)
        throw new Error("Invalid swap clause path")

    let paidTokenAddress, receivedTokenAddress, paidAmount, receivedAmount

    const firstTokenAddress = swapClause.path[0]
    const secondTokenAddress = swapClause.path[swapClause.path.length - 1]

    switch (swapClause?.type) {
        case ClauseType.SWAP_TOKENS_FOR_VET:
            validateSwapEvents(decodedSwapEvents, 1)
            ;({ paidAmount, receivedAmount } = extractEventAmounts(
                decodedSwapEvents[0],
            ))

            paidTokenAddress = firstTokenAddress
            receivedTokenAddress = VET.address

            break
        case ClauseType.SWAP_VET_FOR_TOKENS:
            validateSwapEvents(decodedSwapEvents, 1)
            ;({ paidAmount, receivedAmount } = extractEventAmounts(
                decodedSwapEvents[0],
            ))

            paidTokenAddress = VET.address
            receivedTokenAddress = secondTokenAddress

            break
        case ClauseType.SWAP_TOKENS_FOR_TOKENS:
            validateSwapEvents(decodedSwapEvents, 2)

            paidAmount = extractEventAmounts(decodedSwapEvents[0]).paidAmount

            receivedAmount = extractEventAmounts(
                decodedSwapEvents[1],
            ).receivedAmount

            paidTokenAddress = firstTokenAddress
            receivedTokenAddress = secondTokenAddress

            break
    }

    return {
        paidAmount: paidAmount ?? "",
        paidTokenAddress: paidTokenAddress ?? "",
        receivedAmount: receivedAmount ?? "",
        receivedTokenAddress: receivedTokenAddress ?? "",
    }
}

export const toDelegation = (txBody: Transaction.Body) => {
    const tx = new Transaction(txBody)
    tx.body.reserved = { features: 1 }
    return tx
}
