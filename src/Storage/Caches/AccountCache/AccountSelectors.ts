// import { createSelector } from "@reduxjs/toolkit"
// import { RootState } from "../cache"
// import AddressUtils from "../../../common/utils/AddressUtils"
// import { Device } from "../../model/Device"

// export const reducer = (state: RootState) => state.account

// export const getAllAccounts = createSelector(reducer, state => state.accounts)

// export const getCurrentAccount = createSelector(
//     reducer,
//     state => state.currentAccount,
// )

// export const getVisibleAccounts = createSelector(getAllAccounts, accounts =>
//     accounts.filter(acc => acc.visible),
// )

// export const getAccount = createSelector(
//     [getCurrentAccount, getVisibleAccounts, (_, address?: string) => address],
//     (currentAccount, visibleAccounts, address) => {
//         if (!address) return currentAccount

//         return visibleAccounts.find(acc =>
//             AddressUtils.compareAddresses(acc.address, address),
//         )
//     },
// )

// export const getAccountByAddress = createSelector(
//     [getAllAccounts, (_, address?: string) => address],
//     (allAccounts, address) =>
//         allAccounts.find(
//             acc =>
//                 acc.visible &&
//                 AddressUtils.compareAddresses(acc.address, address),
//         ),
// )

// /**
//  * Gets a list of accounts managed by a given Device
//  * @param device
//  */
// export const getDeviceAccounts = createSelector(
//     [getAllAccounts, (_, device: Device) => device],
//     (allAccounts, device) =>
//         allAccounts.filter(acc =>
//             AddressUtils.compareAddresses(acc.rootAddress, device.rootAddress),
//         ),
// )
