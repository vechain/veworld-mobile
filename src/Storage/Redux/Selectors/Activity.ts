import { createSelector } from "@reduxjs/toolkit"
import { ActivityStatus } from "~Model"
import { ActivityUtils, AddressUtils } from "~Utils"
import { RootState } from "../Types"
import { selectSelectedAccount } from "./Account"
import { selectSelectedNetwork } from "./Network"

export const selectActivitiesState = (state: RootState) => state.activities

/**
 * Gets all activities for ALL accounts
 * @param state
 */
export const selectAllActivities = createSelector(selectActivitiesState, state => {
    return state.activities
})

export const selectAllActivitiesByAccountAddressAndNetwork = createSelector(
    [selectAllActivities, selectSelectedNetwork, selectSelectedAccount],
    (activities, network, account) => {
        return activities.filter(
            activity =>
                AddressUtils.compareAddresses(activity.from, account.address) &&
                activity.genesisId === network.genesis.id,
        )
    },
)

/**
 * select a specific activity by txId
 * @param txId the txId of the activity to select
 * @returns {Activity | undefined} - The activity with the specified txId, or undefined if not found.
 */
export const selectActivity = createSelector(
    [selectAllActivities, (state: RootState, txId: string) => txId],
    (activities, txId) => {
        return activities.find(
            act => act.id.toLowerCase() === txId.toLowerCase() || act?.txId?.toLowerCase() === txId.toLowerCase(),
        )
    },
)

/**
 * Gets all transaction activities for the current account and network
 */
export const selectCurrentTransactionActivities = createSelector(
    selectAllActivitiesByAccountAddressAndNetwork,
    activities => {
        return activities.filter(activity => ActivityUtils.isTransactionActivity(activity))
    },
)

/**
 * Get all activities that aren't finalised
 */
export const selectActivitiesWithoutFinality = createSelector(
    selectAllActivitiesByAccountAddressAndNetwork,
    activities =>
        activities.filter(
            activity => ActivityUtils.isTransactionActivity(activity) && activity.status === ActivityStatus.PENDING,
        ),
)
