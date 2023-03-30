import { createSelector } from "@reduxjs/toolkit"
import { VET, VTHO } from "~Common/Constant/Token/TokenConstants"
import { FungibleToken } from "~Model"
import { RootState } from "~Storage/Redux/Types"
import { getCurrentNetwork } from "./UserPreferences"

export const getAllTokens = (state: RootState) => state.tokens

export const getAllFungibleTokens = createSelector(
    getAllTokens,
    tokens => tokens.fungible,
)

/**
 * Get fungible tokens for the current network
 */
export const getFungibleTokens = createSelector(
    getAllFungibleTokens,
    getCurrentNetwork,
    (tokens, network) =>
        tokens.filter(
            (token: FungibleToken) => token.genesisId === network.genesisId,
        ),
)

/**
 * Get fungible tokens for the current network but remove default ones
 */
export const getFungibleTokensWithoutDefaults = createSelector(
    getFungibleTokens,
    tokens =>
        tokens.filter(
            (token: FungibleToken) =>
                token.symbol !== VET.symbol && token.symbol !== VTHO.symbol,
        ),
)
