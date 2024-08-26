import { abi, Transaction } from "thor-devkit"
import { debug } from "~Utils/Logger"
import {
    ClauseType,
    ClauseWithMetadata,
    ConnexClause,
    DappTxActivity,
    FungibleTokenWithBalance,
    NonFungibleToken,
    SwapEvent,
    SwapResult,
    Token,
    TransactionOutcomes,
    TransferEventResult,
} from "~Model"
import { BigNumber } from "bignumber.js"
import { abis, ERROR_EVENTS, VET } from "~Constants"
import HexUtils from "~Utils/HexUtils"
import axios from "axios"
import BigNutils from "~Utils/BigNumberUtils"

export const TRANSFER_SIG = new abi.Function(abis.VIP180.transfer).signature

export const SWAP_EXACT_VET_FOR_TOKENS_SIG = new abi.Function(abis.RouterV2.swapExactVETForTokens).signature

export const SWAP_VET_FOR_EXACT_TOKENS_SIG = new abi.Function(abis.RouterV2.swapVETForExactTokens).signature

export const SWAP_EXACT_TOKENS_FOR_TOKENS_SIG = new abi.Function(abis.RouterV2.swapExactTokensForTokens).signature

export const SWAP_TOKENS_FOR_EXACT_VET_SIG = new abi.Function(abis.RouterV2.swapTokensForExactVET).signature

export const SWAP_EXACT_TOKENS_FOR_VET_SIG = new abi.Function(abis.RouterV2.swapExactTokensForVET).signature

export const SWAP_EXACT_ETH_FOR_TOKENS_SIG = new abi.Function(abis.UniswapRouterV2.swapExactETHForTokens).signature

export const SWAP_EXACT_TOKENS_FOR_ETH_SIG = new abi.Function(abis.UniswapRouterV2.swapExactTokensForETH).signature

export const NFT_TRANSFER_SIG = new abi.Function(abis.VIP181.transferFrom).signature

export const SWAP_EVENT_SIG = new abi.Event(abis.UniswapPairV2.SwapEvent).signature

/*
 * Note: Fungible Token & NFT Transfer events have the same signature
 */
export const TRANSFER_EVENT_SIG = new abi.Event(abis.VIP180.TransferEvent).signature

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

/**
 * Checks if a clause represents an NFT transfer.
 *
 * @param clause - The clause to check.
 * @returns true if the clause represents an NFT, false otherwise.
 */
export const isNFTTransferClause = (clause: Connex.VM.Clause): boolean => {
    return clause.data?.startsWith(NFT_TRANSFER_SIG) || false
}

/**
 * Returns the contract address of the clause. If the clause represents a VET transfer,
 * Then the VET address is returned. If the clause is a token transfer or NFT transfer,
 * then the contract address is returned.
 *
 * Note: the contract address is the `to` field of the clause.s
 *
 * @param clause - The clause to check.
 * @returns the contract address of the clause.
 */
export const getContractAddressFromClause = (clause: Connex.VM.Clause): string | undefined => {
    if (isVETtransferClause(clause)) return VET.address
    if (isTokenTransferClause(clause) || isNFTTransferClause(clause)) {
        const contractAddress = clause.to?.toLowerCase()
        return contractAddress
    }

    return undefined
}

export const getAmountFromClause = (clause: Connex.VM.Clause): string | undefined => {
    if (isVETtransferClause(clause)) return new BigNumber(clause.value).toString()
    if (isTokenTransferClause(clause)) {
        const decoded = decodeTokenTransferClause(clause)

        return decoded?.amount
    }

    return undefined
}

/**
 * Encodes a transaction clause for a fungible token transfer operation.
 *
 * This function takes the token details (address, receiver, and value), constructs
 * the payload, and returns an encoded transaction clause object.
 *
 * @param {string} tokenAddress - The blockchain address of the token contract.
 * @param {string} to - The blockchain address of the recipient of the token transfer.
 * @param {number} value - The value of token to transfer.
 *
 * @returns {Connex.VM.Clause} The encoded clause representing the token transfer operation.
 */
export const encodeTransferFungibleTokenClause = (
    to: string,
    value: string,
    tokenAddress: string,
): Connex.VM.Clause => {
    const hexValue = "0x" + new BigNumber(value).toString(16)

    if (tokenAddress === VET.address)
        return {
            to,
            value: hexValue,
            data: "0x",
        }

    const clauseData = new abi.Function(abis.VIP180.transfer).encode(to, hexValue)

    return {
        to: tokenAddress,
        value: "0x0",
        data: clauseData,
    }
}

