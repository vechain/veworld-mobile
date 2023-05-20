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

export interface NonFungibleToken {
    collectionName: string
    contractAddress: string
    owner: string
    tokenId: string
    genesisId: string
    tokenURI?: string
    icon?: string
}

export interface SelectedNFT {
    contractAddress: string
    genesisId: string
}

export interface SelectedNFTs {
    [accountAddress: string]: SelectedNFT[]
}

export interface NFTStorageData extends StorageData {
    contracts: NFTContract[]
    tokens: NonFungibleToken[]
    selectedContracts: SelectedNFTs
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

export interface TokenMetadata {
    name: string
    description: string
    image: string
}

export interface StorageData {
    timeUpdated?: number
    nonce?: string
    appVersion: string
}
