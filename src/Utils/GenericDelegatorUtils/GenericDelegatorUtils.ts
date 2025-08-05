import { Transaction, TransactionClause, ABIFunction, Hex } from "@vechain/sdk-core"
import { ethers } from "ethers"
import _ from "lodash"
import { keccak256 } from "@ethersproject/keccak256"
import { toUtf8Bytes } from "@ethersproject/strings"
import { abis, VET } from "~Constants"
import BigNutils, { BigNumberUtils } from "~Utils/BigNumberUtils"
import { SimpleAccountABI } from "~VechainWalletKit/utils/abi"

const lowercaseClauseMap = (clause: TransactionClause): TransactionClause => ({
    ...clause,
    to: clause.to?.toLowerCase() || null,
    data: clause.data?.toLowerCase() || "0x",
    value: clause.value === "0x" ? "0x" : `0x${BigNutils(clause.value).toHex.toLowerCase()}`,
})

// Helper function to calculate function selector from ABI
export const getFunctionSelector = (abi: readonly any[], functionName: string): string => {
    const functionABI = abi.find((fn: any) => fn.name === functionName)
    if (!functionABI) {
        throw new Error(`Function ${functionName} not found in ABI`)
    }
    const signature = `${functionABI.name}(${functionABI.inputs.map((input: any) => input.type).join(",")})`
    return keccak256(toUtf8Bytes(signature)).slice(0, 10)
}

const isSmartAccountTransaction = (clause: TransactionClause): boolean => {
    if (!clause.data || clause.data === "0x") return false

    try {
        const executeBatchSelector = getFunctionSelector(SimpleAccountABI, "executeBatchWithAuthorization")
        const executeSelector = getFunctionSelector(SimpleAccountABI, "executeWithAuthorization")

        return (
            clause.data.toLowerCase().startsWith(executeBatchSelector.toLowerCase()) ||
            clause.data.toLowerCase().startsWith(executeSelector.toLowerCase())
        )
    } catch {
        return false
    }
}

const extractClausesFromExecuteBatch = (clause: TransactionClause): TransactionClause[] => {
    try {
        const executeBatchAbi = new ABIFunction(
            SimpleAccountABI.find(fn => fn.name === "executeBatchWithAuthorization")!,
        )
        const decodedData = executeBatchAbi.decodeData(Hex.of(clause.data!))

        const addresses = decodedData.args![0] as string[]
        const values = decodedData.args![1] as BigInt[]
        const dataArray = decodedData.args![2] as string[]

        return addresses.map((to, index) => ({
            to: to || null,
            value: `0x${values[index].toString(16)}`,
            data: dataArray[index],
        }))
    } catch {
        return []
    }
}

const extractClausesFromExecute = (clause: TransactionClause): TransactionClause[] => {
    try {
        const executeAbi = new ABIFunction(SimpleAccountABI.find(fn => fn.name === "executeWithAuthorization")!)
        const decodedData = executeAbi.decodeData(Hex.of(clause.data!))

        return [
            {
                to: (decodedData.args![0] as string) || null,
                value: `0x${(decodedData.args![1] as BigInt).toString(16)}`,
                data: decodedData.args![2] as string,
            },
        ]
    } catch {
        return []
    }
}

export type GenericDelegatorTransactionValidationResultValid = {
    valid: true
}
export type GenericDelegatorTransactionValidationResultInvalid = {
    valid: false
    metadata: Record<string, unknown>
    reason: string
}
export type GenericDelegatorTransactionValidationResult =
    | GenericDelegatorTransactionValidationResultValid
    | GenericDelegatorTransactionValidationResultInvalid

export const validateGenericDelegatorTx = async (
    baseTransaction: Transaction,
    genericDelegatorTransaction: Transaction,
    delegationToken: string,
    selectedFee: BigNumberUtils,
): Promise<GenericDelegatorTransactionValidationResult> => {
    const baseTxClauses = baseTransaction.body.clauses.map(lowercaseClauseMap)
    const genericTxClauses = genericDelegatorTransaction.body.clauses.map(lowercaseClauseMap)

    const difference = _.differenceWith(genericTxClauses, baseTxClauses, _.isEqual)

    //Check if the generic tx includes all the clauses of base tx clauses
    if (difference.length !== 1)
        return {
            valid: false,
            reason: "CLAUSES_DIFF",
            metadata: { difference, sentClauses: baseTxClauses },
        }

    const [lastClause] = difference
    return validateFeeClause(lastClause, delegationToken, selectedFee)
}

