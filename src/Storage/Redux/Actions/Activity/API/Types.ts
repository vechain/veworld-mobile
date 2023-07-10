import { OutputResponse } from "~Model"
import { PaginationResponse } from "~Networking"

export interface BaseTransactionResponse {
    id: string
    blockId: string
    blockNumber: number
    blockTimestamp: number
}

export interface TransactionsResponse extends BaseTransactionResponse {
    size: number
    chainTag: number
    blockRef: string
    expiration: number
    clauses: Connex.VM.Clause[]
    gasPriceCoef: number
    gas: number
    dependsOn: string
    nonce: string
    gasUsed: number
    gasPayer: string
    paid: string
    reward: string
    reverted: true
    origin: string
    outputs: OutputResponse[]
}

export interface FetchTransactionsResponse {
    data: TransactionsResponse[]
    pagination: PaginationResponse
}

export enum EventTypeResponse {
    FUNGIBLE_TOKEN = "FUNGIBLE_TOKEN",
    VET = "VET",
    NFT = "NFT",
    SEMI_FUNGIBLE_TOKEN = "SEMI_FUNGIBLE_TOKEN",
}

export interface IncomingTransferResponse extends BaseTransactionResponse {
    txId: string
    from: string
    to: string
    value: string
    tokenAddress: string
    topics: string[]
    eventType: EventTypeResponse
}

export interface FetchIncomingTransfersResponse {
    data: IncomingTransferResponse[]
    pagination: PaginationResponse
}

export type FetchBlockResponse = {
    blockId: string
    number: number
    size: number
    parentID: string
    timestamp: number
    gasLimit: number
    beneficiary: string
    gasUsed: number
    totalScore: number
    txsRoot: string
    txsFeatures: number
    stateRoot: string
    receiptsRoot: string
    com: boolean
    signer: string
    isTrunk: boolean
    isFinalized: boolean
    transactions: FetchTransactionsResponse[]
}
