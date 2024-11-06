import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { NotificationState } from "../Types"

export const initialNotificationState: NotificationState = {
    permissionEnabled: false,
}

export const Notification = createSlice({
    name: "notification",
    initialState: initialNotificationState,
    reducers: {
        updateNotificationPermission: (state, action: PayloadAction<boolean>) => {
            state.permissionEnabled = action.payload
        },
    },
})

export const { updateNotificationPermission } = Notification.actions
