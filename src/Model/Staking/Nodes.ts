export interface RawNodeInfo {
    nodeId: number
    nodeLevel: number
    xNodeOwner: string
    isXNodeHolder: boolean
    isXNodeDelegated: boolean
    isXNodeDelegator: boolean
    isXNodeDelegatee: boolean
    delegatee: string
}

export interface NodeInfo extends RawNodeInfo {
    isLegacyNode: boolean
}

export interface NftData {
    tokenId: number
    levelId?: number
    vetAmountStaked?: string
    isDelegated?: boolean
    claimableRewards?: string
    accumulatedRewards?: string
}
