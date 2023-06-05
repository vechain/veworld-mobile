import { createSelector } from "@reduxjs/toolkit"
import { RootState } from "../Types"
import { NonFungibleToken } from "~Model"

const selectNftState = (state: RootState) => state.nft

export const selectNftCollections = createSelector(selectNftState, state => {
    return state.collections
})

export const selectCollectionWithContractAddres = createSelector(
    [
        selectNftCollections,
        (state: RootState, contractAddress: string) => contractAddress,
    ],
    (collections, contractAddress) => {
        return collections.find(
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
        const foundColelction = collections.find(
            collection => collection.address === contractAddress,
        )

        let nft: NonFungibleToken | undefined
        if (foundColelction) {
            nft = foundColelction.nfts.find(_nft => _nft.tokenId === tokenId)
        }

        return nft
    },
)
