import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { RootState } from "~Storage/Caches/cache"
import { Activity } from "~Model/Activity"
import AddressUtils from "~Common/Utils/AddressUtils"
import { ActivityType } from "~Model/Activity/enum"

export const initialActivityState: Activity[] = []

export const activitySlice = createSlice({
    name: "activities",
    initialState: initialActivityState,
    reducers: {
        updateActivities: (_, action: PayloadAction<Activity[]>) => {
            return action.payload
        },
    },
})

export const { updateActivities } = activitySlice.actions

/**
 * Gets all activities for the current account and network
 * @param state
 */
export const getCurrentActivities = (state: RootState) => {
    const acc = state.account.currentAccount
    const net = state.settings.network.currentNetwork

    return state.activities.filter(
        act =>
            AddressUtils.compareAddresses(act.from, acc?.address) &&
            act.networkId === net?.id,
    )
}

/**
 * Gets all activities for ALL accounts
 * @param state
 */
export const getAllActivities = (state: RootState) => state.activities

export const getActivity = (txId: string) => (state: RootState) => {
    return state.activities.find(activity => activity.id === txId)
}

/**
 * Get all activities with a finality status
 */
export const getActivitiesWithFinality =
    (final: boolean) => (state: RootState) => {
        return state.activities.filter(
            activity => activity.finality === final && activity.isTransaction,
        )
    }

/**
 * Get all activities with type ActivityType.FUNGIBLE_TOKEN for current account
 */
export const getCurrentFungibleTokenActivities = (state: RootState) => {
    return getCurrentActivities(state).filter(
        activity => activity.type === ActivityType.FUNGIBLE_TOKEN,
    )
}
