import { createSelector } from "@reduxjs/toolkit"
import { RootState } from "../Types"

const selectNftState = (state: RootState) => state.nft

export const selectNftCollections = createSelector(selectNftState, nfts => {
    return [...nfts]
})
