import { createSelector } from "@reduxjs/toolkit"
import { DEFAULT_VECHAIN_TOKENS } from "~Common"
import { TokenUtils } from "~Utils"
import { RootState } from "../Types"
import { selectSelectedNetwork } from "./Network"
import { FungibleToken } from "~Model"

const selectTokenState = (state: RootState) => state.tokens

export const selectOfficialTokens = createSelector(
    selectTokenState,
    state => state.officialTokens,
)

export const selectFungibleTokensAll = createSelector(
    selectOfficialTokens,
    tokens => TokenUtils.mergeTokens(DEFAULT_VECHAIN_TOKENS, tokens),
)

export const selectCustomTokensForNetwork = createSelector(
    selectTokenState,
    selectSelectedNetwork,
    (tokens, network) =>
        tokens.custom.filter(
            (token: FungibleToken) => token.genesisId === network.genesis.id,
        ),
)
