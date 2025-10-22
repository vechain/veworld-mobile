import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { NonFungibleToken, NftCollection } from "~Model"
import { NETWORK_TYPE } from "~Model/Network/enums"
import {
    BlackListedCollections,
    CollectionRegistryInfo,
    Collections,
    CollectionWithPagination,
    NFTs,
    ReportedCollections,
} from "../Types/Nft"
import { GithubCollectionResponse, PaginationResponse } from "~Networking"
import { AddressUtils, HexUtils } from "~Utils"
import { mergeArrays, mergeNftCollections } from "~Utils/MergeUtils/MergeUtils"

export type NftSliceState = {
    collectionRegistryInfo: CollectionRegistryInfo
    collections: Collections
    nfts: NFTs
    blackListedCollections: BlackListedCollections
    reportedCollections: ReportedCollections
    isLoading: boolean
    error: string | undefined
    favoriteNfts?: {
        [genesisId: string]: {
            [owner: string]: {
                /**
                 * Key will be `<address>_<tokenId>`
                 */
                [addressTokenId: string]: {
                    address: string
                    tokenId: string
                    /**
                     * Date when the favorite was added.
                     * Value is in milliseconds
                     */
                    createdAt: number
                }
            }
        }
    }
}

export const initialStateNft: NftSliceState = {
    collectionRegistryInfo: {
        [NETWORK_TYPE.MAIN]: [],
        [NETWORK_TYPE.TEST]: [],
        [NETWORK_TYPE.SOLO]: [],
        [NETWORK_TYPE.OTHER]: [],
    },
    collections: {},
    nfts: {},
    blackListedCollections: {
        [NETWORK_TYPE.MAIN]: {},
        [NETWORK_TYPE.TEST]: {},
        [NETWORK_TYPE.SOLO]: {},
        [NETWORK_TYPE.OTHER]: {},
    },
    reportedCollections: {
        [NETWORK_TYPE.MAIN]: {},
        [NETWORK_TYPE.TEST]: {},
        [NETWORK_TYPE.SOLO]: {},
        [NETWORK_TYPE.OTHER]: {},
    },
    isLoading: true,
    error: undefined,
    favoriteNfts: {},
}

