/* eslint-disable @typescript-eslint/no-shadow */
import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { uniqBy } from "lodash"
import { NonFungibleToken, NonFungibleTokenCollection } from "~Model"
import {
    BlackListedCollections,
    Collections,
    CollectionWithPagination,
    NFTs,
} from "../Types/Nft"
import { PaginationResponse } from "~Networking"

type NftSliceState = {
    collectionsPerAccount: Collections
    NFTsPerAccount: NFTs

    blackListedCollectionsPerAccount: BlackListedCollections

    isLoading: boolean
    error: string | undefined
}

export const initialStateNft: NftSliceState = {
    collectionsPerAccount: {},
    NFTsPerAccount: {},

    blackListedCollectionsPerAccount: {},

    isLoading: false,
    error: undefined,
}

// todo.vas - add testnet state
// Note: To test, replace `accountAddress - address` with `ACCOUNT_WITH_NFTS` to get an account with numerous NFT collections and NFTs.
export const NftSlice = createSlice({
    name: "nft",
    initialState: initialStateNft,
    reducers: {
        // SET COLLECTIONS
        setCollections: (
            state,
            action: PayloadAction<{
                currentAccountAddress: string
                collectiondata: CollectionWithPagination
            }>,
        ) => {
            const { collectiondata, currentAccountAddress } = action.payload

            if (!state.collectionsPerAccount[currentAccountAddress]) {
                state.collectionsPerAccount[currentAccountAddress] = {
                    collections: [],
                    pagination: {
                        countLimit: 0,
                        hasNext: false,
                        hasCount: true,
                        totalElements: 0,
                        totalPages: 0,
                    },
                }
            }

            let uniqueCollections = [
                ...state.collectionsPerAccount[currentAccountAddress]
                    .collections,
                ...collectiondata.collections,
            ]

            const allUnique = uniqBy(uniqueCollections, "address")
            state.collectionsPerAccount[currentAccountAddress] = {
                collections: allUnique,
                pagination: collectiondata.pagination,
            }

            return state
        },

        // SET BLACKLISTED COLLECTIONS
        setBlackListCollection: (
            state,
            action: PayloadAction<{
                collection: NonFungibleTokenCollection
                accountAddress: string
            }>,
        ) => {
            const { collection, accountAddress } = action.payload

            collection.isBlacklisted = true

            if (!state.blackListedCollectionsPerAccount[accountAddress]) {
                state.blackListedCollectionsPerAccount[accountAddress] = {
                    collections: [],
                }
            }

            let allCollections = [
                ...state.blackListedCollectionsPerAccount[accountAddress]
                    .collections,
                collection,
            ]

            const uniqueCollections = uniqBy(allCollections, "address")

            state.blackListedCollectionsPerAccount[accountAddress] = {
                collections: uniqueCollections,
            }

            return state
        },

        // REMOVE BLACKLISTED COLLECTIONS
        removeBlackListCollection: (
            state,
            action: PayloadAction<{
                collection: NonFungibleTokenCollection
                accountAddress: string
            }>,
        ) => {
            const { collection, accountAddress } = action.payload

            const filteredCollections = state.blackListedCollectionsPerAccount[
                accountAddress
            ].collections.filter(col => col.address !== collection.address)

            state.blackListedCollectionsPerAccount[accountAddress].collections =
                filteredCollections

            return state
        },

        // SET NFTS
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
                            hasCount: true,
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
                        hasCount: true,
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

        // SET NETWORKING SIDE EFFECTS
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

        // TODO.vas -> Bugged - Not removing collections from state
        refreshNFTs: (
            state,
            action: PayloadAction<{ accountAddress: string }>,
        ) => {
            const { accountAddress } = action.payload

            delete state.collectionsPerAccount[accountAddress]

            return state
        },

        resetNftState: () => initialStateNft,
    },
})

export const {
    setBlackListCollection,
    setCollections,
    setNetworkingSideEffects,
    removeBlackListCollection,
    setNFTs,
    resetNftState,
    refreshNFTs,
} = NftSlice.actions
