import { Transaction, TransactionClause } from "@vechain/sdk-core"
import { ethers } from "ethers"
import _ from "lodash"
import { abis, VET } from "~Constants"
import BigNutils, { BigNumberUtils } from "~Utils/BigNumberUtils"
import { SimpleAccountABI } from "../../VechainWalletKit/utils/abi"

/* -------------------------- helpers -------------------------- */
const lowercaseClauseMap = (clause: TransactionClause): TransactionClause => ({
    ...clause,
    to: clause.to?.toLowerCase() || null,
    data: clause.data?.toLowerCase() || "0x",
    value: clause.value === "0x" ? "0x" : `0x${BigNutils(clause.value).toHex.toLowerCase()}`,
})

const simpleAccountIface = new ethers.utils.Interface(SimpleAccountABI)

const parseSmartAccountData = (data?: string) => {
    if (!data || data === "0x") return null
    try {
        return simpleAccountIface.parseTransaction({ data })
    } catch {
        console.log("not a SimpleAccount call")
        return null // not a SimpleAccount call
    }
}

const isSmartAccountTransaction = (clause: TransactionClause): boolean => {
    const parsed = parseSmartAccountData(clause.data)
    return parsed?.name === "executeBatchWithAuthorization" || parsed?.name === "executeWithAuthorization"
}

const extractClausesFromExecuteBatch = (clause: TransactionClause): TransactionClause[] => {
    const parsed = parseSmartAccountData(clause.data!)
    if (!parsed || parsed.name !== "executeBatchWithAuthorization") return []

    const [addrs, values, datas] = parsed.args as [string[], ethers.BigNumber[], string[]]
    return addrs.map((to, i) => ({
        to: to || null,
        value: values[i].toHexString(),
        data: datas[i],
    }))
}

const extractClausesFromExecute = (clause: TransactionClause): TransactionClause[] => {
    const parsed = parseSmartAccountData(clause.data!)
    if (!parsed || parsed.name !== "executeWithAuthorization") return []

    const [to, value, calldata] = parsed.args as [string, ethers.BigNumber, string]
    return [
        {
            to: to || null,
            value: value.toHexString(),
            data: calldata,
        },
    ]
}

/* -------------------------- types -------------------------- */
export type GenericDelegatorTransactionValidationResultValid = { valid: true }
export type GenericDelegatorTransactionValidationResultInvalid = {
    valid: false
    metadata: Record<string, unknown>
    reason: string
}
export type GenericDelegatorTransactionValidationResult =
    | GenericDelegatorTransactionValidationResultValid
    | GenericDelegatorTransactionValidationResultInvalid

/* --------------------- base-tx validation --------------------- */
export const validateGenericDelegatorTx = async (
    baseTransaction: Transaction,
    genericDelegatorTransaction: Transaction,
    delegationToken: string,
    selectedFee: BigNumberUtils,
): Promise<GenericDelegatorTransactionValidationResult> => {
    const baseTxClauses = baseTransaction.body.clauses.map(lowercaseClauseMap)
    const genericTxClauses = genericDelegatorTransaction.body.clauses.map(lowercaseClauseMap)

    const difference = _.differenceWith(genericTxClauses, baseTxClauses, _.isEqual)
    if (difference.length !== 1) {
        return {
            valid: false,
            reason: "CLAUSES_DIFF",
            metadata: { difference, sentClauses: baseTxClauses },
        }
    }

    return validateFeeClause(difference[0], delegationToken, selectedFee)
}

/* -------------------- fee-clause validation ------------------- */
const validateFeeClause = (
    clause: TransactionClause,
    delegationToken: string,
    selectedFee: BigNumberUtils,
): GenericDelegatorTransactionValidationResult => {
    console.log("validating fee clause")
    if (delegationToken === VET.symbol) {
        if (
            selectedFee.clone().minus(BigNutils(clause.value).toBN).div(selectedFee.clone().toBN).toBN.abs().gt("0.1")
        ) {
            return {
                valid: false,
                reason: "OVER_THRESHOLD",
                metadata: {
                    fee: selectedFee.clone().toBigInt.toString(),
                    valueSent: BigNutils(clause.value).toBigInt.toString(),
                },
            }
        }
        if (clause.data !== "0x") {
            return {
                valid: false,
                reason: "SENT_DATA",
                metadata: { data: clause.data },
            }
        }
        console.log(`validating delegationToken fee clause true ${delegationToken}`)
        return { valid: true }
    }

    const iface = new ethers.utils.Interface([abis.VIP180.transfer])
    let decoded: ethers.utils.Result
    try {
        decoded = iface.decodeFunctionData("transfer", clause.data)
    } catch {
        return {
            valid: false,
            reason: "NOT_ERC20_TRANSFER",
            metadata: { data: clause.data },
        }
    }

    if (
        selectedFee
            .clone()
            .minus(BigNutils(decoded.amount?.toString()).toBN)
            .div(selectedFee.clone().toBN)
            .toBN.abs()
            .gt("0.1")
    ) {
        return {
            valid: false,
            reason: "OVER_THRESHOLD",
            metadata: {
                fee: selectedFee.clone().toBigInt.toString(),
                valueSent: BigNutils(decoded.amount?.toString()).toBigInt.toString(),
            },
        }
    }

    return { valid: true }
}

export const validateGenericDelegatorTxSmartAccount = async (
    genericDelegatorTransaction: Transaction,
    delegationToken: string,
    selectedFee: BigNumberUtils,
    depositAccount: string,
): Promise<GenericDelegatorTransactionValidationResult> => {
    console.log("validating generic delegator tx smart account")
    const genericTxClauses = genericDelegatorTransaction.body.clauses.map(lowercaseClauseMap)
    const expandedGenericClauses: TransactionClause[] = []

    for (const clause of genericTxClauses) {
        if (isSmartAccountTransaction(clause)) {
            console.log("is smart account transaction")
            const parsedName = parseSmartAccountData(clause.data!)!.name

            const clauses =
                parsedName === "executeBatchWithAuthorization"
                    ? extractClausesFromExecuteBatch(clause)
                    : extractClausesFromExecute(clause)
            console.log("clauses", parsedName)
            expandedGenericClauses.push(...clauses)
        } else {
            expandedGenericClauses.push(clause)
        }
    }

    const normalizedExpandedClauses = expandedGenericClauses.map(lowercaseClauseMap)
    console.log("normalizedExpandedClauses", normalizedExpandedClauses)

    const delegationFeeClauses = normalizedExpandedClauses.filter(clause => {
        if (delegationToken === VET.symbol) {
            return clause.to?.toLowerCase() === depositAccount.toLowerCase()
        }
        try {
            const iface = new ethers.utils.Interface([abis.VIP180.transfer])

            const decoded = iface.decodeFunctionData("transfer", clause.data)
            console.log("decoded", decoded, depositAccount)
            console.log("decoded amount", decoded.amount)
            console.log("decoded recipient", decoded[0])
            return decoded[0].toLowerCase() === depositAccount.toLowerCase()
        } catch {
            console.log("not a transfer call")
            return false
        }
    })

    let validationResult: GenericDelegatorTransactionValidationResult = {
        valid: false,
        reason: "NO_DELEGATION_FEE_CLAUSE",
        metadata: { depositAccount, expandedClauses: normalizedExpandedClauses },
    }
    if (!delegationFeeClauses || delegationFeeClauses.length === 0) {
        return validationResult
    }

    for (const clause of normalizedExpandedClauses) {
        validationResult = validateFeeClause(clause, delegationToken, selectedFee)
        if (validationResult.valid) {
            return validationResult
        }
    }
    return validationResult
}
