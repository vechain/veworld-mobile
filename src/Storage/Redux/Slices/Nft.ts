/* eslint-disable @typescript-eslint/no-shadow */
import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { uniqBy } from "lodash"
import {
    NETWORK_TYPE,
    NonFungibleToken,
    NonFungibleTokenCollection,
} from "~Model"
import {
    BlackListedCollections,
    CollectionRegistryInfo,
    Collections,
    CollectionWithPagination,
    NFTs,
} from "../Types/Nft"
import { GithubCollectionResponse, PaginationResponse } from "~Networking"
import { HexUtils, URIUtils } from "~Utils"

export type NftSliceState = {
    collectionRegistryInfo: CollectionRegistryInfo
    collectionsPerAccount: Collections
    NFTsPerAccount: NFTs

    blackListedCollectionsPerAccount: BlackListedCollections

    isLoading: boolean
    error: string | undefined
}

export const initialStateNft: NftSliceState = {
    collectionRegistryInfo: {},
    collectionsPerAccount: {},
    NFTsPerAccount: {},
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
                currentAccountAddress: string
                collectionData: CollectionWithPagination
            }>,
        ) => {
            const { collectionData, currentAccountAddress } = action.payload

            const normalizedAcct = HexUtils.normalize(currentAccountAddress)

            if (!state.collectionsPerAccount[normalizedAcct]) {
                state.collectionsPerAccount[normalizedAcct] = {
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
                ...state.collectionsPerAccount[normalizedAcct].collections,
                ...collectionData.collections,
            ]

            const allUnique = uniqBy(uniqueCollections, "address")
            state.collectionsPerAccount[normalizedAcct] = {
                collections: allUnique,
                pagination: collectionData.pagination,
            }

            return state
        },

        updateCollection: (
            state,
            action: PayloadAction<{
                currentAccountAddress: string
                collection: NonFungibleTokenCollection
            }>,
        ) => {
            const { currentAccountAddress, collection } = action.payload

            const normalizedAcct = HexUtils.normalize(currentAccountAddress)

            if (state.collectionsPerAccount[normalizedAcct] !== undefined) {
                const existing = state.collectionsPerAccount[
                    normalizedAcct
                ].collections?.find(
                    col => col.address === collection.address,
                ) as NonFungibleTokenCollection

                if (existing) {
                    existing.image = URIUtils.convertUriToUrl(collection.image)
                    existing.name = collection.name
                    existing.description = collection.description
                    existing.mimeType = collection.mimeType
                }
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

            const normalizedAcct = HexUtils.normalize(accountAddress)

            collection.isBlacklisted = true

            if (
                !state.blackListedCollectionsPerAccount[network][normalizedAcct]
            ) {
                state.blackListedCollectionsPerAccount[network][
                    normalizedAcct
                ] = {
                    collections: [],
                }
            }

            let allCollections = [
                ...state.blackListedCollectionsPerAccount[network][
                    normalizedAcct
                ].collections,
                collection,
            ]

            const uniqueCollections = uniqBy(allCollections, "address")

            state.blackListedCollectionsPerAccount[network][normalizedAcct] = {
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

            const normalizedAcct = HexUtils.normalize(accountAddress)

            const filteredCollections = state.blackListedCollectionsPerAccount[
                network
            ][normalizedAcct].collections.filter(
                col => col.address !== collection.address,
            )

            state.blackListedCollectionsPerAccount[network][
                normalizedAcct
            ].collections = filteredCollections

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

            const normalizedAcct = HexUtils.normalize(address)
            const normalizedCollection = HexUtils.normalize(collectionAddress)

            // comes the first time
            if (!state.NFTsPerAccount[normalizedAcct]) {
                state.NFTsPerAccount[normalizedAcct] = {
                    [normalizedCollection]: {
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
            if (!state.NFTsPerAccount[normalizedAcct][normalizedCollection]) {
                state.NFTsPerAccount[normalizedAcct][normalizedCollection] = {
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
                ...state.NFTsPerAccount[normalizedAcct][normalizedCollection]
                    .NFTs,
                ...NFTs,
            ]

            const allUnique = uniqBy(uniqueNFTs, "id")
            state.NFTsPerAccount[normalizedAcct][normalizedCollection].NFTs =
                allUnique

            state.NFTsPerAccount[normalizedAcct][
                normalizedCollection
            ].pagination = pagination

            return state
        },

        updateNFT: (
            state,
            action: PayloadAction<{
                address: string
                collectionAddress: string
                NFT: NonFungibleToken
            }>,
        ) => {
            const { address, collectionAddress, NFT } = action.payload

            const normalizedAcct = HexUtils.normalize(address)
            const normalizedCollection = HexUtils.normalize(collectionAddress)

            if (state.NFTsPerAccount[normalizedAcct] !== undefined) {
                const existing = state.NFTsPerAccount[normalizedAcct][
                    normalizedCollection
                ]?.NFTs?.find(
                    nft => nft.tokenId === NFT.tokenId,
                ) as NonFungibleToken

                if (existing) {
                    existing.image = URIUtils.convertUriToUrl(NFT.image)
                    existing.name = NFT.name
                    existing.description = NFT.description
                    existing.mimeType = NFT.mimeType
                }
            }
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

            const normalizedAcct = HexUtils.normalize(accountAddress)

            delete state.collectionsPerAccount[normalizedAcct]
            delete state.NFTsPerAccount[normalizedAcct]

            return state
        },

        clearNFTCache: state => {
            state.collectionsPerAccount = {}
            state.NFTsPerAccount = {}

            return state
        },

        resetNftState: () => initialStateNft,
    },
})

export const {
    setBlackListCollection,
    setCollections,
    updateCollection,
    setCollectionRegistryInfo,
    setNetworkingSideEffects,
    removeBlackListCollection,
    setNFTs,
    updateNFT,
    resetNftState,
    clearNFTCache,
    refreshNFTs,
} = NftSlice.actions
