import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { uniqBy } from "lodash"
import { NonFungibleTokenCollection } from "~Model"
import { PaginationResponse } from "~Networking"

type NFTBlackListedItem = {
    tokenId: string
    collectionsAddress: string
}

type CollectionWithPagination = {
    collections: NonFungibleTokenCollection[]
    pagination: PaginationResponse
}

type NftSliceState = {
    collections: CollectionWithPagination
    blackListedCollections: string[]
    blackListedNFTs: NFTBlackListedItem[]
}

export const initialStateNft: NftSliceState = {
    blackListedCollections: [],
    blackListedNFTs: [],
    collections: {
        collections: [],
        pagination: {
            totalElements: 0,
            totalPages: 0,
        },
    },
}

export const NftSlice = createSlice({
    name: "nft",
    initialState: initialStateNft,
    reducers: {
        setCollections: (
            state,
            action: PayloadAction<CollectionWithPagination>,
        ) => {
            let uniqueCollections = [
                ...state.collections.collections,
                ...action.payload.collections,
            ]

            state.collections = {
                collections: uniqBy(uniqueCollections, "address"),
                pagination: action.payload.pagination,
            }

            return state
        },

        // TODO set here adjust Nfts from selectors
        setBlackListNFT: (
            state,
            action: PayloadAction<{
                contractAddress: string
                tokenId: string
            }>,
        ) => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const _action = action
            return state
        },

        // TODO set here adjust collections from selectors
        setBlackListCollection: (
            state,
            action: PayloadAction<{ contractAddress: string }>,
        ) => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const _action = action
            return state
        },
    },
})

export const { setBlackListNFT, setBlackListCollection, setCollections } =
    NftSlice.actions
