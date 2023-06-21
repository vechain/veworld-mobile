/* eslint-disable @typescript-eslint/no-shadow */
import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { uniqBy } from "lodash"
import { NonFungibleToken, NonFungibleTokenCollection } from "~Model"
import { Collections, CollectionWithPagination, NFTs } from "../Types/Nft"
import { PaginationResponse } from "~Networking"

type NftSliceState = {
    collectionsPerAccount: Collections
    NFTsPerAccount: NFTs

    blackListedCollections: NonFungibleTokenCollection[]
    blackListedNFTs: NonFungibleToken[]

    isLoading: boolean
    error: string | undefined
}

export const initialStateNft: NftSliceState = {
    collectionsPerAccount: {},
    NFTsPerAccount: {},

    blackListedCollections: [],
    blackListedNFTs: [],

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
                        countLimit: 0,
                        hasNext: false,
                        isExactCount: true,
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
            action: PayloadAction<{ collection: NonFungibleTokenCollection }>,
        ) => {
            const { collection } = action.payload

            collection.isBlacklisted = true

            const allCollections = [...state.blackListedCollections, collection]
            const uniqueCollections = uniqBy(allCollections, "address")

            state.blackListedCollections = uniqueCollections

            return state
        },

        removeBlackListCollection: (
            state,
            action: PayloadAction<{ collection: NonFungibleTokenCollection }>,
        ) => {
            const { collection } = action.payload

            const filteredCollections = state.blackListedCollections.filter(
                col => col.address !== collection.address,
            )

            state.blackListedCollections = filteredCollections

            return state
        },

        setNFTs: (
            state,
            action: PayloadAction<{
                address: string
                collectionAddress: string
                NFTs: NonFungibleToken[]
                pagination: PaginationResponse
            }>,
        ) => {
            const { address, collectionAddress, NFTs, pagination } =
                action.payload

            // comes the first time
            if (!state.NFTsPerAccount[address]) {
                state.NFTsPerAccount[address] = {
                    [collectionAddress]: {
                        NFTs: [],
                        pagination: {
                            countLimit: 0,
                            hasNext: false,
                            isExactCount: true,
                            totalElements: 0,
                            totalPages: 0,
                        },
                    },
                }
            }

            // comes every time the users loads NFTs from a new collection
            if (!state.NFTsPerAccount[address][collectionAddress]) {
                state.NFTsPerAccount[address][collectionAddress] = {
                    NFTs: [],
                    pagination: {
                        countLimit: 0,
                        hasNext: false,
                        isExactCount: true,
                        totalElements: 0,
                        totalPages: 0,
                    },
                }
            }

            let uniqueNFTs = [
                ...state.NFTsPerAccount[address][collectionAddress].NFTs,
                ...NFTs,
            ]

            const allUnique = uniqBy(uniqueNFTs, "id")
            state.NFTsPerAccount[address][collectionAddress].NFTs = allUnique

            state.NFTsPerAccount[address][collectionAddress].pagination =
                pagination

            return state
        },
    },
})

export const {
    setBlackListCollection,
    setCollections,
    setNetworkingSideEffects,
    removeBlackListCollection,
    setNFTs,
} = NftSlice.actions
