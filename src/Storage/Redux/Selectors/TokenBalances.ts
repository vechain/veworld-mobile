import { createSelector } from "@reduxjs/toolkit"
import { DEFAULT_VECHAIN_TOKENS } from "~Constants"
import { TokenUtils } from "~Utils"
import { RootState } from "../Types"
import { selectSelectedNetwork } from "./Network"
import { FungibleToken } from "~Model"
import { selectSelectedAccount } from "./Account"

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
    selectSelectedAccount,
    (tokens, network, account) => {
        if (!tokens.custom[account.address]) return []

        return tokens.custom[account.address].filter(
            (token: FungibleToken) => token.genesisId === network.genesis.id,
        )
    },
)
