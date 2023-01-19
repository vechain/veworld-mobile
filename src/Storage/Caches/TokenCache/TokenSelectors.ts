// import { RootState } from "../cache"
// import { FungibleToken, FungibleTokenWithBalance } from "../../model/Token"
// import { getCurrentNetwork, getHidingZeroBalances } from "../SettingsCache"
// import { getBalances } from "../BalanceCache"
// import AddressUtils from "../../../common/utils/AddressUtils"
// import { getCurrentAccount } from "../AccountCache"
// import { createSelector } from "@reduxjs/toolkit"

// export const getAllTokens = (state: RootState) => state.tokens

// export const getAllFungibleTokens = createSelector(
//     getAllTokens,
//     allTokens => allTokens.fungible,
// )

// /**
//  * Get fungible tokens for the current network
//  */
// export const getFungibleTokens = createSelector(
//     getAllFungibleTokens,
//     getCurrentNetwork,
//     (allFts, network) =>
//         allFts.filter(token => token.genesisId === network.genesis.id),
// )

// /**
//  * Get fungible token by symbol for the current network
//  */
// export const getToken = createSelector(
//     [getFungibleTokens, (_, symbol?: string) => symbol],
//     (fts, symbol) => fts.find(token => token.symbol === symbol),
// )

// /**
//  * Get fungible tokens with balance for the account.
//  */
// export const getFungibleTokensForAccount = createSelector(
//     [
//         getFungibleTokens,
//         getBalances,
//         getHidingZeroBalances,
//         (_, accountAddress: string) => accountAddress,
//     ],
//     (fts, balances, hideZeroBalance, accountAddress) => {
//         const accountBalances = balances.filter(b =>
//             AddressUtils.compareAddresses(b.accountAddress, accountAddress),
//         )

//         return fts.reduce<FungibleTokenWithBalance[]>((ft, t) => {
//             const balance = accountBalances.find(b =>
//                 AddressUtils.compareAddresses(b.tokenAddress, t.address),
//             )

//             if (balance) {
//                 const balanceValue = balance.balance
//                 if (hideZeroBalance) {
//                     if (isVechainTokenOrNonZeroBalance(t, balanceValue)) {
//                         ft.push({ ...t, balance })
//                     }
//                 } else {
//                     ft.push({ ...t, balance: balance })
//                 }
//             }
//             return ft
//         }, [])
//     },
// )

// /**
//  * VeChain (VET & VTHO) tokens should always be displayed even with a 0 balance.
//  */

// const isVechainTokenOrNonZeroBalance = (
//     token: FungibleToken,
//     balance: string,
// ) => {
//     return token.symbol === "VET" || token.symbol === "VTHO" || balance != "0"
// }

// /**
//  * Get fungible tokens with balance for all accounts.
//  */
// export const getFungibleTokensForAllAccounts = createSelector(
//     getFungibleTokens,
//     getBalances,
//     (fts, balances) =>
//         balances.reduce<FungibleTokenWithBalance[]>((output, balance) => {
//             const tok = fts.find(t =>
//                 AddressUtils.compareAddresses(t.address, balance.tokenAddress),
//             )
//             if (tok) output.push({ ...tok, balance })
//             return output
//         }, []),
// )

// /**
//  * Get fungible tokens with balance for the current selected account.
//  */
// export const getFungibleTokensForSelectedAccount = createSelector(
//     getFungibleTokens,
//     getCurrentAccount,
//     getBalances,
//     getHidingZeroBalances,
//     (fts, account, balances, hideZeroBalance) => {
//         const accountBalances = balances.filter(b =>
//             AddressUtils.compareAddresses(b.accountAddress, account?.address),
//         )

//         return fts.reduce<FungibleTokenWithBalance[]>((ft, t) => {
//             const balance = accountBalances.find(b =>
//                 AddressUtils.compareAddresses(b.tokenAddress, t.address),
//             )

//             if (balance) {
//                 const balanceValue = balance.balance
//                 if (hideZeroBalance) {
//                     if (isVechainTokenOrNonZeroBalance(t, balanceValue)) {
//                         ft.push({ ...t, balance })
//                     }
//                 } else {
//                     ft.push({ ...t, balance: balance })
//                 }
//             }
//             return ft
//         }, [])
//     },
// )
