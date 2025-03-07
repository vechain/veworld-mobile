import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { Activity } from "~Model"
import { ActivityState } from "../Types"

export const initialActivitiesState: ActivityState = {
    activities: [],
}

export const ActivitiesSlice = createSlice({
    name: "activities",
    initialState: initialActivitiesState,
    reducers: {
        addActivity: (state, action: PayloadAction<Activity>) => {
            state.activities.push(action.payload)
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
