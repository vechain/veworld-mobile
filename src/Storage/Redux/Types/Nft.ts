import { NonFungibleToken, NonFungibleTokenCollection } from "~Model"
import { GithubCollectionResponse, PaginationResponse } from "~Networking"

// COLLECTIONS
export type CollectionWithPagination = {
    collections: NonFungibleTokenCollection[]
    pagination: PaginationResponse
}

export type Collections = {
    [accountAddress: string]: CollectionWithPagination
}

// Collection Registry Info
export type CollectionRegistryInfo = {
    [network: string]: GithubCollectionResponse[]
}

// NFTS
export type NFTs = {
    [accountAddress: string]: {
        [collectionAddress: string]: {
            NFTs: NonFungibleToken[]
            pagination: PaginationResponse
        }
    }
}

// BLACKLISTED COLLECTIONS
export type BlackListedCollections = {
    [network: string]: {
        [accountAddress: string]: {
            collections: NonFungibleTokenCollection[]
        }
    }
}
