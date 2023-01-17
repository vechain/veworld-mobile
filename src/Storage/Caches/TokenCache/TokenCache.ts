import { createSlice, Draft, PayloadAction } from "@reduxjs/toolkit"
import { RootState } from "~Storage/Caches/cache"
import {
    FungibleToken,
    FungibleTokenWithBalance,
    TokenCache,
} from "~Model/Token"
import { getCurrentNetwork, getGeneralSettings } from "../SettingsCache"
import { getAllBalances, getBalancesForAccount } from "../BalanceCache"
import AddressUtils from "~Common/Utils/AddressUtils"
import { getCurrentAccount } from "../AccountCache"

export const initialTokenState: TokenCache = { fungible: [] }

export const tokenSlice = createSlice({
    name: "tokens",
    initialState: initialTokenState,
    reducers: {
        updateFungibleTokens: (
            state: Draft<TokenCache>,
            action: PayloadAction<FungibleToken[]>,
        ) => {
            state.fungible = action.payload
        },
    },
})

export const { updateFungibleTokens } = tokenSlice.actions

/**
 * Get fungible tokens for the current network
 */
export const getFungibleTokens = (state: RootState) => {
    const network = getCurrentNetwork(state)
    return state.tokens.fungible.filter(
        token => token.genesisId === network.genesis.id,
    )
}

export const getToken = (symbol?: string) => (state: RootState) => {
    const network = getCurrentNetwork(state)
    return state.tokens.fungible.find(
        token =>
            token.symbol === symbol && token.genesisId === network.genesis.id,
    )
}

/**
 * Get custom fungible tokens for the current network
 */
export const getCustomFungibleTokens = (state: RootState) => {
    const network = getCurrentNetwork(state)
    return state.tokens.fungible.filter(
        token => token.genesisId === network.genesis.id && token.custom,
    )
}

/**
 * Get fungible tokens with balance for the account.
 */
export const getFungibleTokensForAccount =
    (accountAddress: string) => (state: RootState) => {
        const network = getCurrentNetwork(state)
        const accountBalances = getBalancesForAccount(accountAddress)(state)
        const hidingZeroBalance = getGeneralSettings(state).hideNoBalanceTokens

        return state.tokens.fungible
            .filter(t =>
                AddressUtils.compareAddresses(t.genesisId, network.genesis.id),
            )
            .reduce<FungibleTokenWithBalance[]>((ft, t) => {
                const balance = accountBalances.find(b =>
                    AddressUtils.compareAddresses(b.tokenAddress, t.address),
                )

                if (balance) {
                    const balanceValue = balance.balance
                    if (hidingZeroBalance) {
                        if (isVechainTokenOrNonZeroBalance(t, balanceValue)) {
                            ft.push({ ...t, balance })
                        }
                    } else {
                        ft.push({ ...t, balance: balance })
                    }
                }
                return ft
            }, [])
    }

/**
 * Get fungible tokens with balance for all accounts.
 */
export const getFungibleTokensForAllAccounts = (state: RootState) => {
    const tokens = getFungibleTokens(state)
    const accountBalances = getAllBalances(state)

    return accountBalances.reduce<FungibleTokenWithBalance[]>(
        (output, balance) => {
            const tok = tokens.find(t =>
                AddressUtils.compareAddresses(t.address, balance.tokenAddress),
            )
            if (tok) output.push({ ...tok, balance })
            return output
        },
        [],
    )
}

/**
 * VeChain (VET & VTHO) tokens should always be displayed even with a 0 balance.
 */
const isVechainTokenOrNonZeroBalance = (
    token: FungibleToken,
    balance: string,
) => {
    return token.symbol === "VET" || token.symbol === "VTHO" || balance !== "0"
}

/**
 * Get fungible tokens with balance for the current selected account.
 */
export const getFungibleTokensForSelectedAccount = (state: RootState) => {
    const currentAccount = getCurrentAccount(state)
    if (!currentAccount) return []
    return getFungibleTokensForAccount(currentAccount.address)(state)
}
