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

        setNFTIsHidden: (
            state,
            action: PayloadAction<{
                contractAddress: string
                tokenId: string
                isHidden: boolean
            }>,
        ) => {
            return state.forEach(nftCollection => {
                if (
                    nftCollection.address ===
                    action.payload.contractAddress.toLowerCase()
                ) {
                    nftCollection.nfts.forEach(nft => {
                        if (nft.tokenId === action.payload.tokenId) {
                            nft.isHidden = action.payload.isHidden
                        }
                    })
                }
            })
        },
    },
})

export const { setNfts, setNFTIsHidden } = NftSlice.actions
