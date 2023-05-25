import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { Activity } from "~Model"
import { AccountActivities } from "../Types"
import { ActivityUtils } from "~Utils"

/**
 * Represents the activities related to an account.
 * It keeps transaction and non-transaction activities separate to facilitate handling
 * activities that are not transactions so they don't get mixed with transactional ones.
 *
 * Mapping account address => AccountActivities
 */
type ActivitiesSliceState = Record<string, AccountActivities>

export const initialActivitiesState: ActivitiesSliceState = {}

export const ActivitiesSlice = createSlice({
    name: "activities",
    initialState: initialActivitiesState,
    reducers: {
        /**
         * Updates or inserts an activity for the given address.
         * It separately handles transactional and non-transactional activities.
         */
        upsertActivity: (
            state,
            action: PayloadAction<{ address: string; activity: Activity }>,
        ) => {
            const { address, activity } = action.payload

            if (!state[address]) {
                state[address] = {
                    transactionActivities: [],
                    nonTransactionActivities: [],
                }
            }

            const activities: AccountActivities = state[address]

            const allActivities = [
                ...activities.transactionActivities,
                ...activities.nonTransactionActivities,
            ]

            const activityIndex = allActivities.findIndex(
                existingActivity => existingActivity.id === activity.id,
            )

            if (activityIndex !== -1) {
                if (ActivityUtils.isTransactionActivity(activity))
                    activities.transactionActivities[activityIndex] = activity
                else
                    activities.nonTransactionActivities[activityIndex] =
                        activity
            } else {
                if (ActivityUtils.isTransactionActivity(activity))
                    activities.transactionActivities.unshift(activity)
                else activities.nonTransactionActivities.unshift(activity)
            }

            state[address] = activities
        },
        updateTransactionActivities: (
            state,
            action: PayloadAction<{ address: string; activities: Activity[] }>,
        ) => {
            const { address, activities: newActivities } = action.payload

            const existingActivities = state[address]

            if (!existingActivities) {
                state[address] = {
                    transactionActivities: newActivities,
                    nonTransactionActivities: [],
                }
            } else {
                state[address] = {
                    transactionActivities: newActivities,
                    nonTransactionActivities:
                        existingActivities.nonTransactionActivities,
                }
            }
        },
    },
})

export const { upsertActivity, updateTransactionActivities } =
    ActivitiesSlice.actions
