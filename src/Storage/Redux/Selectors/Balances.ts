import { createSelector } from "@reduxjs/toolkit"
import { BigNumber } from "bignumber.js"
import sortBy from "lodash/sortBy"
import { B3TR, VET, VOT3, VTHO } from "~Constants"
import { FungibleToken, FungibleTokenWithBalance } from "~Model"
import { RootState } from "~Storage/Redux/Types"
import { compareAddresses } from "~Utils/AddressUtils/AddressUtils"
import { selectSelectedAccount } from "./Account"
import { selectSelectedNetwork } from "./Network"
import { selectAllTokens, selectCustomTokens, selectSuggestedTokens } from "./Tokens"

export const selectBalancesState = (state: RootState) => state.balances

export const selectAllBalances = createSelector(
    [selectBalancesState, selectSelectedNetwork, selectSelectedAccount],
    (balances, network, account) => {
        const netBalances = balances[network.type]
        if (!netBalances) return []

        return netBalances[account.address] ?? []
    },
)

export const selectVisibleBalances = createSelector([selectAllBalances], balances => {
    return balances.filter(balance => !balance.isHidden)
})

export const selectBalanceForToken = createSelector(
    [selectAllBalances, (_: RootState, tokenAddress: string) => tokenAddress],
    (balances, tokenAddress) => {
        return balances.find(balance => compareAddresses(balance.tokenAddress, tokenAddress))
    },
)

export const selectVetBalance = createSelector([selectAllBalances], balances => {
    return balances.find(balance => compareAddresses(balance.tokenAddress, VET.address))
})

export const selectVthoBalance = createSelector([selectAllBalances], balances => {
    return balances.find(balance => compareAddresses(balance.tokenAddress, VTHO.address))
})

/**
 * Get all balances of a specific account
 */
export const selectAllBalancesForAccount = createSelector(
    [selectBalancesState, selectSelectedNetwork, (_: RootState, accountAddress: string) => accountAddress],
    (balances, network, accountAddress) => {
        const netBalances = balances[network.type]
        if (!netBalances) return []

        return netBalances[accountAddress] ?? []
    },
)

export const selectBalancesForAccount = createSelector([selectAllBalancesForAccount], balances => {
    return balances.filter(balance => !balance.isHidden)
})

export const selectVisibleCustomTokens = createSelector(
    selectCustomTokens,
    selectVisibleBalances,
    (tokens, balances) => {
        const accountTokenAddresses = balances.map(balance => balance.tokenAddress)
        return tokens.filter((token: FungibleToken) => accountTokenAddresses.includes(token.address))
    },
)

/**
 * Get balances with related token data for selected account
 */
export const selectTokensWithBalances = createSelector(
    [selectVisibleBalances, selectAllTokens],
    (balances, tokens): FungibleTokenWithBalance[] => {
        return balances
            .filter(b => tokens.findIndex(t => compareAddresses(t.address, b.tokenAddress)) !== -1)
            .map(balance => {
                const balanceToken = tokens.find(token => compareAddresses(token.address, balance.tokenAddress))
                if (!balanceToken) {
                    throw new Error(`Unable to find token with this address: ${balance.tokenAddress}`)
                }
                return {
                    ...balanceToken,
                    balance,
                }
            })
    },
)

/**
 * Get account token balances without vechain tokens
 */
export const selectNonVechainTokensWithBalances = createSelector(
    [selectTokensWithBalances],
    (tokensWithBalance): FungibleTokenWithBalance[] =>
        sortBy(
            tokensWithBalance.filter(
                (tokenWithBalance: FungibleTokenWithBalance) =>
                    !compareAddresses(tokenWithBalance.address, VET.address) &&
                    !compareAddresses(tokenWithBalance.address, VTHO.address) &&
                    !compareAddresses(tokenWithBalance.address, B3TR.address) &&
                    !compareAddresses(tokenWithBalance.address, VOT3.address),
            ),
            balance => balance.balance.position,
        ),
)

/**
 * Get just vet token and related balance for selected account
 */
export const selectVetTokenWithBalance = createSelector(
    selectSelectedAccount,
    selectTokensWithBalances,
    (account, tokensWithBalance) =>
        tokensWithBalance.find(tokenWithBalance => compareAddresses(tokenWithBalance.address, VET.address)),
)

