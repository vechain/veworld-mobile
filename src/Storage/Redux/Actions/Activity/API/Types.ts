import { OutputResponse } from "~Model"

export interface BaseTransactionResponse {
    id: string
    blockId: string
    blockNumber: number
    blockTimestamp: number
}

export interface FetchTransactionsResponse extends BaseTransactionResponse {
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

export enum EventTypeResponse {
    FUNGIBLE_TOKEN = "FUNGIBLE_TOKEN",
    VET = "VET",
}

export interface FetchIncomingTransfersResponse
    extends BaseTransactionResponse {
    txId: string
    from: string
    to: string
    value: number
    tokenAddress: string
    topics: string[]
    eventType: EventTypeResponse
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
