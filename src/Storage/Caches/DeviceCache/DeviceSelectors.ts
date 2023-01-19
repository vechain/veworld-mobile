// import { createSelector } from "@reduxjs/toolkit"
// import { RootState } from "../cache"
// import AddressUtils from "../../../common/utils/AddressUtils"
// import { DEVICE_TYPE } from "../../model/Wallet/enums"
// import { GroupedAccounts, WalletAccount } from "../../model/Account"
// import { getAllAccounts, getCurrentAccount } from "../AccountCache"

// export const getAllDevices = (state: RootState) => state.devices

// export const getAllDevicesForType = createSelector(
//     [getAllDevices, (_, walletType: DEVICE_TYPE) => walletType],
//     (allDevices, walletType) =>
//         allDevices.filter(device => device.type === walletType),
// )

// export const getDevice = createSelector(
//     [getAllDevices, (_, rootAddress?: string) => rootAddress],
//     (allDevices, rootAddress) =>
//         allDevices.find(dev =>
//             AddressUtils.compareAddresses(dev.rootAddress, rootAddress),
//         ),
// )

// /**
//  * Return a list of the devices with an associated mnemonic
//  */
// export const getMnemonicDevices = createSelector(getAllDevices, allDevices =>
//     allDevices.filter(dev => dev.type === DEVICE_TYPE.LOCAL_MNEMONIC),
// )

// /**
//  * Get device for the current account
//  * @param device
//  */
// export const getCurrentDevice = createSelector(
//     getAllDevices,
//     getCurrentAccount,
//     (allDevices, account) =>
//         allDevices.find(device =>
//             AddressUtils.compareAddresses(
//                 account?.rootAddress,
//                 device.rootAddress,
//             ),
//         ),
// )

// /**
//  * Get the device for the given account
//  * @param device
//  */
// export const getDeviceForAccount = createSelector(
//     [getAllDevices, (_, account?: WalletAccount) => account],
//     (allDevices, account) =>
//         allDevices.find(device =>
//             AddressUtils.compareAddresses(
//                 account?.rootAddress,
//                 device.rootAddress,
//             ),
//         ),
// )

// /**
//  * Gets a list of accounts grouped by their wallet/device
//  */
// export const getGroupedAccounts = createSelector(
//     getAllAccounts,
//     getAllDevices,
//     (allAccounts, allDevices): GroupedAccounts[] =>
//         allDevices.map(device => ({
//             device: device,
//             accounts: allAccounts.filter(acc =>
//                 AddressUtils.compareAddresses(
//                     acc.rootAddress,
//                     device.rootAddress,
//                 ),
//             ),
//         })),
// )
