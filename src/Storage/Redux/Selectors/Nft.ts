import { createSelector } from "@reduxjs/toolkit"
import { CollectionWithPagination, RootState } from "../Types"
import { NonFungibleToken } from "~Model"
import { selectSelectedAccount } from "./Account"
import { isEmpty } from "lodash"
import { selectSelectedNetwork } from "./Network"
import { AddressUtils, HexUtils } from "~Utils"

const selectNftState = (state: RootState) => state.nft

const initialCollectionsState: CollectionWithPagination = {
    collections: [],
    pagination: {
        totalElements: 0,
        totalPages: 0,
        countLimit: 0,
        hasNext: false,
        hasCount: false,
    },
}

export const selectAllNFTCollections = createSelector(selectNftState, selectSelectedAccount, (state, account) => {
    const normalizedAcct = HexUtils.normalize(account.address) // NFT_WHALE - replace here
    return state.collections[normalizedAcct]
})

export const selectBlackListedAddresses = createSelector(
    selectNftState,
    selectSelectedNetwork,
    selectSelectedAccount,
    (state, network, account) => {
        const normalizedAcct = HexUtils.normalize(account.address) // NFT_WHALE - replace here
        return state.blackListedCollections[network.type][normalizedAcct]?.addresses ?? []
    },
)

export const selectReportedAddresses = createSelector(
    selectNftState,
    selectSelectedNetwork,
    selectSelectedAccount,
    (state, network, account) => {
        const normalizedAcct = HexUtils.normalize(account.address)
        return state.reportedCollections[network.type][normalizedAcct]?.addresses ?? []
    },
)

export const selectNftCollections = createSelector(
    selectAllNFTCollections,
    selectBlackListedAddresses,
    selectReportedAddresses,
    (allCollections, blackListedAddresses, reportedAddresses) => {
        if (!allCollections) return { ...initialCollectionsState }

        return {
            collections: allCollections.collections.filter(
                col => !blackListedAddresses.includes(col.address) && !reportedAddresses.includes(col.address),
            ),
            pagination: allCollections.pagination,
        }
    },
)

export const selectNftCollectionsWithoutMetadata = createSelector(
    selectAllNFTCollections,
    collections => collections?.collections?.filter(col => !col.updated) ?? [],
)

export const selectCollectionRegistryInfo = createSelector(
    selectNftState,
    selectSelectedNetwork,
    (state, network) => state.collectionRegistryInfo[network.type],
)

export const selectNftNetworkingSideEffects = createSelector(selectNftState, state => {
    return {
        isLoading: state.isLoading,
        error: state.error,
    }
})

export const selectCollectionListIsEmpty = createSelector(
    selectNftNetworkingSideEffects,
    selectNftCollections,
    (sideEffects, collections) => {
        return !sideEffects.error && !sideEffects.isLoading && isEmpty(collections.collections)
    },
)

export const selectCollectionWithContractAddress = createSelector(
    [selectNftCollections, (state: RootState, contractAddress: string) => contractAddress],
    (collections, contractAddress) => {
        return collections?.collections?.find(collection =>
            AddressUtils.compareAddresses(collection.address, contractAddress),
        )
    },
)

export const selectAllNfts = createSelector(selectNftState, selectSelectedAccount, (state, account) => {
    const normalizedAcct = HexUtils.normalize(account.address) // NFT_WHALE - replace here

    const nftsForUser = state.nfts[normalizedAcct]
    if (!nftsForUser) return []
    return (
        Object.values(nftsForUser)?.reduce((prev, curr) => {
            return prev.concat(curr.nfts)
        }, [] as NonFungibleToken[]) ?? []
    )
})

export const selectAllVisibleNFTs = createSelector(
    selectAllNfts,
    selectBlackListedAddresses,
    selectReportedAddresses,
    (allNfts, blackListedAddresses, reportedAddresses) => {
        return allNfts.filter(
            nft =>
                blackListedAddresses.indexOf(HexUtils.normalize(nft.address)) === -1 &&
                reportedAddresses.indexOf(HexUtils.normalize(nft.address)) === -1,
        )
    },
)

