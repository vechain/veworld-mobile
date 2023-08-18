import { createSelector } from "@reduxjs/toolkit"
import { FormattingUtils } from "~Utils"
import { selectSelectedAccount } from "./Account"
import { VET, VTHO } from "~Constants"
import { RootState } from "~Storage/Redux/Types"
import { selectCurrencyExchangeRate } from "./Currency"
import { BigNumber } from "bignumber.js"
import { selectSelectedNetwork } from "./Network"
import {
    FungibleToken,
    FungibleTokenWithBalance,
    TokenWithCompleteInfo,
} from "~Model"
import {
    selectAllTokens,
    selectCustomTokens,
    selectSuggestedTokens,
    selectTokensWithInfo,
} from "./Tokens"
import { compareAddresses } from "~Utils/AddressUtils/AddressUtils"
import { compareSymbols } from "~Utils/TokenUtils/TokenUtils"

export const selectBalancesState = (state: RootState) => state.balances

export const selectAllBalances = createSelector(
    [selectBalancesState, selectSelectedNetwork, selectSelectedAccount],
    (balances, network, account) => {
        const netBalances = balances[network.type]
        if (!netBalances) return []

        return netBalances[account.address] ?? []
    },
)

export const selectVisibleBalances = createSelector(
    [selectAllBalances],
    balances => {
        return balances.filter(balance => !balance.isHidden)
    },
)

export const selectBalanceForToken = createSelector(
    [selectAllBalances, (_: RootState, tokenAddress: string) => tokenAddress],
    (balances, tokenAddress) => {
        return balances.find(balance =>
            compareAddresses(balance.tokenAddress, tokenAddress),
        )
    },
)

export const selectVetBalance = createSelector(
    [selectAllBalances],
    balances => {
        return balances.find(balance =>
            compareAddresses(balance.tokenAddress, VET.address),
        )
    },
)

export const selectVthoBalance = createSelector(
    [selectAllBalances],
    balances => {
        return balances.find(balance =>
            compareAddresses(balance.tokenAddress, VTHO.address),
        )
    },
)

/**
 * Get all balances of a specific account
 */
export const selectAllBalancesForAccount = createSelector(
    [
        selectBalancesState,
        selectSelectedNetwork,
        (_: RootState, accountAddress: string) => accountAddress,
    ],
    (balances, network, accountAddress) => {
        const netBalances = balances[network.type]
        if (!netBalances) return []

        return netBalances[accountAddress] ?? []
    },
)

export const selectBalancesForAccount = createSelector(
    [selectAllBalancesForAccount],
    balances => {
        return balances.filter(balance => !balance.isHidden)
    },
)

export const selectVisibleCustomTokens = createSelector(
    selectCustomTokens,
    selectVisibleBalances,
    (tokens, balances) => {
        const accountTokenAddresses = balances.map(
            balance => balance.tokenAddress,
        )
        return tokens.filter((token: FungibleToken) =>
            accountTokenAddresses.includes(token.address),
        )
    },
)

/**
 * Get balances with related token data for selected account
 */
