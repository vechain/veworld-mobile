import { createSlice, PayloadAction } from "@reduxjs/toolkit"
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
            const activityExists = state.activities.find(
                activity => activity.id,
                action.payload.id,
            )
            if (!activityExists) {
                state.activities.push(action.payload)
            }
        },
    },
})

export const { insertActivity } = ActivitiesSlice.actions
