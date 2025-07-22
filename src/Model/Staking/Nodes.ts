export interface RawNodeInfo {
    nodeId: string
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
    tokenId: string
    levelId?: string
    vetAmountStaked?: string
    isDelegated?: boolean
    claimableRewards?: string
    accumulatedRewards?: string
}