const findExistingCollection = (
    state: NftSliceState,
    currentAccountAddress: string,
    collectionAddress: string,
): NftCollection | undefined => {
    const normalizedAcct = HexUtils.normalize(currentAccountAddress)

    if (!state.collections[normalizedAcct]) return

    return state.collections[normalizedAcct].collections?.find(col =>
        AddressUtils.compareAddresses(col.address, collectionAddress),
    ) as NftCollection
}

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

            if (!state.collections[normalizedAcct]) {
                state.collections[normalizedAcct] = {
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

            const mergedCollections = mergeNftCollections(
                state.collections[normalizedAcct].collections,
                collectionData.collections,
            )

            state.collections[normalizedAcct] = {
                collections: mergedCollections,
                pagination: collectionData.pagination,
            }

            return state
        },

        updateCollection: (
            state,
            action: PayloadAction<{
                currentAccountAddress: string
                collection: NftCollection
            }>,
        ) => {
            const { currentAccountAddress, collection } = action.payload

            const existing = findExistingCollection(state, currentAccountAddress, collection.address)

            if (existing) {
                Object.assign(existing, collection)
            }

            return state
        },

        // SET COLLECTIONS REGISTRY INFO
        setCollectionRegistryInfo: (
            state,
            action: PayloadAction<{
                network: NETWORK_TYPE
                registryInfo: GithubCollectionResponse[]
            }>,
        ) => {
            const { registryInfo, network } = action.payload

            state.collectionRegistryInfo[network] = registryInfo

            return state
        },

        // TOGGLE BLACKLIST COLLECTION
        toggleBlackListCollection: (
            state,
            action: PayloadAction<{
                network: NETWORK_TYPE
                collection: NftCollection
                accountAddress: string
            }>,
        ) => {
            const { network, collection, accountAddress } = action.payload

            const currentBlackList = state.blackListedCollections[network][accountAddress]

            const isBlackListed = currentBlackList?.addresses.includes(collection.address) ?? false

            if (isBlackListed) {
                currentBlackList.addresses = currentBlackList.addresses.filter(
                    address => address !== collection.address,
                )
            } else {
                if (currentBlackList) {
                    state.blackListedCollections[network][accountAddress].addresses.push(collection.address)
                } else {
                    state.blackListedCollections[network][accountAddress] = {
                        addresses: [collection.address],
                    }
                }
            }
            return state
        },

        // REPORT COLLECTION
        reportCollection: (
            state,
            action: PayloadAction<{
                network: NETWORK_TYPE
                collectionAddress: string
                accountAddress: string
            }>,
        ) => {
            const { network, collectionAddress, accountAddress } = action.payload

            const currentReported = state.reportedCollections[network][accountAddress]

            const isAlreadyReported = currentReported?.addresses.includes(collectionAddress)

            if (!isAlreadyReported) {
                if (currentReported) {
                    state.reportedCollections[network][accountAddress].addresses.push(collectionAddress)
                } else {
                    state.reportedCollections[network][accountAddress] = {
                        addresses: [collectionAddress],
                    }
                }
            }
            return state
        },

        // SET NFTS
        setNFTs: (
            state,
            action: PayloadAction<{
                address: string
                collectionAddress: string
                nfts: NonFungibleToken[]
                pagination: PaginationResponse
            }>,
        ) => {
            const { address, collectionAddress, nfts, pagination } = action.payload

            const normalizedAcct = HexUtils.normalize(address)
            const normalizedCollection = HexUtils.normalize(collectionAddress)

            // comes the first time
            if (!state.nfts[normalizedAcct]) {
                state.nfts[normalizedAcct] = {
                    [normalizedCollection]: {
                        nfts: [],
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
            if (!state.nfts[normalizedAcct][normalizedCollection]) {
                state.nfts[normalizedAcct][normalizedCollection] = {
                    nfts: [],
                    pagination: {
                        countLimit: 0,
                        hasNext: false,
                        hasCount: true,
                        totalElements: 0,
                        totalPages: 0,
                    },
                }
            }

            const mergedNfts = mergeArrays(state.nfts[normalizedAcct][normalizedCollection].nfts, nfts, "id")

            state.nfts[normalizedAcct][normalizedCollection] = {
                nfts: mergedNfts,
                pagination,
            }

            return state
        },

        updateNFT: (
            state,
            action: PayloadAction<{
                address: string
                collectionAddress: string
                nft: NonFungibleToken
            }>,
        ) => {
            const { address, collectionAddress, nft } = action.payload

            const normalizedAcct = HexUtils.normalize(address)
            const normalizedCollection = HexUtils.normalize(collectionAddress)

            if (state.nfts[normalizedAcct] !== undefined) {
                const existing = state.nfts[normalizedAcct][normalizedCollection]?.nfts?.find(
                    n => n.tokenId === nft.tokenId,
                ) as NonFungibleToken

                if (existing) {
                    // Replace all field values of existing collection with the new collection recursively
                    Object.assign(existing, nft)
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

        refreshNFTs: (
            state,
            action: PayloadAction<{
                accountAddress: string
            }>,
        ) => {
            const { accountAddress } = action.payload

            const normalizedAcct = HexUtils.normalize(accountAddress)

            delete state.collections[normalizedAcct]
            delete state.nfts[normalizedAcct]

            return state
        },

        clearNFTCache: state => {
            state.collections = {}
            state.nfts = {}
            state.isLoading = true
            delete state.error

            return state
        },

        resetNftState: () => initialStateNft,
        toggleFavorite: (
            state,
            action: PayloadAction<{ address: string; tokenId: string; owner: string; genesisId: string }>,
        ) => {
            const { address, tokenId, owner, genesisId } = action.payload
            const normalizedOwner = HexUtils.normalize(owner)
            const normalizedAddress = HexUtils.normalize(address)
            state.favoriteNfts ??= {}
            state.favoriteNfts[genesisId] ??= {}
            state.favoriteNfts[genesisId][normalizedOwner] ??= {}

            const key = `${normalizedAddress}_${tokenId}`
            if (state.favoriteNfts[genesisId][normalizedOwner][key]) {
                delete state.favoriteNfts[genesisId][normalizedOwner][key]
            } else {
                state.favoriteNfts[genesisId][normalizedOwner][key] = {
                    address: normalizedAddress,
                    tokenId,
                    createdAt: Date.now(),
                }
            }
        },
    },
})

export const {
    setCollections,
    updateCollection,
    setCollectionRegistryInfo,
    setNetworkingSideEffects,
    toggleBlackListCollection,
    reportCollection,
    setNFTs,
    updateNFT,
    resetNftState,
    clearNFTCache,
    refreshNFTs,
    toggleFavorite,
} = NftSlice.actions
