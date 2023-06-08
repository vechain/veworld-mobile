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

type Collections = Record<string, CollectionWithPagination>

type NftSliceState = {
    collectionsPerAccount: Collections
    blackListedCollections: NonFungibleTokenCollection[]
    blackListedNFTs: NFTBlackListedItem[]
    isLoading: boolean
    error: string | undefined
}

export const initialStateNft: NftSliceState = {
    blackListedCollections: [],
    blackListedNFTs: [],
    collectionsPerAccount: {},
    isLoading: false,
    error: undefined,
}

export const NftSlice = createSlice({
    name: "nft",
    initialState: initialStateNft,
    reducers: {
        setCollections: (
            state,
            action: PayloadAction<{
                address: string
                collectiondata: CollectionWithPagination
            }>,
        ) => {
            if (!state.collectionsPerAccount[action.payload.address]) {
                state.collectionsPerAccount[action.payload.address] = {
                    collections: [],
                    pagination: {
                        totalElements: 0,
                        totalPages: 0,
                    },
                }
            }

            let uniqueCollections = [
                ...state.collectionsPerAccount[action.payload.address]
                    .collections,
                ...action.payload.collectiondata.collections,
            ]

            const allUnique = uniqBy(uniqueCollections, "address")
            state.collectionsPerAccount[action.payload.address] = {
                collections: allUnique,
                pagination: action.payload.collectiondata.pagination,
            }

            return state
        },

        setNetworkingSideEffects: (
            state,
            action: PayloadAction<{
                isLoading: boolean
                error: string | undefined
            }>,
        ) => {
            state.isLoading = action.payload.isLoading
            state.error = action.payload.error
            return state
        },

        setBlackListCollection: (
            state,
            action: PayloadAction<NonFungibleTokenCollection>,
        ) => {
            const allCollections = [
                ...state.blackListedCollections,
                action.payload,
            ]
            const uniqueCollections = uniqBy(allCollections, "address")

            state.blackListedCollections = uniqueCollections

            return state
        },

        removeBlackListCollection: (
            state,
            action: PayloadAction<NonFungibleTokenCollection>,
        ) => {
            const filteredCollections = state.blackListedCollections.filter(
                collection => collection.address !== action.payload.address,
            )

            state.blackListedCollections = filteredCollections

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
    },
})

export const {
    setBlackListNFT,
    setBlackListCollection,
    setCollections,
    setNetworkingSideEffects,
    removeBlackListCollection,
} = NftSlice.actions
