import { Transaction, TransactionClause } from "@vechain/sdk-core"
import { ethers } from "ethers"
import _ from "lodash"
import { abis, VET } from "~Constants"
import { NETWORK_TYPE } from "~Model"
import { getGenericDelegatorDepositAccount } from "~Networking/GenericDelegator"
import AddressUtils from "~Utils/AddressUtils"
import BigNutils, { BigNumberUtils } from "~Utils/BigNumberUtils"

const lowercaseClauseMap = (clause: TransactionClause) => ({
    ...clause,
    to: clause.to?.toLowerCase(),
    data: clause.data?.toLowerCase(),
    value: clause.value === "0x" ? "0x" : `0x${BigNutils(clause.value).toHex.toLowerCase()}`,
})

export const validateGenericDelegatorTx = async (
    baseTransaction: Transaction,
    genericDelegatorTransaction: Transaction,
    delegationToken: string,
    networkType: NETWORK_TYPE,
    selectedFee: BigNumberUtils,
) => {
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

    const { depositAccount } = await getGenericDelegatorDepositAccount({
        networkType,
    })

    const [lastClause] = difference
    if (delegationToken === VET.symbol) {
        //Check if it's sending tokens to the deposit account
        if (!AddressUtils.compareAddresses(depositAccount, lastClause.to ?? undefined))
            return {
                valid: false,
                reason: "NOT_DEPOSIT_ACCOUNT",
                metadata: { depositAccount, to: lastClause.to },
            }
        //Check if the amount of VET sent is off by more than 10%
        if (
            selectedFee
                .clone()
                .minus(BigNutils(lastClause.value).toBN)
                .div(selectedFee.clone().toBN)
                .toBN.abs()
                .gt("0.1")
        )
            return {
                valid: false,
                reason: "OVER_THRESHOLD",
                metadata: {
                    fee: selectedFee.clone().toBigInt.toString(),
                    valueSent: BigNutils(lastClause.value).toBigInt.toString(),
                },
            }
        //Check if it's trying sending some code
        if (lastClause.data !== "0x")
            return {
                valid: false,
                reason: "SENT_DATA",
                metadata: { data: lastClause.data },
            }
        return { valid: true }
    }
    //Check ERC-20 tokens
    const iface = new ethers.utils.Interface([abis.VIP180.transfer])
    let decoded: ethers.utils.Result
    try {
        decoded = iface.decodeFunctionData("transfer", lastClause.data)
    } catch {
        return {
            valid: false,
            reason: "NOT_ERC20_TRANSFER",
            metadata: { data: lastClause.data },
        }
    }
    //Check if it's sending tokens to the deposit account
    if (!AddressUtils.compareAddresses(depositAccount, decoded.to ?? undefined))
        return {
            valid: false,
            reason: "NOT_DEPOSIT_ACCOUNT",
            metadata: { depositAccount, to: decoded.to },
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
