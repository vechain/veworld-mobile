export interface NodeInfo {
    nodeId: string
    nodeLevel: number
    xNodeOwner: string
    isLegacyNode: boolean
    vetAmountStaked: string
    accumulatedRewards: string
}

export interface NftData {
    tokenId: string
    levelId?: string
    vetAmountStaked?: string
    isDelegated?: boolean
    claimableRewards?: string
    accumulatedRewards?: string
}