const validateFeeClause = (
    clause: TransactionClause,
    delegationToken: string,
    selectedFee: BigNumberUtils,
): GenericDelegatorTransactionValidationResult => {
    if (delegationToken === VET.symbol) {
        //Check if the amount of VET sent is off by more than 10%
        if (selectedFee.clone().minus(BigNutils(clause.value).toBN).div(selectedFee.clone().toBN).toBN.abs().gt("0.1"))
            return {
                valid: false,
                reason: "OVER_THRESHOLD",
                metadata: {
                    fee: selectedFee.clone().toBigInt.toString(),
                    valueSent: BigNutils(clause.value).toBigInt.toString(),
                },
            }
        //Check if it's trying sending some code
        if (clause.data !== "0x")
            return {
                valid: false,
                reason: "SENT_DATA",
                metadata: { data: clause.data },
            }
        return { valid: true }
    }
    //Check ERC-20 tokens
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
    //Check if the amount of tokens sent is off by more than 1%
    if (
        selectedFee
            .clone()
            .minus(BigNutils(decoded.amount?.toString()).toBN)
            .div(selectedFee.clone().toBN)
            .toBN.abs()
            .gt("0.1")
    )
        return {
            valid: false,
            reason: "OVER_THRESHOLD",
            metadata: {
                fee: selectedFee.clone().toBigInt.toString(),
                valueSent: BigNutils(decoded.amount?.toString()).toBigInt.toString(),
            },
        }
    return { valid: true }
}

export const validateGenericDelegatorTxSmartAccount = async (
    genericDelegatorTransaction: Transaction,
    delegationToken: string,
    selectedFee: BigNumberUtils,
    depositAccount: string,
): Promise<GenericDelegatorTransactionValidationResult> => {
    const genericTxClauses = genericDelegatorTransaction.body.clauses.map(lowercaseClauseMap)

    // Extract nested clauses from smart account transactions
    const expandedGenericClauses: TransactionClause[] = []

    const executeBatchSelector = getFunctionSelector(SimpleAccountABI, "executeBatchWithAuthorization")
    const executeSelector = getFunctionSelector(SimpleAccountABI, "executeWithAuthorization")

    for (const clause of genericTxClauses) {
        if (isSmartAccountTransaction(clause)) {
            // Check if it's executeBatch or execute based on function selector
            if (clause.data!.toLowerCase().startsWith(executeBatchSelector.toLowerCase())) {
                // executeBatchWithAuthorization
                expandedGenericClauses.push(...extractClausesFromExecuteBatch(clause))
            } else if (clause.data!.toLowerCase().startsWith(executeSelector.toLowerCase())) {
                // executeWithAuthorization
                expandedGenericClauses.push(...extractClausesFromExecute(clause))
            }
        } else {
            expandedGenericClauses.push(clause)
        }
    }

    const normalizedExpandedClauses = expandedGenericClauses.map(lowercaseClauseMap)

    // Find the delegation fee clause by matching the depositAccount
    const delegationFeeClause = normalizedExpandedClauses.find(clause => {
        if (delegationToken === VET.symbol) {
            // For VET transfers, check if the 'to' address matches depositAccount
            return clause.to?.toLowerCase() === depositAccount.toLowerCase()
        } else {
            // For ERC-20 transfers, decode the transfer function and check the recipient
            try {
                const iface = new ethers.utils.Interface([abis.VIP180.transfer])
                const decoded = iface.decodeFunctionData("transfer", clause.data)
                return decoded.recipient?.toLowerCase() === depositAccount.toLowerCase()
            } catch {
                return false
            }
        }
    })

    if (!delegationFeeClause) {
        return {
            valid: false,
            reason: "NO_DELEGATION_FEE_CLAUSE",
            metadata: { depositAccount, expandedClauses: normalizedExpandedClauses },
        }
    }

    // Validate the fee clause
    return validateFeeClause(delegationFeeClause, delegationToken, selectedFee)
}
