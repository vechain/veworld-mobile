import { createSelector } from "@reduxjs/toolkit"
import { RootState } from "../Types"
import { NonFungibleToken, NonFungibleTokenCollection } from "~Model"
import { selectSelectedAccount } from "./Account"

const selectNftState = (state: RootState) => state.nft

export const selectBlackListedCollections = createSelector(
    selectNftState,
    state => {
        return state.blackListedCollections
    },
)

function removeMatchingElements<T extends NonFungibleTokenCollection>(
    elLeft?: T[],
    elRight?: T[],
) {
    const elementsToRemove = elRight?.map(obj => obj.address)
    return elLeft?.filter(obj => !elementsToRemove?.includes(obj.address))
}

export const selectNftCollections = createSelector(
    selectNftState,
    selectSelectedAccount,
    selectBlackListedCollections,
    (state, account, blackListedCollections) => {
        // return state.collectionsPerAccount[account.address]

        const collections =
            state.collectionsPerAccount[
                "0x3CA506F873e5819388aa3CE0b1c4FC77b6db0048"
            ]?.collections

        if (collections && blackListedCollections) {
            const pagination =
                state.collectionsPerAccount[
                    "0x3CA506F873e5819388aa3CE0b1c4FC77b6db0048"
                ]?.pagination

            const filteredCollections = removeMatchingElements(
                collections,
                blackListedCollections,
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
            },
        }
    },
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

export const selectCollectionWithContractAddres = createSelector(
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
        selectNftCollections,
        (state: RootState, contractAddress: string) => contractAddress,
        (state: RootState, contractAddress: string, tokenId: string) => tokenId,
    ],
    (collections, contractAddress, tokenId) => {
        const foundColelction = collections?.collections?.find(
            collection => collection.address === contractAddress,
        )

        let nft: NonFungibleToken | undefined
        if (foundColelction) {
            nft = foundColelction.nfts.find(_nft => _nft.tokenId === tokenId)
        }

        return nft
    },
)
