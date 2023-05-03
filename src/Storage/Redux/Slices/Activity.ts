import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { Activity } from "~Model"

type ActivitiesSliceState = Activity[]

export const initialActivitiesState: ActivitiesSliceState = []

export const ActivitiesSlice = createSlice({
    name: "activities",
    initialState: initialActivitiesState,
    reducers: {
        upsertActivity: (state, action: PayloadAction<Activity>) => {
            const newActivity = action.payload
            const activityExists = state.findIndex(
                activity => activity.id === newActivity.id,
            )
            if (activityExists !== -1) {
                state[activityExists] = newActivity
                return state
            }
            state.push(newActivity)
            return state
        },
    },
})

export const { upsertActivity } = ActivitiesSlice.actions
