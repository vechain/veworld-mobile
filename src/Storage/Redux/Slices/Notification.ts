import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { NotificationState } from "../Types"

export const initialNotificationState: NotificationState = {
    permissionEnabled: false,
    optedIn: false,
}

export const Notification = createSlice({
    name: "notification",
    initialState: initialNotificationState,
    reducers: {
        updateNotificationPermission: (state, action: PayloadAction<boolean>) => {
            state.permissionEnabled = action.payload
        },
        updateNotificationOptedIn: (state, action: PayloadAction<boolean>) => {
            state.optedIn = action.payload
        },
    },
})

export const { updateNotificationPermission, updateNotificationOptedIn } = Notification.actions
