export enum DelegationStatus {
    NONE = "NONE",
    QUEUED = "QUEUED",
    ACTIVE = "ACTIVE",
    EXITING = "EXITING",
    EXITED = "EXITED",
}

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
