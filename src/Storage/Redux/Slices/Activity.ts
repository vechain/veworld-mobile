import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { PURGE } from "redux-persist"
import { Activity } from "~Model"

type ActivitiesSliceState = {
    activities: Activity[]
}

export const initialActivitiesState: ActivitiesSliceState = {
    activities: [],
}

export const ActivitiesSlice = createSlice({
    name: "activities",
    initialState: initialActivitiesState,
    reducers: {
        insertActivity: (state, action: PayloadAction<Activity>) => {
            const newActivity = action.payload
            const activityExists = state.activities.find(
                activity => activity.id === newActivity.id,
            )
            if (!activityExists) {
                state.activities.push(newActivity)
            }
        },
        updateActivity: (state, action: PayloadAction<Activity>) => {
            const updatedActivity = action.payload
            const activityExistsIndex = state.activities.findIndex(
                activity => activity.id === updatedActivity.id,
            )
            if (activityExistsIndex !== -1) {
                state.activities[activityExistsIndex] = updatedActivity
            }
        },
    },
    extraReducers: builder => {
        builder.addCase(PURGE, () => initialActivitiesState)
    },
})

export const { insertActivity, updateActivity } = ActivitiesSlice.actions
