import { components } from "~Generated/indexer/schema"

export type DelegationStatus = components["schemas"]["StargateToken"]["delegationStatus"]

export interface NodeInfo {
    nodeId: string
    nodeLevel: number
    xNodeOwner: string
    isLegacyNode: boolean
    vetAmountStaked: string
    accumulatedRewards: string
    delegationStatus: DelegationStatus
    validatorId: string | null
}

export interface NftData {
    tokenId: string
    levelId?: string
    vetAmountStaked?: string
    isDelegated?: boolean
    claimableRewards?: string
    accumulatedRewards?: string
}
