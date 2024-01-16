import { NETWORK_TYPE, NonFungibleToken, NftCollection } from "~Model"
import { GithubCollectionResponse, PaginationResponse } from "~Networking"

// COLLECTIONS
export type CollectionWithPagination = {
    collections: NftCollection[]
    pagination: PaginationResponse
}

export type Collections = {
    [accountAddress: string]: CollectionWithPagination
}

// Collection Registry Info
export type CollectionRegistryInfo = {
    [network in NETWORK_TYPE]: GithubCollectionResponse[]
}

// NFTS
export type NFTs = {
    [accountAddress: string]: {
        [collectionAddress: string]: {
            nfts: NonFungibleToken[]
            pagination: PaginationResponse
        }
    }
}

// BLACKLISTED COLLECTIONS
export type BlackListedCollections = {
    [network in NETWORK_TYPE]: {
        [accountAddress: string]: {
            addresses: string[]
        }
    }
}
