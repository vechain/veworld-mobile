import { createSelector } from "@reduxjs/toolkit"
import { RootState } from "../Types"
import { NonFungibleToken, NonFungibleTokenCollection } from "~Model"
import { selectSelectedAccount } from "./Account"
import { isEmpty } from "lodash"
import { selectSelectedNetwork } from "./Network"

const selectNftState = (state: RootState) => state.nft

export const selectBlackListedCollections = createSelector(
    selectNftState,
    selectSelectedAccount,
    (state, account) => {
        return (
            state.blackListedCollectionsPerAccount[account.address]
                ?.collections || []
        )
    },
)

/**
 * selectNftCollections
 * @description In order to test this selector together with the "useNFTCollections" hook, you need to change everywhere "account.address" with ACCOUNT_WITH_NFTS in order to get an account with a lot of NFT collections and NFTs
 * @returns
 */
export const selectNftCollections = createSelector(
    selectNftState,
    selectSelectedAccount,
    selectBlackListedCollections,
    (state, account, blackListedCollectionsPerAccount) => {
        const collections =
            state.collectionsPerAccount[account.address]?.collections

        if (collections && blackListedCollectionsPerAccount) {
            const pagination =
                state.collectionsPerAccount[account.address]?.pagination

            const filteredCollections = removeMatchingElements(
                collections,
                blackListedCollectionsPerAccount,
            )

            return {
                collections: filteredCollections,
                pagination,
            }
        }

        return {
            collections: [],
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

export const selectCollectionRegistryInfo = createSelector(
    selectNftState,
    selectSelectedNetwork,
    (state, network) => state.collectionRegistryInfo[network.type],
)

export const selectNftNetworkingSideEffects = createSelector(
    selectNftState,
    state => {
        return {
            isLoading: state.isLoading,
            error: state.error,
        }
    },
)

export const selectCollectionListIsEmpty = createSelector(
    selectNftNetworkingSideEffects,
    selectNftCollections,
    (sideEffects, collections) => {
        return (
            !sideEffects.error &&
            !sideEffects.isLoading &&
            isEmpty(collections.collections)
        )
    },
)

export const selectCollectionWithContractAddress = createSelector(
    [
        selectNftCollections,
        (state: RootState, contractAddress: string) => contractAddress,
    ],
    (collections, contractAddress) => {
        return collections?.collections?.find(
            collection => collection.address === contractAddress,
        )
    },
)

export const selectNFTWithAddressAndTokenId = createSelector(
    [
        selectNftState,
        selectSelectedAccount,
        (state: RootState, contractAddress: string) => contractAddress,
        (state: RootState, contractAddress: string, tokenId: string) => tokenId,
    ],
    (state, account, contractAddress, tokenId) => {
        if (state.NFTsPerAccount[account.address] !== undefined) {
            return state.NFTsPerAccount[account.address][
                contractAddress
            ].NFTs.find(nft => nft.tokenId === tokenId) as NonFungibleToken
        }
    },
)

export const selectNFTsForCollection = createSelector(
    [
        selectSelectedAccount,
        selectNftState,
        (state: RootState, collectionAddress: string) => collectionAddress,
    ],
    (account, nftState, collectionAddress) => {
        if (nftState.NFTsPerAccount[account.address] !== undefined) {
            return nftState.NFTsPerAccount[account.address][collectionAddress]
        }

        return {
            NFTs: [],
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

export const selectBlackListedCollectionByAddress = createSelector(
    [
        selectNftState,
        selectBlackListedCollections,
        (state, collectionAddress: string) => collectionAddress,
    ],
    (state, blackListedCollections, collectionAddress: string) =>
        blackListedCollections.find(col => col.address === collectionAddress),
)

// HELPERS
function removeMatchingElements<T extends NonFungibleTokenCollection>(
    elLeft?: T[],
    elRight?: T[],
) {
    const elementsToRemove = elRight?.map(obj => obj.address)
    return elLeft?.filter(obj => !elementsToRemove?.includes(obj.address))
}
