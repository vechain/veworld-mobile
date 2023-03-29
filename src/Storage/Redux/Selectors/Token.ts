import { createSelector } from "@reduxjs/toolkit"
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
export const getNetworkFungibleTokens = createSelector(
    getAllFungibleTokens,
    getCurrentNetwork,
    (tokens, network) =>
        tokens.filter(
            (token: FungibleToken) => token.genesisId === network.genesisId,
        ),
)
