import { DIRECTIONS } from "~Constants"

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
    icon: {
        url: string
        mime: string
    }
    balanceOf: number
    isExactCount: boolean
    nfts: NonFungibleToken[]
    isBlacklisted: boolean
    totalSupply: number
}

export interface NonFungibleToken extends TokenMetadata, WithID {
    owner: string
    tokenId: string
    tokenURI?: string
    belongsToCollectionAddress: string
    isBlacklisted: boolean
}

export interface WithID {
    id: string
}

export interface TokenMetadata {
    name?: string
    description?: string
    image: string
    icon: {
        url: string
        mime: string
    }
    edition?: number
    tokenId?: string
    rank?: number
    rarity?: number
    attributes?: { trait_type: string; value: string }[]
    contract_address?: string
    token_id?: string
    image_mime_type?: string
    edition_count?: number
    categories?: any[]
    minted_at?: number
    creator?: string
    external_url?: string
    scores?: { trait_type: string; value: number }[]
    date?: number
    collection?: {
        family: string
        name: string
    }
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

export enum NFTMediaType {
    IMAGE = "image",
    VIDEO = "video",
}
