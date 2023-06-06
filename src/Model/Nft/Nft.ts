import { DIRECTIONS } from "~Common"

export interface NFTContract {
    name: string
    address: string
    genesisId: string
    custom: boolean
    icon?: string
    symbol?: string
    creator?: string
}

export interface NonFungibleTokenCollection {
    name: string
    address: string
    symbol: string
    creator: string
    description: string
    icon: string
    balanceOf: number
    nfts: NonFungibleToken[]
}

export interface NonFungibleToken extends TokenMetadata {
    owner: string
    tokenId: string
    tokenURI?: string
    belongsToCollectionAddress: string
    isHidden: boolean
}

export interface TokenMetadata {
    name?: string
    description?: string
    image: string
    edition?: number
    tokenId?: string
    rank?: number
    rarity?: number
    attributes?: { trait_type: string; value: string }[]
}

export interface SelectedNFT {
    contractAddress: string
    genesisId: string
}

export interface SelectedNFTs {
    [accountAddress: string]: SelectedNFT[]
}

export interface NFTTransferLog {
    meta: Connex.Thor.Filter.WithMeta["meta"]
    contract: NFTContract
    tokenId: string
    sender: string
    recipient: string
    timestamp: number
    index: number
    direction: DIRECTIONS
    transactionId: string
}
