// import { RootState } from "../cache"

// import AddressUtils from "../../../common/utils/AddressUtils"
// import { ActivityType } from "../../model/Activity/enum"
// import { createSelector } from "@reduxjs/toolkit"
// import { getCurrentAccount } from "../AccountCache"
// import { getCurrentNetwork } from "../SettingsCache"

// /**
//  * Gets all activities for ALL accounts
//  * @param state
//  */
// export const getAllActivities = (state: RootState) => state.activities

// export const getActivity = (txId: string) => (state: RootState) => {
//     return state.activities.find(activity => activity.id === txId)
// }

// /**
//  * Gets all activities for the current account and network
//  * @param state
//  */
// export const getCurrentActivities = createSelector(
//     getCurrentAccount,
//     getCurrentNetwork,
//     getAllActivities,
//     (account, network, allActivities) =>
//         allActivities.filter(
//             act =>
//                 AddressUtils.compareAddresses(act.from, account?.address) &&
//                 act.networkId === network?.id,
//         ),
// )

// /**
//  * Get all activities that aren't finalised
//  */
// export const getActivitiesWithoutFinality = createSelector(
//     getAllActivities,
//     allActivities =>
//         allActivities.filter(
//             activity => !activity.finality && activity.isTransaction,
//         ),
// )

// /**
//  * Get all activities with type ActivityType.FUNGIBLE_TOKEN for current account
//  */
// export const getCurrentFungibleTokenActivities = createSelector(
//     getCurrentActivities,
//     currentActivities =>
//         currentActivities.filter(
//             activity => activity.type === ActivityType.FUNGIBLE_TOKEN,
//         ),
// )
