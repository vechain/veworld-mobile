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
    image: string
    mimeType?: string
    balanceOf: number
    hasCount: boolean
    isBlacklisted: boolean
    totalSupply?: number
}

export interface NonFungibleToken extends TokenMetadata, WithID {
    owner: string
    contractAddress: string
    tokenId: string
    tokenURI?: string
    isBlacklisted: boolean
    mimeType?: string
}

export interface WithID {
    id: string
}

export interface TokenMetadata
    extends ERC721Metadata,
        OpenSeaMetadata,
        WorldOfVMetadata {}

export interface WorldOfVMetadata {
    edition?: number
    rank?: number
    rarity?: number
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

export interface OpenSeaMetadata {
    image_data?: string
    external_url?: string
    background_color?: string
    animation_url?: string
    youtube_url?: string
    attributes?: { trait_type: string; value: string }[]
}

export interface ERC721Metadata {
    name: string
    description: string
    image: string
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
    TEXT = "text", // mp4 appears as text sometimes
}
