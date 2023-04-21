import { Transaction } from "thor-devkit"
import { EstimateGasResult } from "~Common/Utils/GasUtils/GasUtils"
import { FungibleToken } from "~Model/Token"

export enum ClauseType {
    DEPLOY_CONTRACT = "deploy_contract",
    TRANSFER = "transfer",
    CONTRACT_CALL = "contract_call",
}

export type TransactionOutcomes = ClauseWithMetadata[]

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
    clauses: TransactionOutcomes
    txMessage: Connex.Vendor.TxMessage
    txOptions: Connex.Driver.TxOptions
    sender: string
}

export interface TransactionWithRevertData {
    txBody: Transaction.Body
    isReverted: boolean
}

export interface CreateBodyParams {
    thorClient: Connex.Thor
    clauses: Transaction.Clause[]
    caller: string
    dependsOn?: string | null
    suggestedGas?: number
    gasPayer?: string
    providedNonce?: string | number
    providedGas: EstimateGasResult
}

export interface TransferData {
    token: FungibleToken
    senderAddress: string
    destinationAddress: string
    amountToTransfer: string | number
}
