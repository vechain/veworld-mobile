import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { NonFungibleTokenCollection } from "~Model"

type NftSliceState = NonFungibleTokenCollection[]

export const initialStateNft: NftSliceState = []

export const NftSlice = createSlice({
    name: "nft",
    initialState: initialStateNft,
    reducers: {
        setNfts: (
            state,
            action: PayloadAction<NonFungibleTokenCollection[]>,
        ) => {
            const nftCollection = action.payload
            state = nftCollection
            return state
        },
    },
})

export const { setNfts } = NftSlice.actions
