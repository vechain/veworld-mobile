import { abi, Transaction } from "thor-devkit"
import { abis } from "~Common/Constant/Thor/ThorConstants"
import { debug } from "~Common/Logger"
import { ClauseType, ConnexClause, Token, TransactionOutcomes } from "~Model"
import { BigNumber } from "bignumber.js"
import { VET } from "~Common/Constant"

export const TRANSFER_SIG = new abi.Function(abis.vip180.transfer).signature

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
    let { data } = clause
    data = data || ""

    return data.startsWith(TRANSFER_SIG)
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
    let { data } = clause
    data = data || ""

    if (data.startsWith(TRANSFER_SIG)) {
        try {
            const decoded = abi.decodeParameters(
                abis.vip180.transfer.inputs,
                "0x" + data.slice(TRANSFER_SIG.length),
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
        // If it's not a KNOWN token transfer, then it's an UNKNOWN contract call
        if (!isTokenTransfer) {
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

export const toDelegation = (txBody: Transaction.Body) => {
    const tx = new Transaction(txBody)
    tx.body.reserved = { features: 1 }
    return tx
}
