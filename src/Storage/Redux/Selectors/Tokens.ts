import { createSelector } from "@reduxjs/toolkit"
import { RootState } from "../Types"
import { FungibleToken } from "~Model"
import { VET, VTHO } from "~Constants"
import { HexUtils, TokenUtils } from "~Utils"
import { selectSelectedNetwork } from "./Network"
import { selectSelectedAccount } from "./Account"
import { compareAddresses } from "~Utils/AddressUtils/AddressUtils"

const selectTokenState = (state: RootState) => state.tokens

export const selectTokensForNetwork = createSelector(
    [selectTokenState, selectSelectedNetwork],
    (tokens, network) => tokens.tokens[network.type],
)

export const selectCustomTokens = createSelector(
    selectTokenState,
    selectSelectedNetwork,
    selectSelectedAccount,
    (state, network, account) => {
        const normAccountAddress = HexUtils.normalize(account.address)
        return state.tokens[network.type].custom[normAccountAddress] ?? []
    },
)

export const selectOfficialTokens = createSelector(
    selectTokensForNetwork,
    state =>
        TokenUtils.mergeTokens([{ ...VET }, { ...VTHO }], state.officialTokens),
)

export const selectAllTokens = createSelector(
    selectOfficialTokens,
    selectCustomTokens,
    (officialTokens, customTokens) => {
        return TokenUtils.mergeTokens(officialTokens, customTokens)
    },
)

/**
 * Returns the addresses of all tokens that have a balance
 */
export const selectSuggestedTokens = createSelector(
    selectTokensForNetwork,
    state => state.suggestedTokens,
)

/**
 * Get fungible tokens for the current network but remove default ones
 */
export const selectNonVechainFungibleTokens = createSelector(
    selectOfficialTokens,
    tokens =>
        tokens.filter(
            (token: FungibleToken) =>
                !compareAddresses(token.address, VET.address) &&
                !compareAddresses(token.address, VTHO.address),
        ),
)
