import { NonFungibleToken, NonFungibleTokenCollection } from "~Model"
import { PaginationResponse } from "~Networking"

// COLLECTIONS
export type NFTBlackListedItem = {
    tokenId: string
    collectionsAddress: string
}

export type CollectionWithPagination = {
    collections: NonFungibleTokenCollection[]
    pagination: PaginationResponse
}

export type Collections = Record<string, CollectionWithPagination>

// NFTS
export type NFTs = {
    [accountAddress: string]: {
        [collectionAddress: string]: {
            NFTs: NonFungibleToken[]
            pagination: PaginationResponse
        }
    }
}
