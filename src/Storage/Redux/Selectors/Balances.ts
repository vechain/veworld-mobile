import { createSelector } from "@reduxjs/toolkit"
import { AddressUtils, FormattingUtils } from "~Common"
import { selectSelectedAccount } from "./Account"
import { VET, VTHO } from "~Common/Constant"
import {
    DenormalizedAccountTokenBalance,
    RootState,
} from "~Storage/Redux/Types"
import { selectAllFungibleTokens } from "./TokenApi"
import { getCurrencyExchangeRate } from "./Currency"
import { BigNumber } from "bignumber.js"
import { selectSelectedNetwork } from "./Network"

export const selectBalancesState = (state: RootState) => state.balances

/**
 * Get all account balances
 */
export const selectAccountBalances = createSelector(
    [selectBalancesState, selectSelectedAccount, selectSelectedNetwork],
    (balances, account, network) =>
        balances.filter(
            balance =>
                AddressUtils.compareAddresses(
                    balance.accountAddress,
                    account?.address,
                ) &&
                AddressUtils.compareAddresses(
                    network.genesisId,
                    balance?.networkGenesisId,
                ),
        ),
)

/**
 * Get all account balances with denormalized token data
 */
export const selectDenormalizedAccountTokenBalances = createSelector(
    [selectAccountBalances, selectAllFungibleTokens],
    (balances, tokens) =>
        balances.map(balance => {
            const balanceToken = tokens.find(token =>
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
                ...balance,
                token: balanceToken,
            }
        }),
)

/**
 * Get account token balances without vechain tokens
 */
export const selectNonVechainDenormalizedAccountTokenBalances = createSelector(
    [selectDenormalizedAccountTokenBalances],
    balances =>
        balances
            .filter(
                (balance: DenormalizedAccountTokenBalance) =>
                    balance.token.symbol !== VET.symbol &&
                    balance.token.symbol !== VTHO.symbol,
            )
            .sort(
                (
                    a: DenormalizedAccountTokenBalance,
                    b: DenormalizedAccountTokenBalance,
                ) => a.position!! - b.position!!,
            ),
)

/**
 * Get just vet balance
 */
export const getVetDenormalizedAccountTokenBalances = createSelector(
    [selectDenormalizedAccountTokenBalances],
    balances =>
        balances.find(
            (balance: DenormalizedAccountTokenBalance) =>
                balance.token.symbol === VET.symbol,
        ),
)

/**
 * Get just vtho balance
 */
export const getVthoDenormalizedAccountTokenBalances = createSelector(
    [selectDenormalizedAccountTokenBalances],
    balances =>
        balances.find(
            (balance: DenormalizedAccountTokenBalance) =>
                balance.token.symbol === VTHO.symbol,
        ),
)

export const getAccountBalance = createSelector(
    [
        getVetDenormalizedAccountTokenBalances,
        state => getCurrencyExchangeRate(state, "VET"),
        getVthoDenormalizedAccountTokenBalances,
        state => getCurrencyExchangeRate(state, "VTHO"),
    ],
    (vetBalance, vetExchangeRate, vthoBalance, vthoExchangeRate) => {
        return new BigNumber(
            FormattingUtils.convertToFiatBalance(
                vetBalance?.balance || "0",
                vetExchangeRate?.rate || 0,
                VET.decimals,
            ),
        )
            .plus(
                FormattingUtils.convertToFiatBalance(
                    vthoBalance?.balance || "0",
                    vthoExchangeRate?.rate || 0,
                    VTHO.decimals,
                ),
            )
            .toString()
    },
)
