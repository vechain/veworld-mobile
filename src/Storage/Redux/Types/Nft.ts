import { NonFungibleTokenCollection } from "~Model"
import { PaginationResponse } from "~Networking"

export type NFTBlackListedItem = {
    tokenId: string
    collectionsAddress: string
}

export type CollectionWithPagination = {
    collections: NonFungibleTokenCollection[]
    pagination: PaginationResponse
}

export type Collections = Record<string, CollectionWithPagination>
