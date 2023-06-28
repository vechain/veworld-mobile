import { NonFungibleToken, NonFungibleTokenCollection } from "~Model"
import { PaginationResponse } from "~Networking"

// COLLECTIONS
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

// BLACLLISTED COLLECTIONS
export type BlackListedCollections = {
    [accountAddress: string]: {
        collections: NonFungibleTokenCollection[]
    }
}
