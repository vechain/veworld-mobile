import { createSelector } from "@reduxjs/toolkit"
import { FormattingUtils } from "~Common"
import { AddressUtils } from "~Utils"
import { selectSelectedAccount } from "./Account"
import { VET, VTHO } from "~Common/Constant"
import { RootState } from "~Storage/Redux/Types"
import { selectCurrencyExchangeRate } from "./Currency"
import { BigNumber } from "bignumber.js"
import { selectSelectedNetwork } from "./Network"
import { FungibleToken, FungibleTokenWithBalance } from "~Model"
import {
    selectCustomTokensForNetwork,
    selectFungibleTokensAll,
} from "./TokenBalances"

export const selectBalancesState = (state: RootState) => state.balances

/**
 * Get all balances of the selected account
 */
export const selectSelectedAccountBalances = createSelector(
    [selectBalancesState, selectSelectedAccount, selectSelectedNetwork],
    (balances, account, network) =>
        balances.filter(
            balance =>
                AddressUtils.compareAddresses(
                    balance.accountAddress,
                    account.address,
                ) && network.genesis.id === balance?.genesisId,
        ),
)

/**
 * Get all balances of a specific account
 */
export const selectAccountBalances = createSelector(
    [
        selectBalancesState,
        selectSelectedNetwork,
        (_: RootState, accountAddress: string) => accountAddress,
    ],
    (balances, network, accountAddress) =>
        balances.filter(
            balance =>
                AddressUtils.compareAddresses(
                    balance.accountAddress,
                    accountAddress,
                ) && network.genesis.id === balance?.genesisId,
        ),
)

export const selectAccountCustomTokens = createSelector(
    selectCustomTokensForNetwork,
    selectSelectedAccountBalances,
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
 * Get all account balances with related token data
 */
export const selectTokensWithBalances = createSelector(
    [
        selectSelectedAccountBalances,
        selectFungibleTokensAll,
        selectAccountCustomTokens,
    ],
    (balances, tokens, customTokens): FungibleTokenWithBalance[] =>
        balances.map(balance => {
            const balanceToken = [...tokens, ...customTokens].find(token =>
                AddressUtils.compareAddresses(
                    token.address,
                    balance.tokenAddress,
                ),
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
        }),
)

/**
 * Get account token balances without vechain tokens
 */
export const selectNonVechainTokensWithBalances = createSelector(
    [selectTokensWithBalances],
    (tokensWithBalance): FungibleTokenWithBalance[] =>
        tokensWithBalance
            .filter(
                tokenWithBalance =>
                    tokenWithBalance.symbol !== VET.symbol &&
                    tokenWithBalance.symbol !== VTHO.symbol,
            )
            .sort((a, b) => a.balance.position!! - b.balance.position!!),
)

/**
 * Get just vet token and related balance
 */
export const selectVetTokenWithBalance = createSelector(
    [selectTokensWithBalances],
    (tokensWithBalance): FungibleTokenWithBalance | undefined =>
        tokensWithBalance.find(
            tokenWithBalance => tokenWithBalance.symbol === VET.symbol,
        ),
)

/**
 * Get just vtho balance
 */
export const selectVthoTokenWithBalance = createSelector(
    [selectTokensWithBalances],
    tokensWithBalance =>
        tokensWithBalance.find(
            tokenWithBalance => tokenWithBalance.symbol === VTHO.symbol,
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
                vetBalance?.balance.balance || "0",
                vetExchangeRate?.rate || 0,
                VET.decimals,
            ),
        )
            .plus(
                FormattingUtils.convertToFiatBalance(
                    vthoBalance?.balance.balance || "0",
                    vthoExchangeRate?.rate || 0,
                    VTHO.decimals,
                ),
            )
            .toString()
    },
)

export const selectVetBalance = createSelector(
    [selectVetTokenWithBalance],
    vetBalance => {
        return new BigNumber(
            FormattingUtils.convertToFiatBalance(
                vetBalance?.balance.balance || "0",
                1,
                VET.decimals,
            ),
        ).toString()
    },
)
