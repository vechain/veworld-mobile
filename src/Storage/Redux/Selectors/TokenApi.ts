import { createSelector } from "@reduxjs/toolkit"
import { DEFAULT_VECHAIN_TOKENS, VET, VTHO } from "~Common/Constant"
import { mergeTokens } from "~Common/Utils/TokenUtils"
import { FungibleToken } from "~Model"
import { TokenApi } from "../Api"
import { RootState } from "../Types"
import { selectSelectedNetwork } from "./Network"

const getQueryArgs = (state: RootState) => {
    const network = selectSelectedNetwork(state)
    return { networkGenesisId: network.genesisId, networkType: network.type }
}

export const selectTokensFromGithub = (state: RootState) =>
    TokenApi.endpoints.getTokensFromGithub.select(getQueryArgs(state))(state)
        .data || []

export const selectAllFungibleTokens = createSelector(
    selectTokensFromGithub,
    tokens => mergeTokens(DEFAULT_VECHAIN_TOKENS, tokens),
)

/**
 * Get fungible tokens for the current network
 */
export const selectFungibleTokens = createSelector(
    selectAllFungibleTokens,
    selectSelectedNetwork,
    (tokens, network) =>
        tokens.filter(
            (token: FungibleToken) => token.genesisId === network.genesisId,
        ),
)

/**
 * Get fungible tokens for the current network but remove default ones
 */
export const selectNonVechainFungibleTokens = createSelector(
    selectFungibleTokens,
    tokens =>
        tokens.filter(
            (token: FungibleToken) =>
                token.symbol !== VET.symbol && token.symbol !== VTHO.symbol,
        ),
)
