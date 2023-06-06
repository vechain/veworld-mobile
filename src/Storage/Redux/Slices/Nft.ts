import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { NonFungibleTokenCollection } from "~Model"

type NFTBlackListedItem = {
    tokenId: string
    collectionsAddress: string
}

type NftSliceState = {
    collections: NonFungibleTokenCollection[]
    blackListedCollections: string[]
    blackListedNFTs: NFTBlackListedItem[]
}

export const initialStateNft: NftSliceState = {
    blackListedCollections: [],
    blackListedNFTs: [],
    collections: [],
}

export const NftSlice = createSlice({
    name: "nft",
    initialState: initialStateNft,
    reducers: {
        setNfts: (
            state,
            action: PayloadAction<NonFungibleTokenCollection[]>,
        ) => {
            const nftCollection = action.payload
            state.collections = nftCollection
            return state
        },

        // TODO set here adjust Nfts from selectors
        setBlackListNFT: (
            state,
            action: PayloadAction<{
                contractAddress: string
                tokenId: string
            }>,
        ) => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const _action = action
            return state
        },

        // TODO set here adjust collections from selectors
        setBlackListCollection: (
            state,
            action: PayloadAction<{ contractAddress: string }>,
        ) => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const _action = action
            return state
        },
    },
})

export const { setNfts, setBlackListNFT, setBlackListCollection } =
    NftSlice.actions
