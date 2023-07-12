/* eslint-disable @typescript-eslint/no-shadow */
import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { uniqBy } from "lodash"
import {
    NonFungibleToken,
    NonFungibleTokenCollection,
    NETWORK_TYPE,
} from "~Model"
import {
    BlackListedCollections,
    CollectionRegistryInfo,
    Collections,
    CollectionWithPagination,
    NFTs,
} from "../Types/Nft"
import { GithubCollectionResponse, PaginationResponse } from "~Networking"
import { debug } from "~Utils"

export type NftSliceState = {
    collectionRegistryInfo: CollectionRegistryInfo
    collectionsPerAccount: Collections
    NFTsPerAccount: NFTs

    blackListedCollectionsPerAccount: BlackListedCollections

    isLoading: boolean
    error: string | undefined
}

export const initialStateNft: NftSliceState = {
    collectionRegistryInfo: {
        [NETWORK_TYPE.MAIN]: [],
        [NETWORK_TYPE.TEST]: [],
        [NETWORK_TYPE.SOLO]: [],
        [NETWORK_TYPE.OTHER]: [],
    },
    collectionsPerAccount: {
        [NETWORK_TYPE.MAIN]: {},
        [NETWORK_TYPE.TEST]: {},
        [NETWORK_TYPE.SOLO]: {},
        [NETWORK_TYPE.OTHER]: {},
    },
    NFTsPerAccount: {
        [NETWORK_TYPE.MAIN]: {},
        [NETWORK_TYPE.TEST]: {},
        [NETWORK_TYPE.SOLO]: {},
        [NETWORK_TYPE.OTHER]: {},
    },
    blackListedCollectionsPerAccount: {
        [NETWORK_TYPE.MAIN]: {},
        [NETWORK_TYPE.TEST]: {},
        [NETWORK_TYPE.SOLO]: {},
        [NETWORK_TYPE.OTHER]: {},
    },

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
                network: string
                currentAccountAddress: string
                collectionData: CollectionWithPagination
            }>,
        ) => {
            const { network, collectionData, currentAccountAddress } =
                action.payload

            if (!state.collectionsPerAccount[network][currentAccountAddress]) {
                state.collectionsPerAccount[network][currentAccountAddress] = {
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
                ...state.collectionsPerAccount[network][currentAccountAddress]
                    .collections,
                ...collectionData.collections,
            ]

            const allUnique = uniqBy(uniqueCollections, "address")
            state.collectionsPerAccount[network][currentAccountAddress] = {
                collections: allUnique,
                pagination: collectionData.pagination,
            }

            return state
        },

        // SET COLLECTIONS REGISTRY INFO
        setCollectionRegistryInfo: (
            state,
            action: PayloadAction<{
                network: string
                registryInfo: GithubCollectionResponse[]
            }>,
        ) => {
            const { registryInfo, network } = action.payload

            if (
                state.collectionRegistryInfo[network].length ===
                registryInfo.length
            )
                return state

            debug(
                `Setting collection registry info ${registryInfo.length} for ${network}`,
            )

            state.collectionRegistryInfo[network] = registryInfo

            return state
        },

        // SET BLACKLISTED COLLECTIONS
        setBlackListCollection: (
            state,
            action: PayloadAction<{
                network: string
                collection: NonFungibleTokenCollection
                accountAddress: string
            }>,
        ) => {
            const { network, collection, accountAddress } = action.payload

            collection.isBlacklisted = true

            if (
                !state.blackListedCollectionsPerAccount[network][accountAddress]
            ) {
                state.blackListedCollectionsPerAccount[network][
                    accountAddress
                ] = {
                    collections: [],
                }
            }

            let allCollections = [
                ...state.blackListedCollectionsPerAccount[network][
                    accountAddress
                ].collections,
                collection,
            ]

            const uniqueCollections = uniqBy(allCollections, "address")

            state.blackListedCollectionsPerAccount[network][accountAddress] = {
                collections: uniqueCollections,
            }

            return state
        },

        // REMOVE BLACKLISTED COLLECTIONS
        removeBlackListCollection: (
            state,
            action: PayloadAction<{
                network: string
                collection: NonFungibleTokenCollection
                accountAddress: string
            }>,
        ) => {
            const { network, collection, accountAddress } = action.payload

            const filteredCollections = state.blackListedCollectionsPerAccount[
                network
            ][accountAddress].collections.filter(
                col => col.address !== collection.address,
            )

            state.blackListedCollectionsPerAccount[network][
                accountAddress
            ].collections = filteredCollections

            return state
        },

        // SET NFTS
        setNFTs: (
            state,
            action: PayloadAction<{
                network: string
                address: string
                collectionAddress: string
                NFTs: NonFungibleToken[]
                pagination: PaginationResponse
            }>,
        ) => {
            const { network, address, collectionAddress, NFTs, pagination } =
                action.payload

            // comes the first time
            if (!state.NFTsPerAccount[network][address]) {
                state.NFTsPerAccount[network][address] = {
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
            if (!state.NFTsPerAccount[network][address][collectionAddress]) {
                state.NFTsPerAccount[network][address][collectionAddress] = {
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
                ...state.NFTsPerAccount[network][address][collectionAddress]
                    .NFTs,
                ...NFTs,
            ]

            const allUnique = uniqBy(uniqueNFTs, "id")
            state.NFTsPerAccount[network][address][collectionAddress].NFTs =
                allUnique

            state.NFTsPerAccount[network][address][
                collectionAddress
            ].pagination = pagination

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

        // TODO.vas -> https://github.com/vechainfoundation/veworld-mobile/issues/808
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
    setCollectionRegistryInfo,
    setNetworkingSideEffects,
    removeBlackListCollection,
    setNFTs,
    resetNftState,
    refreshNFTs,
} = NftSlice.actions
