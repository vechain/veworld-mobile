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

export interface FetchAppOverviewResponse {
    appId: string
    roundId: number
    date: string
    totalRewardAmount: number
    actionsRewarded: number
    totalImpact: {
        carbon: number
        water: number
        energy: number
        waste_mass: number
        waste_items: number
        waste_reduction: number
        biodiversity: number
        people: number
        timber: number
        plastic: number
        education_time: number
        trees_planted: number
        calories_burned: number
        clean_energy_production_wh: number
        sleep_quality_percentage: number
    }
    rankByReward: number
    rankByActionsRewarded: number
    totalUniqueUserInteractions: number
}

export interface FetchActivitiesResponse {
    data: IndexedHistoryEvent[]
    pagination: PaginationResponse
}

export type FetchFungibleTokensContractsResponse = {
    data: string[]
    pagination: PaginationResponse
}

export interface FetchVeBetterUserGeneralOverviewResponse {
    wallet: string
    roundId: number
    date: string
    totalRewardAmount: number
    actionsRewarded: number
    totalImpact: {
        carbon: number
        water: number
        energy: number
        waste_mass: number
        waste_items: number
        waste_reduction: number
        biodiversity: number
        people: number
        timber: number
        plastic: number
        education_time: number
        trees_planted: number
        calories_burned: number
        clean_energy_production_wh: number
        sleep_quality_percentage: number
    }
    rankByReward: number
    rankByActionsRewarded: number
    uniqueXAppInteractions: string[]
}

export interface FetchVeBetterUserOverviewResponseItem {
    entity: string
    date: string
    totalRewardAmount: number
    actionsRewarded: number
    totalImpact: {
        carbon: number
        water: number
        energy: number
        waste_mass: number
        waste_items: number
        waste_reduction: number
        biodiversity: number
        people: number
        timber: number
        plastic: number
        education_time: number
        trees_planted: number
        calories_burned: number
        clean_energy_production_wh: number
        sleep_quality_percentage: number
    }
}
