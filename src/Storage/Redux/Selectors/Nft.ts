import { createSelector } from "@reduxjs/toolkit"
import { RootState } from "../Types"

const selectNftState = (state: RootState) => state.nft

export const selectNftCollections = createSelector(selectNftState, nfts => {
    return [...nfts]
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