/**
 * Encodes a transaction clause for a non-fungible token transfer operation.
 *
 * This function accepts details about the NFT transfer, including sender's address,
 * recipient's address, contract address, and the token ID. It then constructs
 * the payload and returns an encoded transaction clause object representing the
 * non-fungible token transfer.
 *
 * @param {string} from - The blockchain address of the sender initiating the NFT transfer.
 * @param {string} to - The blockchain address of the recipient of the NFT transfer.
 * @param {string} contractAddress - The blockchain address of the NFT contract.
 * @param {number} tokenId - The unique identifier of the token to be transferred.
 *
 * @returns {Connex.VM.Clause} The encoded clause representing the non-fungible token transfer operation.
 */
export const encodeTransferNonFungibleTokenClause = (
    from: string,
    to: string,
    contractAddress: string,
    tokenId: number,
) => {
    const hexTokenId = "0x" + new BigNumber(tokenId).toString(16)

    const clauseData = new abi.Function(abis.VIP181.transferFrom).encode(from, to, hexTokenId)

    return {
        to: contractAddress,
        value: "0x0",
        data: clauseData,
    }
}

/**
 * Decodes a clause as a token transfer clause.
 *
 * @param clause - The clause to decode.
 * @returns The decoded clause as a token transfer clause, or null if the clause cannot be decoded.
 */
export const decodeTokenTransferClause = (clause: Connex.VM.Clause): { to: string; amount: string } | null => {
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
            debug(ERROR_EVENTS.UTILS, "Failed to decode parameters", e)
        }
    }

    return null
}

/**
 * Decodes a clause as a non-fungible token (NFT) transfer clause.
 *
 * This function accepts a clause and tries to decode it as an NFT transfer clause.
 * If the data in the clause starts with the NFT_TRANSFER_SIG signature, it tries to
 * decode the parameters using the VIP181 'transferFrom' ABI inputs. In case of a
 * successful decoding, it returns an object with the details of the NFT transfer
 * (including 'from', 'to', and 'tokenId'). Otherwise, it logs the error and returns null.
 *
 * @param {Connex.VM.Clause} clause - The clause to decode.
 * @returns {Object|null} An object with 'from', 'to', and 'tokenId' properties if the clause
 * could be successfully decoded as an NFT transfer clause; null otherwise.
 */
export const decodeNonFungibleTokenTransferClause = (
    clause: Connex.VM.Clause,
): { from: string; to: string; tokenId: string } | null => {
    if (clause.data?.startsWith(NFT_TRANSFER_SIG)) {
        try {
            const decoded = abi.decodeParameters(
                abis.VIP181.transferFrom.inputs,
                "0x" + clause.data.slice(NFT_TRANSFER_SIG.length),
            )

            return {
                from: decoded.from,
                to: decoded.to,
                tokenId: decoded.tokenId,
            }
        } catch (e) {
            debug(ERROR_EVENTS.UTILS, "Failed to decode parameters", e)
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
            const decoded = abi.decodeParameters(paramters, "0x" + clause.data.slice(methodSignature.length))
            return {
                ...clause,
                type: clauseType,
                to: decoded.to,
                data: clause.data,
                path: decoded.path,
            }
        } catch (e) {
            debug(ERROR_EVENTS.UTILS, "Failed to decode parameters", e)
        }
    }

    return null
}

