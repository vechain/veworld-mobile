import { abi } from "thor-devkit"
import { BigNumber } from "bignumber.js"
import { ClauseType, ClauseWithMetadata, Token, ConnexClause } from "~Model"
import { ThorConstants, TokenConstants, error } from "~Common"

/**
 * Function lifted from Sync2 with some modifications
 *
 * It will interpret the Connex.Vendor.TxMessage and create extra clauses if needed
 *  - Eg. If clause specifies VET transfer AND a contract call in 1 clause, it will split that clause in 2
 *
 * @param message - the connex transaction request message
 * @param tokens - the tokens to check the message against
 */
const interpretClauses = (
    message: Connex.Vendor.TxMessage,
    tokens: Token[],
): ClauseWithMetadata[] => {
    const result: ClauseWithMetadata[] = []

    message.forEach((clause: ConnexClause) => {
        const contractClauses: ClauseWithMetadata[] = interpretContractClauses(
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
                tokenSymbol: TokenConstants.VET.symbol,
                amount: amount.toNumber(),
                to: clause.to,
                data: "0x",
            })
        }
    })

    return result
}

const interpretContractClauses = (
    clause: ConnexClause,
    tokens: Token[],
): ClauseWithMetadata[] => {
    const result: ClauseWithMetadata[] = []

    if (clause.to) {
        const contractCalls = interpretContractCalls(clause, tokens)
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

const interpretContractCalls = (clause: ConnexClause, tokens: Token[]) => {
    const result: ClauseWithMetadata[] = []

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
                data: clause.data || "0x",
            })
        }
    }

    return result
}

const TRANSFER_SIG = new abi.Function(ThorConstants.abis.vip180.transfer)
    .signature

//Function lifted from Sync2 with some modifications
const decodeAsTokenTransferClause = (
    clause: Connex.VM.Clause,
    token: Token,
): { to: string; amount: string } | null => {
    let { data, to } = clause
    data = data || ""
    to = to && to.toLowerCase()

    if (to === token.address && data.startsWith(TRANSFER_SIG)) {
        try {
            const decoded = abi.decodeParameters(
                ThorConstants.abis.vip180.transfer.inputs,
                "0x" + data.slice(TRANSFER_SIG.length),
            )
            return {
                to: decoded.to,
                amount: decoded.amount,
            }
        } catch (e) {
            error("Failed to decode parameters", e)
        }
    }
    return null
}

export default {
    interpretClauses,
}
