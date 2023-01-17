import BigNumber from "bignumber.js"
import { Transaction } from "thor-devkit"
import { FungibleToken } from "../Token"

export enum ClauseType {
    DEPLOY_CONTRACT = "deploy_contract",
    TRANSFER = "transfer",
    CONTRACT_CALL = "contract_call",
}

export interface ClauseWithMetadata extends Transaction.Clause {
    type: ClauseType
    amount?: number
    tokenSymbol?: string
    comment?: string
    abi?: object
}

export interface ConnexTransactionData {
    transaction: Transaction
    delegationSignature?: Buffer
    isReverted: boolean
    clauses: ClauseWithMetadata[]
    txMessage: Connex.Vendor.TxMessage
    txOptions: Connex.Driver.TxOptions
    sender: string
}

export interface TransactionWithRevertData {
    txBody: Transaction.Body
    isReverted: boolean
}

export enum TransactionType {
    TOKEN_TRANSFER = "token_transfer",
    DAPP_TRANSACTION = "dapp_transaction",
}

export interface CreateBodyParams {
    thorClient: Connex.Thor
    clauses: Connex.Vendor.TxMessage
    caller: string
    dependsOn?: string | null
    suggestedGas?: number
    delegate?: boolean
    gasPayer?: string
    type: TransactionType
}

export interface TransferData {
    token: FungibleToken
    senderAddress: string
    destinationAddress: string
    amountToTransfer: BigNumber
}
