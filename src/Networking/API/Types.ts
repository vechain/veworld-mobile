import { IndexedHistoryEvent, OutputResponse } from "~Model"
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
    dependsOn: string | null
    nonce: string
    gasUsed: number
    gasPayer: string
    paid: string
    reward: string
    reverted: boolean
    origin: string
    outputs: OutputResponse[]
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
    tokenId: number
    tokenAddress: string
    topics: string[]
    eventType: EventTypeResponse
}

export interface FetchIncomingTransfersResponse {
    data: IncomingTransferResponse[]
    pagination: PaginationResponse
}

export interface FetchActivitiesResponse {
    data: IndexedHistoryEvent[]
    pagination: PaginationResponse
}

export type FetchFungibleTokensContractsResponse = {
    data: string[]
    pagination: PaginationResponse
}
