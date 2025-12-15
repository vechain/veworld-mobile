import { components } from "~Generated/indexer/schema"
import { IndexedHistoryEvent, OutputResponse } from "~Model"
import { PaginationResponse } from "~Networking"
import { StargateLevelName } from "~Utils/StargateUtils"

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

export interface FetchIncomingTransfersResponse {
    data: components["schemas"]["IndexedTransferEvent"][]
    pagination: PaginationResponse
}

export type FetchAppOverviewResponse = components["schemas"]["AppOverview"]

export interface FetchActivitiesResponse {
    data: IndexedHistoryEvent[]
    pagination: PaginationResponse
}

export enum StargateNFTLevel {
    Strength,
    Thunder,
    Mjolnir,
    VeThorX,
    StrengthX,
    ThunderX,
    MjolnirX,
    Dawn,
    Lightning,
    Flash,
}

export interface FetchStargateTokensResponseItem {
    tokenId: string
    level: StargateLevelName
    owner: string
    manager: string | null
    delegationStatus: string
    validatorId: string
    totalRewardsClaimed: string
    totalBootstrapRewardsClaimed: string
    vetStaked: string
    migrated: boolean
    boosted: boolean
}

export interface FetchStargateTokensResponse {
    data: FetchStargateTokensResponseItem[]
    pagination: PaginationResponse
}
