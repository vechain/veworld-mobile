import { createSelector } from "@reduxjs/toolkit"
import { RootState } from "../Types"
import { ActivityStatus, ActivityType } from "~Model"
import { selectSelectedNetwork } from "./Network"
import { selectSelectedAccount } from "./Account"
import { AddressUtils } from "~Common"

/**
 * Gets all activities for ALL accounts
 * @param state
 */
export const selectAllActivities = (state: RootState) => state.activities

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
 * Gets all activities for the current account and network
 * @param state
 */
export const selectCurrentActivities = createSelector(
    selectCurrentNetworkActivities,
    selectSelectedAccount,
    (activities, account) =>
        activities
            // Filter account TXs and Account delegations
            .filter(act => {
                const byFromAccount = AddressUtils.compareAddresses(
                    act.from,
                    account?.address,
                )

                const byDelegator =
                    act.txReceipt?.gasPayer &&
                    AddressUtils.compareAddresses(
                        act.txReceipt?.gasPayer,
                        account?.address,
                    )

                return byFromAccount || byDelegator
            })
            //Convert delegated transactions to a new type (DELEGATED_TRANSACTION)
            .map(act => {
                const isAccountDelegator =
                    act.txReceipt &&
                    !AddressUtils.compareAddresses(
                        act.txReceipt.meta.txOrigin,
                        account?.address,
                    )

                if (isAccountDelegator)
                    return {
                        ...act,
                        type: ActivityType.DELEGATED_TRANSACTION,
                    }

                return act
            }),
)

/**
 * Get all activities that aren't finalised
 */
export const selectActivitiesWithoutFinality = createSelector(
    selectAllActivities,
    allActivities =>
        allActivities.filter(
            activity =>
                !activity.finality &&
                activity.isTransaction &&
                activity.status !== ActivityStatus.REVERTED,
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
