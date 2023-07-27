import { createSelector } from "@reduxjs/toolkit"
import { RootState } from "../Types"
import { Activity, ActivityStatus, ActivityType } from "~Model"
import { selectSelectedNetwork } from "./Network"
import { selectSelectedAccount } from "./Account"
import { genesisesId } from "~Constants"

export const selectActivitiesState = (state: RootState) => state.activities

/**
 * Gets all activities for ALL accounts
 * @param state
 */
export const selectAllActivities = createSelector(
    selectActivitiesState,
    state => {
        let allActivities: Activity[] = []

        Object.values(state).forEach(activities => {
            allActivities = [
                ...allActivities,
                ...activities.transactionActivitiesMainnet,
                ...activities.transactionActivitiesTestnet,
                ...activities.nonTransactionActivities,
            ]
        })

        return allActivities
    },
)

/**
 * select a specific activity by txId
 * @param txId the txId of the activity to select
 * @returns {Activity | undefined} - The activity with the specified txId, or undefined if not found.
 */
export const selectActivity = createSelector(
    [
        selectAllActivities,
        selectSelectedNetwork,
        (state: RootState, txId: string) => txId,
    ],
    (activities, network, txId) => {
        return activities.find(
            act =>
                act.id.toLowerCase() === txId.toLowerCase() &&
                act.genesisId === network.genesis.id,
        )
    },
)

/**
 * Gets all activities for the current network
 * @param state
 */
export const selectCurrentNetworkActivities = createSelector(
    selectAllActivities,
    selectSelectedNetwork,
    (activities, network) => {
        return activities.filter(act => act.genesisId === network.genesis.id)
    },
)

/**
 * Gets all transaction activities for the current account and network
 */
export const selectCurrentTransactionActivities = createSelector(
    selectActivitiesState,
    selectSelectedNetwork,
    selectSelectedAccount,
    (activitiesState, network, account) => {
        if (account.address && activitiesState[account.address.toLowerCase()]) {
            if (network.genesis.id === genesisesId.main)
                return activitiesState[
                    account.address.toLowerCase()
                ].transactionActivitiesMainnet.filter(
                    act => act.genesisId === network.genesis.id,
                )
            else
                return activitiesState[
                    account.address.toLowerCase()
                ].transactionActivitiesTestnet.filter(
                    act => act.genesisId === network.genesis.id,
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
        if (account.address && activitiesState[account.address.toLowerCase()]) {
            return activitiesState[
                account.address.toLowerCase()
            ].nonTransactionActivities
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
    selectCurrentActivities,
    activities =>
        activities.filter(
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