export const decodeSwapEvent = (event: Connex.VM.Event): SwapEvent | null => {
    if (event.topics[0]?.startsWith(SWAP_EVENT_SIG)) {
        try {
            const decoded = new abi.Event(abis.UniswapPairV2.SwapEvent).decode(event.data, event.topics)

            return {
                sender: decoded.sender,
                amount0In: decoded.amount0In,
                amount1In: decoded.amount1In,
                amount0Out: decoded.amount0Out,
                amount1Out: decoded.amount1Out,
                to: decoded.to,
            }
        } catch (e) {
            debug(ERROR_EVENTS.UTILS, "Failed to decode parameters", e)
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
export const decodeSwapExactVETForTokensClause = (clause: Connex.VM.Clause): ClauseWithMetadata | null => {
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
export const decodeSwapVETForExactTokensClause = (clause: Connex.VM.Clause): ClauseWithMetadata | null => {
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
export const decodeSwapTokensForExactVETClause = (clause: Connex.VM.Clause): ClauseWithMetadata | null => {
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
export const decodeSwapExactTokensForVETClause = (clause: Connex.VM.Clause): ClauseWithMetadata | null => {
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
export const decodeSwapExactTokensForTokensClause = (clause: Connex.VM.Clause): ClauseWithMetadata | null => {
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
export const decodeSwapExactETHForTokensClause = (clause: Connex.VM.Clause): ClauseWithMetadata | null => {
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
export const decodeSwapExactTokensForETHClause = (clause: Connex.VM.Clause): ClauseWithMetadata | null => {
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
export const interpretClauses = (message: Connex.Vendor.TxMessage, tokens: Token[]): TransactionOutcomes => {
    const result: TransactionOutcomes = []

    message.forEach((clause: ConnexClause) => {
        const contractClauses: TransactionOutcomes = interpretContractClause(clause, tokens)

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
export const interpretContractClause = (clause: ConnexClause, tokens: Token[]): TransactionOutcomes => {
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
export const interpretContractCall = (clause: ConnexClause, tokens: Token[]) => {
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

        // Check if the clause is a known contract call defined by a decoder method
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

/**
 * Checks if a clause is of type "swap".
 *
 * @param clause - The clause object with metadata.
 *
 * @returns A boolean indicating whether the clause is of type "swap".
 */
export const isSwapClause = (clause: ClauseWithMetadata) => {
    return (
        clause.type === ClauseType.SWAP_TOKENS_FOR_VET ||
        clause.type === ClauseType.SWAP_VET_FOR_TOKENS ||
        clause.type === ClauseType.SWAP_TOKENS_FOR_TOKENS
    )
}

/**
 * Checks if a transaction is a "swap" transaction.
 *
 * @param outcomes - The array of transaction outcomes.
 *
 * @returns A boolean indicating whether the transaction is a "swap" transaction.
 */
export const isSwapTransaction = (outcomes: TransactionOutcomes) => {
    return outcomes.filter(isSwapClause).length === 1
}

/**
 * Decodes and finds swap events from an array of events.
 *
 * @param events - The array of VM events.
 *
 * @returns An array of decoded swap events.
 */
export const findAndDecodeSwapEvents = (events: Connex.VM.Event[]) => {
    const decodedEvents: SwapEvent[] = []

    for (const event of events) {
        const decodedEvent = decodeSwapEvent(event)
        if (decodedEvent) decodedEvents.push(decodedEvent)
    }

    return decodedEvents
}

/**
 * Extracts paid and received amounts from a decoded swap event.
 *
 * @param decodedSwapEvent - The decoded swap event.
 *
 * @returns An object containing paid and received amounts.
 */
export const extractEventAmounts = (decodedSwapEvent: SwapEvent) => {
    const paidAmount = decodedSwapEvent.amount0In !== "0" ? decodedSwapEvent.amount0In : decodedSwapEvent.amount1In

    const receivedAmount =
        decodedSwapEvent.amount0Out !== "0" ? decodedSwapEvent.amount0Out : decodedSwapEvent.amount1Out

    return { paidAmount, receivedAmount }
}

/**
 * Validates the length of decoded swap events.
 *
 * @param decodedSwapEvents - The array of decoded swap events.
 * @param expectedLength - The expected length of the array.
 *
 * @throws Will throw an error if the length of decodedSwapEvents does not match the expectedLength.
 */
export const validateSwapEvents = (decodedSwapEvents: SwapEvent[], expectedLength: number) => {
    if (decodedSwapEvents.length !== expectedLength)
        throw new Error(`Invalid swap event count, expected ${expectedLength}`)
}

/**
 * Decodes swap transfer amounts from decoded clauses.
 *
 * @param decodedClauses - The transaction outcomes.
 * @param activity - The connected app transaction activity.
 *
 * @returns An object containing paid and received token addresses and their respective amounts, or null if the transaction is not a swap transaction.
 *
 * @throws Will throw an error under several circumstances, e.g., if the transaction is not a swap transaction, if no swap events could be found or decoded, or if the swap clause path is invalid.
 */
export const decodeSwapTransferAmounts = (
    decodedClauses: TransactionOutcomes,
    activity: DappTxActivity,
): SwapResult | null => {
    if (!isSwapTransaction(decodedClauses)) throw new Error("Transaction is not a swap transaction")

    if (!activity.outputs) throw new Error("Could not find transaction outputs")

    const events = activity.outputs.flatMap(output => output.events)
    const decodedSwapEvents = findAndDecodeSwapEvents(events)

    if (decodedSwapEvents.length === 0) throw new Error("Could not find or decode swap events")

    const swapClause = decodedClauses.find(isSwapClause)

    if (!swapClause?.path || swapClause.path.length < 2) throw new Error("Invalid swap clause path")

    let paidTokenAddress, receivedTokenAddress, paidAmount, receivedAmount

    const firstTokenAddress = swapClause.path[0]
    const secondTokenAddress = swapClause.path[swapClause.path.length - 1]

    switch (swapClause?.type) {
        case ClauseType.SWAP_TOKENS_FOR_VET:
            validateSwapEvents(decodedSwapEvents, 1)
            ;({ paidAmount, receivedAmount } = extractEventAmounts(decodedSwapEvents[0]))

            paidTokenAddress = firstTokenAddress
            receivedTokenAddress = VET.address

            break
        case ClauseType.SWAP_VET_FOR_TOKENS:
            validateSwapEvents(decodedSwapEvents, 1)
            ;({ paidAmount, receivedAmount } = extractEventAmounts(decodedSwapEvents[0]))

            paidTokenAddress = VET.address
            receivedTokenAddress = secondTokenAddress

            break
        case ClauseType.SWAP_TOKENS_FOR_TOKENS:
            validateSwapEvents(decodedSwapEvents, 2)

            paidAmount = extractEventAmounts(decodedSwapEvents[0]).paidAmount

            receivedAmount = extractEventAmounts(decodedSwapEvents[1]).receivedAmount

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

export const fromBody = (txBody: Transaction.Body, delegate: boolean) => {
    return delegate ? toDelegation(txBody) : new Transaction(txBody)
}

/**
 * send signed transaction with thorest apis
 */
export const sendSignedTransaction = async (tx: Transaction, networkUrl: string) => {
    const encodedRawTx = {
        raw: HexUtils.addPrefix(tx.encode().toString("hex")),
    }

    const response = await axios.post(`${networkUrl}/transactions`, encodedRawTx)

    return response.data.id as string
}

export const prepareNonFungibleClause = (
    accountFrom: string,
    addressTo: string,
    nft?: NonFungibleToken,
): Transaction.Body["clauses"] => {
    if (!nft) return []

    const func = new abi.Function(abis.VIP181.transferFrom)
    const data = func.encode(accountFrom, addressTo, nft.tokenId)

    return [
        {
            to: nft.address,
            value: "0x0",
            data: data,
        },
    ]
}

export const prepareFungibleClause = (
    amount: string,
    _token: FungibleTokenWithBalance,
    addressTo: string,
): Transaction.Body["clauses"] => {
    let _amount = BigNutils(amount).addTrailingZeros(_token.decimals).toHex
    const amountWithPrefix = "0x" + _amount

    // if vet
    if (_token.symbol === VET.symbol) {
        return [
            {
                to: addressTo,
                value: amountWithPrefix,
                data: "0x",
            },
        ]
    }

    const func = new abi.Function(abis.VIP180.transfer)
    const data = func.encode(addressTo, amountWithPrefix)

    return [
        {
            to: _token.address,
            value: "0x0",
            data: data,
        },
    ]
}

/**
 * Decodes a Transfer event which can be a Token Transfer or a NFT Transfer
 *
 * @param event - The Virtual Machine event.
 * @returns An object containing the from, to and value of the token transfer event, or the from, to, and tokenId of the NFT transfer event.
 * Returns null if the event is not a token transfer or NFT transfer event.
 */
export const decodeTransferEvent = (event: Connex.VM.Event): TransferEventResult | null => {
    if (event.topics[0]?.toLowerCase().startsWith(TRANSFER_EVENT_SIG.toLowerCase())) {
        const isNFTTransferEvent = event.topics.length === 4
        const isFungibleTokenTransferEvent = event.topics.length === 3

        try {
            if (isNFTTransferEvent) {
                const decodedNFTTransferEvent = new abi.Event(abis.VIP181.TransferEvent).decode(
                    event.data,
                    event.topics,
                )

                return {
                    from: decodedNFTTransferEvent.from,
                    to: decodedNFTTransferEvent.to,
                    tokenId: decodedNFTTransferEvent.tokenId,
                }
            } else if (isFungibleTokenTransferEvent) {
                const decodedTokenTransferEvent = new abi.Event(abis.VIP180.TransferEvent).decode(
                    event.data,
                    event.topics,
                )

                return {
                    from: decodedTokenTransferEvent.from,
                    to: decodedTokenTransferEvent.to,
                    value: decodedTokenTransferEvent.value,
                }
            }
        } catch (e) {
            debug(ERROR_EVENTS.UTILS, "Failed to decode parameters", e)
        }
    }

    return null
}
