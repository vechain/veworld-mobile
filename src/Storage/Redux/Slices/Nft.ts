import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { NonFungibleTokeCollection } from "~Model"

type NftSliceState = NonFungibleTokeCollection[]

export const initialStateNft: NftSliceState = []

export const NftSlice = createSlice({
    name: "nft",
    initialState: initialStateNft,
    reducers: {
        setNfts: (
            state,
            action: PayloadAction<NonFungibleTokeCollection[]>,
        ) => {
            const nftCollection = action.payload
            state = nftCollection
            return state
        },
    },
})

export const { setNfts } = NftSlice.actions
