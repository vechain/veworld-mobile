import { createSelector } from "@reduxjs/toolkit"
import { RootState } from "../Types"
import { selectSelectedNetwork } from "./Network"
import { FungibleToken } from "~Model"

const selectTokenState = (state: RootState) => state.tokens

export const selectCustomTokens = createSelector(
    selectTokenState,
    selectSelectedNetwork,
    (tokens, network) =>
        tokens.custom.filter(
            (token: FungibleToken) => token.genesisId === network.genesisId,
        ),
)
