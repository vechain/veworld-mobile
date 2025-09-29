import { createSelector } from "@reduxjs/toolkit"
import { RootState } from "../Types"
import { FungibleToken } from "~Model"
import { B3TR, TEST_B3TR_ADDRESS, TEST_VOT3_ADDRESS, VET, VOT3, VTHO } from "~Constants"
import { HexUtils, TokenUtils } from "~Utils"
import { selectSelectedNetwork } from "./Network"
import { selectSelectedAccount } from "./Account"
import { isVechainToken } from "~Utils/AddressUtils/AddressUtils"

const selectTokenState = (state: RootState) => state.tokens

export const selectNetworkVBDTokens = createSelector([selectSelectedNetwork], network => ({
    VOT3: network.type === "mainnet" ? VOT3 : { ...VOT3, address: TEST_VOT3_ADDRESS },
    B3TR: network.type === "mainnet" ? B3TR : { ...B3TR, address: TEST_B3TR_ADDRESS },
}))

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

export const selectCustomTokensByAccount = createSelector(
    selectTokenState,
    selectSelectedNetwork,
    (_state: RootState, accountAddress: string) => accountAddress,
    (state, network, accountAddress) => {
        const normAccountAddress = HexUtils.normalize(accountAddress)
        return state.tokens[network.type].custom[normAccountAddress] ?? []
    },
)

export const selectOfficialTokens = createSelector(
    [selectTokensForNetwork, selectNetworkVBDTokens],
    (state, networkVBDTokens) =>
        TokenUtils.mergeTokens(
            [{ ...VET }, { ...VTHO }, { ...networkVBDTokens.B3TR }, { ...networkVBDTokens.VOT3 }],
            state.officialTokens,
        ),
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
export const selectNonVechainFungibleTokens = createSelector([selectOfficialTokens], tokens =>
    tokens.filter((token: FungibleToken) => !isVechainToken(token.address)),
)
