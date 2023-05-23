import { createSelector } from "@reduxjs/toolkit"
import { RootState } from "../Types"
import { Activity, ActivityStatus, ActivityType } from "~Model"
import { selectSelectedNetwork } from "./Network"
import { selectSelectedAccount } from "./Account"

export const selectActivitiesState = (state: RootState) => state.activities

/**
 * Gets all activities for ALL accounts
 * @param state
 */
export const selectAllActivities = (state: RootState) => {
    let allActivities: Activity[] = []
    Object.values(state.activities).forEach(activities => {
        allActivities = [
            ...allActivities,
            ...activities.transactionActivities,
            ...activities.nonTransactionActivities,
        ]
    })
    return allActivities
}

/**
 * select a specific activity by txId
 * @param txId the txId of the activity to select
 * @returns {Activity | undefined} - The activity with the specified txId, or undefined if not found.
 */
export const selectActivity = (txId: string) =>
    createSelector(selectAllActivities, activities =>
        activities.find(activity => activity.id === txId),
    )

/**
 * Gets all activities for the current network
 * @param state
 */
export const selectCurrentNetworkActivities = createSelector(
    selectAllActivities,
    selectSelectedNetwork,
    (activities, network) =>
        activities.filter(act => act.genesisId === network?.genesis.id),
)

/**
 * Gets all transaction activities for the current account and network
 */
export const selectCurrentTransactionActivities = createSelector(
    selectActivitiesState,
    selectSelectedNetwork,
    selectSelectedAccount,
    (activitiesState, network, account) => {
        if (
            account?.address &&
            activitiesState[account.address]?.transactionActivities
        ) {
            return activitiesState[
                account.address
            ].transactionActivities.filter(
                act => act.genesisId === network?.genesis.id,
            )
        }

        return []
    },
)

/**
 * Gets all activities for the current account and network
 */
export const selectCurrentActivities = createSelector(
    selectActivitiesState,
    selectSelectedNetwork,
    selectSelectedAccount,
    selectCurrentTransactionActivities,
    (activitiesState, network, account, currentTransactionActivities) => {
        if (
            account?.address &&
            activitiesState[account.address]?.nonTransactionActivities
        ) {
            return activitiesState[account.address].nonTransactionActivities
                .filter(act => act.genesisId === network?.genesis.id)
                .concat(currentTransactionActivities)
                .sort((a, b) => b.timestamp - a.timestamp)
        }

        return []
    },
)

/**
 * Get all activities that aren't finalised
 */
export const selectActivitiesWithoutFinality = createSelector(
    selectAllActivities,
    allActivities =>
        allActivities.filter(
            activity =>
                activity.isTransaction &&
                activity.status === ActivityStatus.PENDING,
        ),
)

/**
 * Get all activities with type ActivityType.FUNGIBLE_TOKEN or ActivityType.VET_TRANSFER for current account
 */
export const selectCurrentFungibleTokenActivities = createSelector(
    selectCurrentActivities,
    currentActivities =>
        currentActivities.filter(
            activity =>
                activity.type === ActivityType.VET_TRANSFER ||
                activity.type === ActivityType.FUNGIBLE_TOKEN,
        ),
)