export const selectTokensWithBalances = createSelector(
    [selectVisibleBalances, selectAllTokens],
    (balances, tokens): FungibleTokenWithBalance[] => {
        return balances
            .filter(
                b =>
                    tokens.findIndex(t =>
                        compareAddresses(t.address, b.tokenAddress),
                    ) !== -1,
            )
            .map(balance => {
                const balanceToken = tokens.find(token =>
                    compareAddresses(token.address, balance.tokenAddress),
                )
                if (!balanceToken) {
                    throw new Error(
                        `Unable to find token with this address: ${balance.tokenAddress}`,
                    )
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
        tokensWithBalance.filter(
            tokenWithBalance =>
                !compareAddresses(tokenWithBalance.address, VET.address) &&
                !compareAddresses(tokenWithBalance.address, VTHO.address),
        ),
)

/**
 * Get just vet token and related balance for selected account
 */
export const selectVetTokenWithBalance = createSelector(
    selectSelectedAccount,
    selectTokensWithBalances,
    (account, tokensWithBalance) =>
        tokensWithBalance.find(tokenWithBalance =>
            compareAddresses(tokenWithBalance.address, VET.address),
        ),
)

/**
 * Get just vtho balance for selected account
 */
export const selectVthoTokenWithBalance = createSelector(
    selectSelectedAccount,
    selectTokensWithBalances,
    (account, tokensWithBalance) =>
        tokensWithBalance.find(tokenWithBalance =>
            compareAddresses(tokenWithBalance.address, VTHO.address),
        ),
)

export const selectSendableTokensWithBalance = createSelector(
    [
        selectVetTokenWithBalance,
        selectVthoTokenWithBalance,
        selectNonVechainTokensWithBalances,
    ],
    (
        vetTokenWithBalance,
        vthoTokenWithBalance,
        nonVechainTokensWithBalances,
    ) => {
        const balances = [
            vetTokenWithBalance,
            vthoTokenWithBalance,
            ...nonVechainTokensWithBalances,
        ]
        return balances.filter(
            tokenWithBalance =>
                tokenWithBalance &&
                !new BigNumber(tokenWithBalance.balance.balance).isZero(),
        ) as FungibleTokenWithBalance[]
    },
)

export const selectFiatBalance = createSelector(
    [
        selectVetTokenWithBalance,
        state => selectCurrencyExchangeRate(state, "VET"),
        selectVthoTokenWithBalance,
        state => selectCurrencyExchangeRate(state, "VTHO"),
    ],
    (vetBalance, vetExchangeRate, vthoBalance, vthoExchangeRate) => {
        return new BigNumber(
            FormattingUtils.convertToFiatBalance(
                vetBalance?.balance.balance ?? "0",
                vetExchangeRate?.rate ?? 0,
                VET.decimals,
            ),
        )
            .plus(
                FormattingUtils.convertToFiatBalance(
                    vthoBalance?.balance.balance ?? "0",
                    vthoExchangeRate?.rate ?? 0,
                    VTHO.decimals,
                ),
            )
            .toString()
    },
)

export const selectVetTokenWithBalanceByAccount = createSelector(
    [
        selectBalancesState,
        selectSelectedNetwork,
        (_: RootState, accountAddress: string) => accountAddress,
    ],
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

        const balance = netBalances[accountAddress].find(
            _balance => _balance.tokenAddress === VET.address,
        )

        if (!balance) return defaultVetWithBalance

        return {
            ...VET,
            balance,
        }
    },
)

export const selectVetBalanceByAccount = createSelector(
    [selectVetTokenWithBalanceByAccount],
    vetBalance => {
        return new BigNumber(
            FormattingUtils.convertToFiatBalance(
                vetBalance?.balance.balance ?? "0",
                1,
                VET.decimals,
            ),
        ).toString()
    },
)

export const selectVthoTokenWithBalanceByAccount = createSelector(
    [
        selectBalancesState,
        selectSelectedNetwork,
        (_: RootState, accountAddress: string) => accountAddress,
    ],
    (balances, network, accountAddress) => {
        const defaultVetWithBalance = {
            ...VTHO,
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

        const balance = netBalances[accountAddress].find(
            _balance => _balance.tokenAddress === VTHO.address,
        )

        if (!balance) return defaultVetWithBalance

        return {
            ...VTHO,
            balance,
        }
    },
)

export const selectVthoBalanceByAccount = createSelector(
    [selectVthoTokenWithBalanceByAccount],
    vthoBalance => {
        return new BigNumber(
            FormattingUtils.convertToFiatBalance(
                vthoBalance?.balance.balance ?? "0",
                1,
                VTHO.decimals,
            ),
        ).toString()
    },
)

export const selectMissingSuggestedTokens = createSelector(
    [selectSuggestedTokens, selectAllBalances],
    (suggestedTokens, allBalances) => {
        return suggestedTokens.filter(
            tokenAddress =>
                !allBalances.find(balance =>
                    compareAddresses(balance.tokenAddress, tokenAddress),
                ),
        )
    },
)

export const selectVetTokenWithInfo = createSelector(
    selectTokensWithInfo,
    selectVetBalance,
    (tokens, balance) => {
        const tokenWithInfo = tokens.find(t =>
            compareSymbols(t.symbol, VET.symbol),
        )

        if (!tokenWithInfo) return VET as TokenWithCompleteInfo

        return {
            ...tokenWithInfo,
            balance,
        }
    },
)

export const selectVthoTokenWithInfo = createSelector(
    selectTokensWithInfo,
    selectVthoBalance,
    (tokens, balance) => {
        const tokenWithInfo = tokens.find(t =>
            compareAddresses(t.address, VTHO.address),
        )

        if (!tokenWithInfo) return VTHO as TokenWithCompleteInfo

        return {
            ...tokenWithInfo,
            balance: balance,
        }
    },
)
