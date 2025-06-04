import { Transaction } from "@vechain/sdk-core"
import { ethers } from "ethers"
import _ from "lodash"
import { abis, VET } from "~Constants"
import { NETWORK_TYPE } from "~Model"
import { getGenericDelegatorDepositAccount } from "~Networking/GenericDelegator"
import AddressUtils from "~Utils/AddressUtils"
import BigNutils, { BigNumberUtils } from "~Utils/BigNumberUtils"

export const validateGenericDelegatorTx = async (
    baseTransaction: Transaction,
    genericDelegatorTransaction: Transaction,
    delegationToken: string,
    networkType: NETWORK_TYPE,
    selectedFee: BigNumberUtils,
) => {
    const baseTxClauses = baseTransaction.body.clauses
    const genericTxClauses = genericDelegatorTransaction.body.clauses

    //Check if just one clause was added
    if (baseTxClauses.length + 1 !== genericTxClauses.length) return false
    const difference = _.difference(genericTxClauses, baseTxClauses)
    //Check if the generic tx includes all the clauses of base tx clauses
    if (difference.length !== 1) return false
    // if (!_.isEqual(_.intersection(genericTxClauses, baseTxClauses), baseTxClauses)) return false

    const depositAccount = await getGenericDelegatorDepositAccount({ networkType })

    const [lastClause] = difference
    if (delegationToken === VET.symbol) {
        //Check if it's sending tokens to the deposit account
        if (!AddressUtils.compareAddresses(depositAccount, lastClause.to ?? undefined)) return false
        //Check if the amount of VET sent is off by more than 1%
        if (
            selectedFee
                .clone()
                .minus(BigNutils(lastClause.value).toBN)
                .div(selectedFee.clone().toBN)
                .toBN.abs()
                .gt("0.01")
        )
            return false
        //Check if it's trying sending some code
        if (lastClause.data !== "0x") return false
        return true
    }
    //Check ERC-20 tokens
    const iface = new ethers.utils.Interface([abis.VIP180.transfer])
    let decoded: ethers.utils.Result
    try {
        decoded = iface.decodeFunctionData("transfer", lastClause.data.slice(10))
    } catch (e) {
        return false
    }
    //Check if it's sending tokens to the deposit account
    if (!AddressUtils.compareAddresses(depositAccount, decoded[0] ?? undefined)) return false
    //Check if the amount of tokens sent is off by more than 1%
    if (
        selectedFee
            .clone()
            .minus(BigNutils(decoded[1]?.toString()).toBN)
            .div(selectedFee.clone().toBN)
            .toBN.abs()
            .gt("0.01")
    )
        return false
    return true
}
