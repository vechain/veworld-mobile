import { createSelector } from "@reduxjs/toolkit"
import { RootState } from "../Types"
import { FungibleToken } from "~Model"
import { B3TR, TEST_B3TR_ADDRESS, TEST_VOT3_ADDRESS, VET, VOT3, VTHO } from "~Constants"
import { HexUtils, TokenUtils } from "~Utils"
import { selectSelectedNetwork } from "./Network"
import { selectSelectedAccount } from "./Account"
import { compareAddresses } from "~Utils/AddressUtils/AddressUtils"

const selectTokenState = (state: RootState) => state.tokens

export const selectB3trAddress = createSelector([selectSelectedNetwork], network =>
    network.type === "mainnet" ? B3TR.address : TEST_B3TR_ADDRESS,
)

export const selectVot3Address = createSelector([selectSelectedNetwork], network =>
    network.type === "mainnet" ? VOT3.address : TEST_VOT3_ADDRESS,
)

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

export const selectOfficialTokens = createSelector(selectTokensForNetwork, state =>
    TokenUtils.mergeTokens([{ ...VET }, { ...B3TR }, { ...VTHO }, { ...VOT3 }], state.officialTokens),
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
export const selectSuggestedTokens = createSelector(selectTokensForNetwork, state => state.suggestedTokens)

/**
 * Get fungible tokens for the current network but remove default ones
 */
export const selectNonVechainFungibleTokens = createSelector(
    [selectOfficialTokens, selectB3trAddress, selectVot3Address],
    (tokens, b3trAddress, vot3Address) =>
        tokens.filter(
            (token: FungibleToken) =>
                !compareAddresses(token.address, VET.address) &&
                !compareAddresses(token.address, VTHO.address) &&
                !compareAddresses(token.address, b3trAddress) &&
                !compareAddresses(token.address, vot3Address),
        ),
)
