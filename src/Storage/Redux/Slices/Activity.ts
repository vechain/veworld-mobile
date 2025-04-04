import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { Activity } from "~Model"
import { ActivityState } from "../Types"
import { ActivityUtils } from "~Utils"

export const initialActivitiesState: ActivityState = {
    activities: [],
}

export const ActivitiesSlice = createSlice({
    name: "activities",
    initialState: initialActivitiesState,
    reducers: {
        addActivity: (state, action: PayloadAction<Activity>) => {
            const activity = action.payload

            if (ActivityUtils.isTransactionActivity(activity)) {
                const activityIndex = state.activities.findIndex(
                    existingActivity => existingActivity.txId === activity.txId,
                )
                if (activityIndex !== -1) {
                    state.activities[activityIndex] = activity
                } else {
                    state.activities.unshift(activity)
                }
            } else {
                const activityIndex = state.activities.findIndex(
                    existingActivity => existingActivity.id.toLowerCase() === activity.id.toLowerCase(),
                )

                if (activityIndex !== -1) {
                    state.activities[activityIndex] = activity
                } else {
                    state.activities.unshift(activity)
                }
            }
        },
        removeActivity: (state, action: PayloadAction<string[]>) => {
            const newActivities: Activity[] = [...state.activities]
            action.payload.forEach(txId => {
                const index = newActivities.findIndex(activity => activity.txId === txId)
                if (index !== -1) {
                    newActivities.splice(index, 1)
                }
            })
            state.activities = newActivities
        },
        resetActivityState: () => initialActivitiesState,
    },
})

export const { addActivity, removeActivity, resetActivityState } = ActivitiesSlice.actions
