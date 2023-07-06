import { createSlice, Draft, PayloadAction } from "@reduxjs/toolkit"
import { Activity } from "~Model"
import { AccountActivities } from "../Types"
import { ActivityUtils } from "~Utils"

type ActivityKeyType =
    | "transactionActivitiesMainnet"
    | "transactionActivitiesTestnet"
    | "nonTransactionActivitiesMainnet"
    | "nonTransactionActivitiesTestnet"

/**
 * Represents the activities related to an account.
 * It keeps transaction and non-transaction activities separate to facilitate handling
 * activities that are not transactions so they don't get mixed with transactional ones.
 *
 * Mapping account address => AccountActivities
 */
type ActivitiesSliceState = Record<string, AccountActivities>

export const initialActivitiesState: ActivitiesSliceState = {}

const upsertActivity = (
    transactionActivityKey: ActivityKeyType,
    nonTransactionActivityKey: ActivityKeyType,
    state: Draft<ActivitiesSliceState>,
    action: PayloadAction<{ address: string; activity: Activity }>,
) => {
    const { address, activity } = action.payload

    if (!state[address]) {
        state[address] = {
            transactionActivitiesMainnet: [],
            nonTransactionActivitiesMainnet: [],
            transactionActivitiesTestnet: [],
            nonTransactionActivitiesTestnet: [],
        }
    }

    if (ActivityUtils.isTransactionActivity(activity)) {
        const activityIndex = state[address][transactionActivityKey].findIndex(
            existingActivity =>
                existingActivity.id.toLowerCase() === activity.id.toLowerCase(),
        )

        if (activityIndex !== -1) {
            state[address][transactionActivityKey][activityIndex] = activity
        } else {
            state[address][transactionActivityKey].unshift(activity)
        }
    } else {
        const activityIndex = state[address][
            nonTransactionActivityKey
        ].findIndex(
            existingActivity =>
                existingActivity.id.toLowerCase() === activity.id.toLowerCase(),
        )

        if (activityIndex !== -1) {
            state[address][nonTransactionActivityKey][activityIndex] = activity
        } else {
            state[address][nonTransactionActivityKey].unshift(activity)
        }
    }
}

export const ActivitiesSlice = createSlice({
    name: "activities",
    initialState: initialActivitiesState,
    reducers: {
        /**
         * Updates or inserts a Mainnet activity for the given address.
         * It separately handles transactional and non-transactional activities.
         */
        upsertActivityMainnet: (state, action) =>
            upsertActivity(
                "transactionActivitiesMainnet",
                "nonTransactionActivitiesMainnet",
                state,
                action,
            ),
        /**
         * Updates or inserts a Testnet activity for the given address.
         * It separately handles transactional and non-transactional activities.
         */
        upsertActivityTestnet: (state, action) =>
            upsertActivity(
                "transactionActivitiesTestnet",
                "nonTransactionActivitiesTestnet",
                state,
                action,
            ),

        updateTransactionActivitiesMainnet: (
            state,
            action: PayloadAction<{ address: string; activities: Activity[] }>,
        ) => {
            const { address, activities: newActivities } = action.payload

            const existingActivities = state[address]

            if (!existingActivities) {
                state[address] = {
                    transactionActivitiesMainnet: newActivities,
                    nonTransactionActivitiesMainnet: [],
                    transactionActivitiesTestnet: [],
                    nonTransactionActivitiesTestnet: [],
                }
            } else {
                state[address] = {
                    ...existingActivities,
                    transactionActivitiesMainnet: newActivities,
                }
            }
        },
        updateTransactionActivitiesTestnet: (
            state,
            action: PayloadAction<{ address: string; activities: Activity[] }>,
        ) => {
            const { address, activities: newActivities } = action.payload

            const existingActivities = state[address]

            if (!existingActivities) {
                state[address] = {
                    transactionActivitiesMainnet: [],
                    nonTransactionActivitiesMainnet: [],
                    transactionActivitiesTestnet: newActivities,
                    nonTransactionActivitiesTestnet: [],
                }
            } else {
                state[address] = {
                    ...existingActivities,
                    transactionActivitiesTestnet: newActivities,
                }
            }
        },
        resetActivityState: () => initialActivitiesState,
    },
})

export const {
    upsertActivityMainnet,
    upsertActivityTestnet,
    updateTransactionActivitiesMainnet,
    updateTransactionActivitiesTestnet,
    resetActivityState,
} = ActivitiesSlice.actions
