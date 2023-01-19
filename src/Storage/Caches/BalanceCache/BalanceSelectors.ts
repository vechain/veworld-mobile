// import { RootState } from "../cache"
// import AddressUtils from "../../../common/utils/AddressUtils"
// import { getCurrentNetwork } from "../SettingsCache"
// import { getCurrentAccount } from "../AccountCache"
// import { createSelector } from "@reduxjs/toolkit"

// export const getAllBalances = (state: RootState) => state.balances

// /**
//  * Gets all balances for the current network
//  */
// export const getBalances = createSelector(
//     getCurrentNetwork,
//     getAllBalances,
//     (network, balances) =>
//         balances.filter(b => b.genesisId == network.genesis.id),
// )

// interface BalanceForAccountProps {
//     tokenAddress: string
//     accountAddress: string
// }

// /**
//  * Get the token balance for an account for the current network
//  */
// export const getBalanceForAccount = createSelector(
//     [getBalances, (_, props: BalanceForAccountProps) => props],
//     (balances, { tokenAddress, accountAddress }) =>
//         balances.find(
//             b =>
//                 AddressUtils.compareAddresses(b.tokenAddress, tokenAddress) &&
//                 AddressUtils.compareAddresses(b.accountAddress, accountAddress),
//         ),
// )

// /**
//  * Get the token balance for the current account for the current network
//  */
// export const getBalanceForCurrentAccount = createSelector(
//     [getBalances, getCurrentAccount, (_, tokenAddress: string) => tokenAddress],
//     (balances, account, tokenAddress) =>
//         balances.find(
//             b =>
//                 AddressUtils.compareAddresses(b.tokenAddress, tokenAddress) &&
//                 AddressUtils.compareAddresses(
//                     b.accountAddress,
//                     account?.address,
//                 ),
//         ),
// )

// /**
//  * Get all token balances for an account for the current network
//  */
// export const getBalancesForAccount = createSelector(
//     [getBalances, (_, accountAddress: string) => accountAddress],
//     (balances, accountAddress) =>
//         balances.filter(b =>
//             AddressUtils.compareAddresses(b.accountAddress, accountAddress),
//         ),
// )

// /**
//  * Get all balances for the current account for the current network
//  */
// export const getBalancesForCurrentAccount = createSelector(
//     getBalances,
//     getCurrentAccount,
//     (balances, account) =>
//         balances.filter(b =>
//             AddressUtils.compareAddresses(b.accountAddress, account?.address),
//         ),
// )