/**
 * Get just vtho balance for selected account
 */
export const selectVthoTokenWithBalance = createSelector(
    selectSelectedAccount,
    selectTokensWithBalances,
    (account, tokensWithBalance) =>
        tokensWithBalance.find(tokenWithBalance => compareAddresses(tokenWithBalance.address, VTHO.address)),
)

/**
 * Get just b3tr balance for selected account
 */
export const selectB3trTokenWithBalance = createSelector(
    selectSelectedAccount,
    selectTokensWithBalances,
    (account, tokensWithBalance) =>
        tokensWithBalance.find(tokenWithBalance => compareAddresses(tokenWithBalance.address, B3TR.address)),
)

/**
 * Get just vot3 balance for selected account
 */
export const selectVot3TokenWithBalance = createSelector(
    selectSelectedAccount,
    selectTokensWithBalances,
    (account, tokensWithBalance) =>
        tokensWithBalance.find(tokenWithBalance => compareAddresses(tokenWithBalance.address, VOT3.address)),
)

export const selectSendableTokensWithBalance = createSelector(
    [
        selectVetTokenWithBalance,
        selectB3trTokenWithBalance,
        selectVthoTokenWithBalance,
        selectVot3TokenWithBalance,
        selectNonVechainTokensWithBalances,
    ],
    (
        vetTokenWithBalance,
        b3trTokenWithBalance,
        vthoTokenWithBalance,
        vot3TokenWithBalance,
        nonVechainTokensWithBalances,
    ) => {
        const balances = [
            vetTokenWithBalance,
            b3trTokenWithBalance,
            vthoTokenWithBalance,
            vot3TokenWithBalance,
            ...nonVechainTokensWithBalances,
        ]
        return balances.filter(
            tokenWithBalance => tokenWithBalance && !new BigNumber(tokenWithBalance.balance.balance).isZero(),
        ) as FungibleTokenWithBalance[]
    },
)

export const selectVetTokenWithBalanceByAccount = createSelector(
    [selectBalancesState, selectSelectedNetwork, (_: RootState, accountAddress: string) => accountAddress],
    (balances, network, accountAddress) => {
        const defaultVetWithBalance = {
            ...VET,
            balance: {
                balance: "0",
                accountAddress,
                tokenAddress: VET.address,
                isCustomToken: false,
            },
        }

        const netBalances = balances[network.type]
        if (!netBalances) return defaultVetWithBalance

        const balancesForAccount = netBalances[accountAddress]
        if (!balancesForAccount) return defaultVetWithBalance

        const balance = netBalances[accountAddress].find(_balance => _balance.tokenAddress === VET.address)

        if (!balance) return defaultVetWithBalance

        return {
            ...VET,
            balance,
        }
    },
)

export const selectVetBalanceByAccount = createSelector([selectVetTokenWithBalanceByAccount], vetBalance => {
    return vetBalance?.balance.balance ?? "0"
})

export const selectVthoTokenWithBalanceByAccount = createSelector(
    [selectBalancesState, selectSelectedNetwork, (_: RootState, accountAddress: string) => accountAddress],
    (balances, network, accountAddress) => {
        const defaultVetWithBalance = {
            ...VTHO,
            balance: {
                balance: "0",
                accountAddress,
                tokenAddress: VTHO.address,
                isCustomToken: false,
            },
        }

        const netBalances = balances[network.type]
        if (!netBalances) return defaultVetWithBalance

        const balancesForAccount = netBalances[accountAddress]
        if (!balancesForAccount) return defaultVetWithBalance

        const balance = netBalances[accountAddress].find(_balance => _balance.tokenAddress === VTHO.address)

        if (!balance) return defaultVetWithBalance

        return {
            ...VTHO,
            balance,
        }
    },
)

export const selectVthoBalanceByAccount = createSelector([selectVthoTokenWithBalanceByAccount], vthoBalance => {
    return vthoBalance?.balance.balance ?? "0"
})

export const selectMissingSuggestedTokens = createSelector(
    [selectSuggestedTokens, selectAllBalances],
    (suggestedTokens, allBalances) => {
        return suggestedTokens.filter(
            tokenAddress => !allBalances.find(balance => compareAddresses(balance.tokenAddress, tokenAddress)),
        )
    },
)
