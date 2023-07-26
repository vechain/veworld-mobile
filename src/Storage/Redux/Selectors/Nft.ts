import { createSelector } from "@reduxjs/toolkit"
import { RootState } from "../Types"
import { NonFungibleToken, NonFungibleTokenCollection } from "~Model"
import { selectSelectedAccount } from "./Account"
import { isEmpty } from "lodash"
import { selectSelectedNetwork } from "./Network"
import { AddressUtils, HexUtils } from "~Utils"

const selectNftState = (state: RootState) => state.nft

export const selectBlackListedCollections = createSelector(
    selectNftState,
    selectSelectedNetwork,
    selectSelectedAccount,
    (state, network, account) => {
        return (
            state.blackListedCollectionsPerAccount[network.type][
                account.address
            ]?.collections || []
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
    selectSelectedNetwork,
    selectSelectedAccount,
    selectBlackListedCollections,
    (state, network, account, blackListedCollectionsPerAccount) => {
        const normalizedAcct = HexUtils.normalize(account.address)
        const collections =
            state.collectionsPerAccount[network.type][normalizedAcct]
                ?.collections

        if (collections && blackListedCollectionsPerAccount) {
            const pagination =
                state.collectionsPerAccount[network.type][normalizedAcct]
                    ?.pagination

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
        return collections?.collections?.find(collection =>
            AddressUtils.compareAddresses(collection.address, contractAddress),
        )
    },
)

export const selectNFTWithAddressAndTokenId = createSelector(
    [
        selectNftState,
        selectSelectedNetwork,
        selectSelectedAccount,
        (state: RootState, contractAddress: string) => contractAddress,
        (state: RootState, contractAddress: string, tokenId: string) => tokenId,
    ],
    (state, network, account, contractAddress, tokenId) => {
        const normalizedAcct = HexUtils.normalize(account.address)
        if (state.NFTsPerAccount[network.type][normalizedAcct] !== undefined) {
            return state.NFTsPerAccount[network.type][normalizedAcct][
                contractAddress
            ].NFTs.find(nft => nft.tokenId === tokenId) as NonFungibleToken
        }
    },
)

export const selectNFTsForCollection = createSelector(
    [
        selectNftState,
        selectSelectedNetwork,
        selectSelectedAccount,
        (state: RootState, collectionAddress: string) => collectionAddress,
    ],
    (nftState, network, account, collectionAddress) => {
        const normalizedAcct = HexUtils.normalize(account.address)
        const normalizedCollection = HexUtils.normalize(collectionAddress)
        if (
            nftState.NFTsPerAccount[network.type][normalizedAcct] !== undefined
        ) {
            return nftState.NFTsPerAccount[network.type][normalizedAcct][
                normalizedCollection
            ]
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
        blackListedCollections.find(col =>
            AddressUtils.compareAddresses(col.address, collectionAddress),
        ),
)

// HELPERS
function removeMatchingElements<T extends NonFungibleTokenCollection>(
    elLeft?: T[],
    elRight?: T[],
) {
    const elementsToRemove = elRight?.map(obj => obj.address)
    return elLeft?.filter(obj => !elementsToRemove?.includes(obj.address))
}
