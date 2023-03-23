import { createSlice, Draft, PayloadAction } from "@reduxjs/toolkit"
import { FungibleToken } from "~Model"
import { TokenCacheState } from "./types"

export const initialTokenState: TokenCacheState = { fungible: [] }

export const TokenCacheSlice = createSlice({
    name: "tokenCache",
    initialState: initialTokenState,
    reducers: {
        updateFungibleTokens: (
            state: Draft<TokenCacheState>,
            action: PayloadAction<FungibleToken[]>,
        ) => {
            state.fungible = action.payload
        },
    },
})

export const { updateFungibleTokens } = TokenCacheSlice.actions
