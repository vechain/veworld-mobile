import { Transaction } from "thor-devkit"
import { FungibleToken } from "~Model/Token"
import { InspectableOutput } from "~Services/AbiService"

export enum ClauseType {
    DEPLOY_CONTRACT = "deploy_contract",
    TRANSFER = "transfer",
    CONTRACT_CALL = "contract_call",
    NFT_APPROVE = "nft_approve",
    SWAP_VET_FOR_TOKENS = "swap_vet_for_tokens",
    SWAP_TOKENS_FOR_VET = "swap_tokens_for_vet",
    SWAP_TOKENS_FOR_TOKENS = "swap_tokens_for_tokens",
}

export type TransactionOutcomes = ClauseWithMetadata[]

export interface ClauseWithMetadata extends Transaction.Clause {
    type: ClauseType
    amount?: number
    tokenSymbol?: string
    tokenId?: string
    path?: string[]
    comment?: string
    abi?: object
}

export type ConnexClause = Connex.VM.Clause & {
    comment?: string
    abi?: object
}

export interface ConnexTransactionData {
    transaction: Transaction
    delegationSignature?: Buffer
    isReverted: boolean
    clauses: TransactionOutcomes
    txMessage: Connex.Vendor.TxMessage
    txOptions: Connex.Signer.TxOptions
    sender: string
}

export interface TransactionWithRevertData {
    txBody: Transaction.Body
    isReverted: boolean
}

export type EstimateGasResult = {
    caller: string
    gas: number
    reverted: boolean
    revertReason: string
    vmError: string
    baseGasPrice: string
    outputs: InspectableOutput[]
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

export type SwapEvent = {
    sender: string
    amount0In: string
    amount1In: string
    amount0Out: string
    amount1Out: string
    to: string
}

export type TransferEvent = {
    from: string
    to: string
    value?: string
    tokenId?: string
}

export type SwapResult = {
    paidAmount: string
    paidTokenAddress: string
    receivedAmount: string
    receivedTokenAddress: string
}

export type TransferEventResult = {
    from: string
    to: string
    tokenId?: string
    value?: string
}

export enum TransactionOrigin {
    FROM = "from",
    TO = "to",
}

export interface TransferEventResponse {
    address: string
    topics: string[]
    data: string
    meta: {
        blockID: string
        blockNumber: number
        blockTimestamp: number
        txID: string
        txOrigin: string
        clauseIndex: number
    }
    obsolete: boolean
}

export interface VetTransferEvent {
    amount: string
    meta: {
        blockID: string
        blockNumber: number
        blockTimestamp: number
        clauseIndex: number
        txID: string
        txOrigin: string
    }
    recipient: string
    sender: string
}

export enum TransactionType {
    NFT = "NFT",
    TOKEN = "TOKEN",
    VET = "VET",
}