export const selectAllNftsWithoutMetadata = createSelector(selectAllNfts, allNfts =>
    allNfts.filter(nft => !nft.updated),
)

export const selectNFTWithAddressAndTokenId = createSelector(
    [
        selectNftState,
        selectSelectedAccount,
        (state: RootState, contractAddress: string) => contractAddress,
        (state: RootState, contractAddress: string, tokenId: string) => tokenId,
    ],
    (state, account, contractAddress, tokenId) => {
        const normalizedAcct = HexUtils.normalize(account.address) // NFT_WHALE - replace here
        if (state.nfts?.[normalizedAcct]?.[contractAddress]?.nfts) {
            return state.nfts[normalizedAcct][contractAddress].nfts.find(
                nft => nft.tokenId === tokenId,
            ) as NonFungibleToken
        }
    },
)

export const selectNFTsForCollection = createSelector(
    [selectNftState, selectSelectedAccount, (state: RootState, collectionAddress: string) => collectionAddress],
    (nftState, account, collectionAddress) => {
        const normalizedAcct = HexUtils.normalize(account.address) // NFT_WHALE - replace here
        const normalizedCollection = HexUtils.normalize(collectionAddress)
        if (nftState.nfts[normalizedAcct] !== undefined) {
            return nftState.nfts[normalizedAcct][normalizedCollection]
        }

        return {
            nfts: [],
            pagination: {
                totalElements: 0,
                totalPages: 0,
                countLimit: 0,
                hasNext: false,
                hasCount: false,
            },
        }
    },
)

export const selectBlackListedCollections = createSelector(
    selectAllNFTCollections,
    selectBlackListedAddresses,
    (allCollections, blackListedAddresses) => {
        if (!allCollections) return []

        return allCollections.collections.filter(col => blackListedAddresses.includes(col.address))
    },
)

export const selectReportedCollections = createSelector(
    selectAllNFTCollections,
    selectReportedAddresses,
    (allCollections, reportedAddresses) => {
        if (!allCollections) return []

        return allCollections.collections.filter(col => reportedAddresses.includes(col.address))
    },
)

export const selectBlacklistedCollectionByAddress = createSelector(
    [selectNftState, selectBlackListedCollections, (state, collectionAddress: string) => collectionAddress],
    (state, blackListedCollections, collectionAddress: string) =>
        blackListedCollections.find(col => AddressUtils.compareAddresses(col.address, collectionAddress)),
)

export const isBlacklistedCollection = createSelector(
    [selectBlackListedAddresses, (state, collectionAddress: string) => collectionAddress],
    (blackListedAddresses, collectionAddress: string) => {
        return (
            blackListedAddresses.findIndex(address => AddressUtils.compareAddresses(address, collectionAddress)) !== -1
        )
    },
)

export const isReportedCollection = createSelector(
    [selectReportedAddresses, (state, collectionAddress: string) => collectionAddress],
    (reportedAddresses, collectionAddress: string) => {
        return reportedAddresses.findIndex(address => AddressUtils.compareAddresses(address, collectionAddress)) !== -1
    },
)

const selectFavoriteNfts = createSelector(selectNftState, state => state.favorites ?? {})
const selectCurrentAccountFavoriteNfts = createSelector(
    [selectFavoriteNfts, selectSelectedAccount],
    (favorites, selectedAccount) => favorites[HexUtils.normalize(selectedAccount.address)] ?? {},
)

export const isNftFavorite = createSelector(
    [selectCurrentAccountFavoriteNfts, (_state: RootState, address: string, tokenId: string) => ({ address, tokenId })],
    (favorites, nft) => {
        const normalizedAddress = HexUtils.normalize(nft.address)
        return Boolean(favorites[`${normalizedAddress}_${nft.tokenId}`])
    },
)

export const selectAllFavoriteNfts = createSelector(selectCurrentAccountFavoriteNfts, nfts => Object.values(nfts))
